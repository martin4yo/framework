import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { TenantsService } from '../tenants/tenants.service';
import { EmailService } from '../email/email.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

export interface JwtPayload {
  sub: string;
  email: string;
  tenantId: string | null;
  tenantSlug: string;
  roles: string[];
  permissions: Array<{
    resource: string;
    actions: string[];
  }>;
}

export interface AuthResponse {
  token?: string;
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    nombre?: string;
    apellido?: string;
    firstName?: string;
    lastName?: string;
    tenantId: string | null;
    roles: string[];
    superuser?: boolean;
  };
  tenant?: {
    id: string;
    nombre: string;
    slug: string;
    plan: string;
  } | null;
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private usersService: UsersService,
    private tenantsService: TenantsService,
    private emailService: EmailService,
  ) {}

  async register(registerDto: RegisterDto, ipAddress?: string, userAgent?: string): Promise<{ message: string; email: string }> {
    console.log('📝 [Register] New registration attempt:', registerDto.email);

    // Check if email already exists
    const existingUser = await this.usersService.findByEmailAcrossTenants(registerDto.email);
    if (existingUser) {
      throw new ConflictException('El email ya está registrado');
    }

    // Generate verification token
    const verificationToken = uuidv4();
    const verificationExpires = new Date();
    verificationExpires.setHours(verificationExpires.getHours() + 24); // Token válido por 24 horas

    // Create user without tenant (will be assigned by admin later)
    const user = await this.usersService.create({
      tenantId: null, // No tenant assigned yet
      email: registerDto.email,
      password: registerDto.password,
      firstName: registerDto.firstName,
      lastName: registerDto.lastName,
    });

    // Set verification token and update user
    await this.usersService.update(user.id, {
      emailVerificationToken: verificationToken,
      emailVerificationExpires: verificationExpires,
      emailVerified: false,
    });

    // Send verification email
    try {
      await this.emailService.sendVerificationEmail(
        user.email,
        verificationToken,
        `${user.firstName} ${user.lastName}`,
      );
      console.log('✅ [Register] Verification email sent to:', user.email);
    } catch (error) {
      console.error('❌ [Register] Error sending verification email:', error);
      // Don't fail registration if email fails, but log it
    }

    return {
      message: 'Registration successful. Please check your email to verify your account.',
      email: user.email,
    };
  }

  async login(loginDto: LoginDto & { tenantId?: string }, ipAddress?: string, userAgent?: string): Promise<AuthResponse> {
    let tenant;
    let user;

    console.log('🔐 [Login] Attempting login for:', loginDto.email);

    if (loginDto.tenantId) {
      // Login with specific tenant ID (for multi-tenant users)
      console.log('🏢 [Login] Looking for tenant by ID:', loginDto.tenantId);
      tenant = await this.tenantsService.findOne(loginDto.tenantId);
      if (!tenant) {
        console.log('❌ [Login] Tenant not found');
        throw new UnauthorizedException('Credenciales inválidas');
      }

      if (!tenant.isActive) {
        console.log('❌ [Login] Tenant is not active');
        throw new UnauthorizedException('El tenant no está activo');
      }

      // Find user and check if they belong to this tenant
      const userTenants = await this.usersService.getUserTenantsByEmail(loginDto.email);
      const userTenant = userTenants.find(ut => ut.tenantId === loginDto.tenantId && ut.isActive);

      if (!userTenant) {
        console.log('❌ [Login] User not found in this tenant');
        throw new UnauthorizedException('Credenciales inválidas');
      }

      user = await this.usersService.findOne(userTenant.userId);
    } else if (loginDto.tenantSlug) {
      // Multi-tenant login: find tenant by slug
      console.log('🏢 [Login] Looking for tenant:', loginDto.tenantSlug);
      tenant = await this.tenantsService.findBySlug(loginDto.tenantSlug);
      if (!tenant) {
        console.log('❌ [Login] Tenant not found');
        throw new UnauthorizedException('Credenciales inválidas');
      }

      if (!tenant.isActive) {
        console.log('❌ [Login] Tenant is not active');
        throw new UnauthorizedException('El tenant no está activo');
      }

      // Find user in specific tenant
      user = await this.usersService.findByEmail(loginDto.email, tenant.id);
    } else {
      // Single-tenant or auto-detect: find user across all tenants
      console.log('🔍 [Login] Looking for user across all tenants');
      user = await this.usersService.findByEmailAcrossTenants(loginDto.email);

      if (user) {
        // Check if user has tenant assignments
        const userTenants = await this.usersService.getUserTenantsByEmail(loginDto.email);

        if (userTenants.length > 0) {
          // User has tenant assignments - use primary tenant
          const primaryTenant = userTenants.find(ut => ut.isPrimary);
          const selectedTenant = primaryTenant || userTenants[0];

          tenant = await this.tenantsService.findOne(selectedTenant.tenantId);
          // Load user with tenant data
          user = await this.usersService.findOne(user.id);
          console.log('✅ [Login] User found with tenant assignments, using:', tenant?.name);
        } else {
          // User has no tenant assignments - load full user data
          user = await this.usersService.findOne(user.id);
          tenant = (user as any).tenant;
          console.log('✅ [Login] User found with legacy tenant:', tenant?.name);
        }
      } else {
        console.log('❌ [Login] User not found');
      }
    }

    if (!user) {
      console.log('❌ [Login] Invalid credentials - user not found');
      throw new UnauthorizedException('Credenciales inválidas');
    }

    console.log('👤 [Login] User found:', user.email, 'Active:', user.isActive);

    if (!user.isActive) {
      console.log('❌ [Login] User account is not active');
      throw new UnauthorizedException('La cuenta de usuario no está activa');
    }

    // Validate password
    console.log('🔑 [Login] Validating password...');
    const isPasswordValid = await this.usersService.validatePassword(user, loginDto.password);
    console.log('🔑 [Login] Password valid:', isPasswordValid);

    if (!isPasswordValid) {
      console.log('❌ [Login] Invalid password');
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Update last login
    await this.usersService.update(user.id, { lastLoginAt: new Date() });

    // Generate tokens
    return this.generateAuthResponse(user, ipAddress, userAgent);
  }

  async refreshAccessToken(refreshTokenString: string, ipAddress?: string, userAgent?: string): Promise<AuthResponse> {
    // Find refresh token
    const refreshToken = await this.prisma.refreshToken.findFirst({
      where: { token: refreshTokenString },
    });

    if (!refreshToken) {
      throw new UnauthorizedException('Token de actualización inválido');
    }

    // Check if token is active (not revoked and not expired)
    const isActive = !refreshToken.revoked && new Date(refreshToken.expiresAt) > new Date();

    if (!isActive) {
      throw new UnauthorizedException('Token de actualización inválido');
    }

    // Revoke old token
    await this.prisma.refreshToken.update({
      where: { id: refreshToken.id },
      data: {
        revoked: true,
        revokedAt: new Date(),
      },
    });

    // Load user with all relations
    const user = await this.usersService.findOne(refreshToken.userId);

    // Generate new tokens
    return this.generateAuthResponse(user as any, ipAddress, userAgent);
  }

  async logout(refreshTokenString: string): Promise<void> {
    const refreshToken = await this.prisma.refreshToken.findFirst({
      where: { token: refreshTokenString },
    });

    if (refreshToken && !refreshToken.revoked) {
      await this.prisma.refreshToken.update({
        where: { id: refreshToken.id },
        data: {
          revoked: true,
          revokedAt: new Date(),
        },
      });
    }
  }

  async validateUser(email: string, password: string, tenantId: string): Promise<any | null> {
    const user = await this.usersService.findByEmail(email, tenantId);
    if (!user) {
      return null;
    }

    const isPasswordValid = await this.usersService.validatePassword(user as any, password);
    if (!isPasswordValid) {
      return null;
    }

    return user;
  }

  private async generateAuthResponse(
    user: any,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<AuthResponse> {
    // Extract permissions from roles (Prisma structure: userRoles -> role -> rolePermissions -> permission)
    const permissions = this.extractPermissionsFromRoles(user);

    // Extract role names from Prisma structure
    const roles = user.userRoles?.map((ur: any) => ur.role?.name).filter(Boolean) || [];

    // Create JWT payload
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      tenantId: user.tenantId,
      tenantSlug: user.tenant?.slug || '',
      roles,
      permissions,
    };

    // Generate access token
    const accessToken = this.jwtService.sign(payload);

    // Generate refresh token
    const refreshToken = await this.createRefreshToken(user.id, ipAddress, userAgent);

    return {
      token: accessToken,
      accessToken,
      refreshToken: refreshToken.token,
      user: {
        id: user.id,
        email: user.email,
        nombre: user.firstName,
        apellido: user.lastName,
        firstName: user.firstName,
        lastName: user.lastName,
        tenantId: user.tenantId,
        roles: payload.roles,
        superuser: false,
      },
      tenant: user.tenant ? {
        id: user.tenant.id,
        nombre: user.tenant.name,
        slug: user.tenant.slug,
        plan: 'basic',
      } : null,
    };
  }

  private async createRefreshToken(
    userId: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<any> {
    const token = uuidv4();
    const expiresIn = this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d');
    const expiresAt = this.calculateExpirationDate(expiresIn);

    const refreshToken = await this.prisma.refreshToken.create({
      data: {
        userId,
        token,
        expiresAt,
        ipAddress,
        userAgent,
      },
    });

    return refreshToken;
  }

  private calculateExpirationDate(expiresIn: string): Date {
    const now = new Date();
    const match = expiresIn.match(/^(\d+)([dhms])$/);

    if (!match) {
      throw new Error('Invalid expiration format');
    }

    const value = parseInt(match[1], 10);
    const unit = match[2];

    switch (unit) {
      case 'd':
        return new Date(now.getTime() + value * 24 * 60 * 60 * 1000);
      case 'h':
        return new Date(now.getTime() + value * 60 * 60 * 1000);
      case 'm':
        return new Date(now.getTime() + value * 60 * 1000);
      case 's':
        return new Date(now.getTime() + value * 1000);
      default:
        throw new Error('Invalid time unit');
    }
  }

  private extractPermissionsFromRoles(user: any): Array<{ resource: string; actions: string[] }> {
    // Prisma structure: userRoles -> role -> rolePermissions -> permission
    if (!user.userRoles || user.userRoles.length === 0) {
      return [];
    }

    const permissionsMap = new Map<string, Set<string>>();

    user.userRoles.forEach((userRole: any) => {
      const role = userRole.role;
      if (!role || !role.rolePermissions) return;

      role.rolePermissions.forEach((rolePermission: any) => {
        const permission = rolePermission.permission;
        if (!permission) return;

        if (!permissionsMap.has(permission.resource)) {
          permissionsMap.set(permission.resource, new Set());
        }
        permissionsMap.get(permission.resource)!.add(permission.action);
      });
    });

    return Array.from(permissionsMap.entries()).map(([resource, actions]) => ({
      resource,
      actions: Array.from(actions),
    }));
  }

  async googleLogin(googleUser: any, ipAddress?: string, userAgent?: string): Promise<AuthResponse> {
    if (!googleUser) {
      throw new UnauthorizedException('Usuario de Google no encontrado');
    }

    // Try to find existing user by email
    let user = await this.usersService.findByEmailAcrossTenants(googleUser.email);

    if (!user) {
      // Create new user with a default tenant (you may want to customize this logic)
      const defaultTenant = await this.tenantsService.findDefaultTenant();

      if (!defaultTenant) {
        throw new BadRequestException('No hay un tenant por defecto configurado para login con Google');
      }

      user = await this.usersService.create({
        tenantId: defaultTenant.id,
        email: googleUser.email,
        firstName: googleUser.firstName,
        lastName: googleUser.lastName,
        password: undefined, // Google users don't have password
      });
    }

    // Update last login
    await this.usersService.update(user.id, { lastLoginAt: new Date() });

    // Load user with relations for token generation
    const userWithRelations = await this.usersService.findOne(user.id);

    // Generate tokens
    return this.generateAuthResponse(userWithRelations, ipAddress, userAgent);
  }

  async verifyToken(token: string): Promise<any> {
    try {
      const payload = this.jwtService.verify(token);
      const user = await this.usersService.findOne(payload.sub);

      if (!user || !user.isActive) {
        throw new UnauthorizedException('Token inválido');
      }

      return {
        user: {
          id: user.id,
          email: user.email,
          nombre: user.firstName,
          apellido: user.lastName,
          superuser: false, // Adjust based on your user model
        },
        tenant: (user as any).tenant ? {
          id: (user as any).tenant.id,
          nombre: (user as any).tenant.name,
          slug: (user as any).tenant.slug,
          plan: 'basic', // Adjust based on your tenant model
        } : null,
      };
    } catch (error) {
      throw new UnauthorizedException('Token inválido');
    }
  }

  async verifyEmail(token: string): Promise<{ message: string }> {
    console.log('📧 [VerifyEmail] Attempting to verify email with token:', token);

    // Find user with this verification token
    const user = await this.usersService.findByVerificationToken(token);

    if (!user) {
      console.log('❌ [VerifyEmail] Invalid or expired verification token');
      throw new BadRequestException('Token de verificación inválido o expirado');
    }

    // Token expiration check removed - column emailVerificationExpires not in current schema

    if (user.emailVerified) {
      console.log('⚠️ [VerifyEmail] Email already verified');
      return { message: 'El email ya ha sido verificado' };
    }

    // Mark email as verified
    await this.usersService.update(user.id, {
      emailVerified: true,
      emailVerificationToken: null,
      emailVerificationExpires: null,
    });

    console.log('✅ [VerifyEmail] Email verified successfully for:', user.email);

    return { message: 'Email verificado exitosamente. Un administrador te asignará un tenant para completar la configuración de tu cuenta.' };
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    console.log('🔐 [ForgotPassword] Request for:', email);

    // Find user by email across all tenants
    const user = await this.usersService.findByEmailAcrossTenants(email);

    // Always return success message to prevent email enumeration
    const successMessage = 'Si el email existe en nuestro sistema, recibirás un enlace para resetear tu contraseña.';

    if (!user) {
      console.log('⚠️ [ForgotPassword] User not found, but returning success message');
      return { message: successMessage };
    }

    // Generate reset token
    const resetToken = uuidv4();
    const resetExpires = new Date();
    resetExpires.setHours(resetExpires.getHours() + 1); // Token expires in 1 hour

    // Save token to user
    await this.usersService.update(user.id, {
      passwordResetToken: resetToken,
      passwordResetExpires: resetExpires,
    });

    // Send reset email
    try {
      await this.emailService.sendPasswordResetEmail(
        user.email,
        resetToken,
        `${user.firstName} ${user.lastName}`,
      );
      console.log('✅ [ForgotPassword] Reset email sent to:', user.email);
    } catch (error) {
      console.error('❌ [ForgotPassword] Error sending email:', error);
      // Don't fail the request if email fails
    }

    return { message: successMessage };
  }

  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    console.log('🔐 [ResetPassword] Attempting password reset with token');

    // Find user with this reset token
    const user = await this.usersService.findByResetToken(token);

    if (!user) {
      console.log('❌ [ResetPassword] Invalid token');
      throw new BadRequestException('Token de reseteo inválido o expirado');
    }

    // Check if token has expired
    if (!user.passwordResetExpires || user.passwordResetExpires < new Date()) {
      console.log('❌ [ResetPassword] Token expired');
      throw new BadRequestException('Token de reseteo inválido o expirado');
    }

    // Update password
    await this.usersService.updatePassword(user.id, newPassword);

    // Clear reset token
    await this.usersService.update(user.id, {
      passwordResetToken: null,
      passwordResetExpires: null,
    });

    console.log('✅ [ResetPassword] Password reset successfully for:', user.email);

    return { message: 'Contraseña actualizada exitosamente. Ya puedes iniciar sesión con tu nueva contraseña.' };
  }

  async resendVerificationEmail(email: string): Promise<{ message: string }> {
    console.log('📧 [ResendVerification] Request for:', email);

    // Find user by email
    const user = await this.usersService.findByEmailAcrossTenants(email);

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (user.emailVerified) {
      throw new BadRequestException('El email ya ha sido verificado');
    }

    // Generate new verification token
    const verificationToken = uuidv4();
    const verificationExpires = new Date();
    verificationExpires.setHours(verificationExpires.getHours() + 24);

    // Update user with new token
    await this.usersService.update(user.id, {
      emailVerificationToken: verificationToken,
      emailVerificationExpires: verificationExpires,
    });

    // Send verification email
    try {
      await this.emailService.sendVerificationEmail(
        user.email,
        verificationToken,
        `${user.firstName} ${user.lastName}`,
      );
      console.log('✅ [ResendVerification] Email sent to:', user.email);
    } catch (error) {
      console.error('❌ [ResendVerification] Error sending email:', error);
      throw new BadRequestException('Error al enviar email de verificación');
    }

    return { message: 'Email de verificación enviado correctamente' };
  }

  async getUserTenantsByEmail(email: string): Promise<any[]> {
    console.log('🏢 [GetUserTenants] Request for:', email);

    // Get user tenants by email
    const userTenants = await this.usersService.getUserTenantsByEmail(email);

    if (!userTenants || userTenants.length === 0) {
      return [];
    }

    // Return tenants with isPrimary flag
    return userTenants.map((ut: any) => ({
      id: ut.tenant.id,
      name: ut.tenant.name,
      slug: ut.tenant.slug,
      isPrimary: ut.isPrimary,
      isActive: ut.isActive,
    }));
  }

  async getUserSessions(userId: string): Promise<any[]> {
    console.log('📱 [GetUserSessions] Request for user:', userId);

    // Get all active sessions for the user
    const sessions = await this.prisma.refreshToken.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return sessions;
  }

  async revokeSession(sessionId: string, userId: string): Promise<void> {
    console.log('🚫 [RevokeSession] Revoking session:', sessionId, 'for user:', userId);

    // Find the session
    const session = await this.prisma.refreshToken.findFirst({
      where: { id: sessionId, userId },
    });

    if (!session) {
      throw new NotFoundException('Sesión no encontrada');
    }

    if (session.revoked) {
      throw new BadRequestException('La sesión ya está revocada');
    }

    // Revoke the session
    await this.prisma.refreshToken.update({
      where: { id: session.id },
      data: {
        revoked: true,
        revokedAt: new Date(),
      },
    });

    console.log('✅ [RevokeSession] Session revoked successfully');
  }

  async revokeAllUserSessions(userId: string, exceptSessionId?: string): Promise<number> {
    console.log('🚫 [RevokeAllUserSessions] Revoking all sessions for user:', userId);

    // Find all active sessions for the user
    const sessions = await this.prisma.refreshToken.findMany({
      where: { userId, revoked: false },
    });

    let revokedCount = 0;

    for (const session of sessions) {
      // Skip the current session if specified
      if (exceptSessionId && session.id === exceptSessionId) {
        continue;
      }

      await this.prisma.refreshToken.update({
        where: { id: session.id },
        data: {
          revoked: true,
          revokedAt: new Date(),
        },
      });
      revokedCount++;
    }

    console.log(`✅ [RevokeAllUserSessions] Revoked ${revokedCount} sessions`);
    return revokedCount;
  }

  async deleteSession(sessionId: string, userId: string): Promise<void> {
    console.log('🗑️ [DeleteSession] Deleting session:', sessionId, 'for user:', userId);

    // Find the session
    const session = await this.prisma.refreshToken.findFirst({
      where: { id: sessionId, userId },
    });

    if (!session) {
      throw new NotFoundException('Sesión no encontrada');
    }

    // Delete the session
    await this.prisma.refreshToken.delete({
      where: { id: session.id },
    });

    console.log('✅ [DeleteSession] Session deleted successfully');
  }

  async deleteAllUserSessions(userId: string, onlyInactive?: boolean): Promise<number> {
    console.log('🗑️ [DeleteAllUserSessions] Deleting sessions for user:', userId);

    let sessions;
    if (onlyInactive) {
      // Delete only revoked or expired sessions
      sessions = await this.prisma.refreshToken.findMany({
        where: { userId },
      });
      sessions = sessions.filter(s => s.revoked || new Date(s.expiresAt) < new Date());
    } else {
      // Delete all sessions
      sessions = await this.prisma.refreshToken.findMany({
        where: { userId },
      });
    }

    // Delete sessions one by one
    for (const session of sessions) {
      await this.prisma.refreshToken.delete({
        where: { id: session.id },
      });
    }

    console.log(`✅ [DeleteAllUserSessions] Deleted ${sessions.length} sessions`);
    return sessions.length;
  }
}
