import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AssignTenantDto } from './dto/assign-tenant.dto';
import { UnassignTenantDto } from './dto/unassign-tenant.dto';
import { AssignRoleDto } from './dto/assign-role.dto';
import { UnassignRoleDto } from './dto/unassign-role.dto';
import { User, UserTenant } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.prisma.user.findFirst({
      where: {
        tenantId: createUserDto.tenantId ?? null,
        email: createUserDto.email,
      },
    });

    if (existingUser) {
      throw new ConflictException('Ya existe un usuario con este email en este tenant');
    }

    let passwordHash: string | undefined;

    // Only hash password if provided (Google users don't have password)
    if (createUserDto.password && createUserDto.password.trim() !== '') {
      const bcryptRounds = parseInt(this.configService.get<string>('BCRYPT_ROUNDS', '10'), 10);
      passwordHash = await bcrypt.hash(createUserDto.password, bcryptRounds);
    }

    const { password, ...userData } = createUserDto;

    return this.prisma.user.create({
      data: {
        ...userData,
        passwordHash,
      },
    });
  }

  async findAll(tenantId?: string): Promise<User[]> {
    return this.prisma.user.findMany({
      where: tenantId ? { tenantId } : {},
      include: {
        tenant: true,
        userRoles: {
          include: {
            role: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        tenant: true,
        userRoles: {
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`Usuario con ID "${id}" no encontrado`);
    }

    return user;
  }

  async findByEmail(email: string, tenantId: string): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: { email, tenantId },
      include: {
        userRoles: {
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    await this.findOne(id);

    const updateData: any = { ...updateUserDto };
    delete updateData.password;

    // If password is provided, hash it
    if (updateUserDto.password && updateUserDto.password.trim() !== '') {
      const bcryptRounds = parseInt(this.configService.get<string>('BCRYPT_ROUNDS', '10'), 10);
      updateData.passwordHash = await bcrypt.hash(updateUserDto.password, bcryptRounds);
    }

    return this.prisma.user.update({
      where: { id },
      data: updateData,
    });
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async updatePassword(id: string, newPassword: string): Promise<void> {
    await this.findOne(id);
    const bcryptRounds = parseInt(this.configService.get<string>('BCRYPT_ROUNDS', '10'), 10);
    const passwordHash = await bcrypt.hash(newPassword, bcryptRounds);

    await this.prisma.user.update({
      where: { id },
      data: { passwordHash },
    });
  }

  async validatePassword(user: User, password: string): Promise<boolean> {
    if (!user.passwordHash) {
      return false; // Users with no password (Google OAuth) cannot login with password
    }
    return bcrypt.compare(password, user.passwordHash);
  }

  async findByEmailAcrossTenants(email: string): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: { email },
      include: {
        tenant: true,
        userRoles: {
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  async findByVerificationToken(token: string): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: { emailVerificationToken: token },
      include: {
        tenant: true,
        userRoles: {
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  async findByResetToken(token: string): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: { passwordResetToken: token },
      include: {
        tenant: true,
        userRoles: {
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  // Tenant assignment methods
  async assignTenant(assignTenantDto: AssignTenantDto): Promise<UserTenant> {
    const { userId, tenantId, isPrimary } = assignTenantDto;

    // Verificar que el usuario existe
    const user = await this.findOne(userId);
    if (!user) {
      throw new NotFoundException(`Usuario con ID "${userId}" no encontrado`);
    }

    // Verificar si ya existe la asignación
    const existingAssignment = await this.prisma.userTenant.findFirst({
      where: { userId, tenantId },
    });

    if (existingAssignment) {
      throw new ConflictException('El usuario ya está asignado a este tenant');
    }

    // Si se marca como primario, desmarcar otros como primarios
    if (isPrimary) {
      await this.prisma.userTenant.updateMany({
        where: { userId, isPrimary: true },
        data: { isPrimary: false },
      });
    }

    // Crear la asignación
    return this.prisma.userTenant.create({
      data: {
        userId,
        tenantId,
        isPrimary: isPrimary ?? false,
      },
    });
  }

  async unassignTenant(unassignTenantDto: UnassignTenantDto): Promise<void> {
    const { userId, tenantId } = unassignTenantDto;

    const assignment = await this.prisma.userTenant.findFirst({
      where: { userId, tenantId },
    });

    if (!assignment) {
      throw new NotFoundException('Asignación no encontrada');
    }

    await this.prisma.userTenant.delete({
      where: { id: assignment.id },
    });
  }

  async getUserTenants(userId: string): Promise<UserTenant[]> {
    return this.prisma.userTenant.findMany({
      where: { userId, isActive: true },
      include: { tenant: true },
      orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }],
    });
  }

  async getUserTenantsByEmail(email: string): Promise<UserTenant[]> {
    // Find user by email
    const user = await this.findByEmailAcrossTenants(email);
    if (!user) {
      return [];
    }

    // Get all tenants for this user
    return this.prisma.userTenant.findMany({
      where: { userId: user.id, isActive: true },
      include: { tenant: true },
      orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }],
    });
  }

  async setPrimaryTenant(userId: string, tenantId: string): Promise<void> {
    // Desmarcar todos como no primarios
    await this.prisma.userTenant.updateMany({
      where: { userId },
      data: { isPrimary: false },
    });

    // Marcar el seleccionado como primario
    const result = await this.prisma.userTenant.updateMany({
      where: { userId, tenantId },
      data: { isPrimary: true },
    });

    if (result.count === 0) {
      throw new NotFoundException('Asignación no encontrada');
    }
  }

  async getTenantUsers(tenantId: string): Promise<UserTenant[]> {
    return this.prisma.userTenant.findMany({
      where: { tenantId, isActive: true },
      include: { user: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Role assignment methods
  async assignRole(assignRoleDto: AssignRoleDto): Promise<any> {
    const { userId, roleId, assignedBy } = assignRoleDto;

    // Verificar que el usuario existe
    const user = await this.findOne(userId);
    if (!user) {
      throw new NotFoundException(`Usuario con ID "${userId}" no encontrado`);
    }

    // Verificar que el rol existe
    const role = await this.prisma.role.findUnique({ where: { id: roleId } });
    if (!role) {
      throw new NotFoundException(`Rol con ID "${roleId}" no encontrado`);
    }

    // Verificar si ya existe la asignación
    const existingAssignment = await this.prisma.userRole.findUnique({
      where: {
        userId_roleId: { userId, roleId },
      },
    });

    if (existingAssignment) {
      throw new ConflictException('El usuario ya tiene este rol asignado');
    }

    // Crear la asignación
    return this.prisma.userRole.create({
      data: {
        userId,
        roleId,
        assigned_by: assignedBy,
      },
      include: {
        role: true,
      },
    });
  }

  async unassignRole(unassignRoleDto: UnassignRoleDto): Promise<void> {
    const { userId, roleId } = unassignRoleDto;

    const assignment = await this.prisma.userRole.findUnique({
      where: {
        userId_roleId: { userId, roleId },
      },
    });

    if (!assignment) {
      throw new NotFoundException('Asignación de rol no encontrada');
    }

    await this.prisma.userRole.delete({
      where: {
        userId_roleId: { userId, roleId },
      },
    });
  }

  async getUserRoles(userId: string): Promise<any[]> {
    return this.prisma.userRole.findMany({
      where: { userId },
      include: {
        role: {
          include: {
            rolePermissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });
  }
}
