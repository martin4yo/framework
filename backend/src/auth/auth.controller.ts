import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Get,
  Req,
  Ip,
  Res,
  Param,
} from '@nestjs/common';
import { Response } from 'express';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { Public } from './decorators/public.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @Throttle({ default: { limit: 3, ttl: 60000 } }) // 3 registros por minuto
  async register(
    @Body() registerDto: RegisterDto,
    @Ip() ipAddress: string,
    @Req() req: Request,
  ) {
    const userAgent = req.headers['user-agent'];
    return this.authService.register(registerDto, ipAddress, userAgent);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 intentos de login por minuto
  async login(@Body() loginDto: LoginDto, @Ip() ipAddress: string, @Req() req: Request) {
    const userAgent = req.headers['user-agent'];
    return this.authService.login(loginDto, ipAddress, userAgent);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshToken(
    @Body() refreshTokenDto: RefreshTokenDto,
    @Ip() ipAddress: string,
    @Req() req: Request,
  ) {
    const userAgent = req.headers['user-agent'];
    return this.authService.refreshAccessToken(refreshTokenDto.refreshToken, ipAddress, userAgent);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@Body() refreshTokenDto: RefreshTokenDto) {
    await this.authService.logout(refreshTokenDto.refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@CurrentUser() user: any) {
    return {
      id: user.userId,
      email: user.email,
      tenantId: user.tenantId,
      tenantSlug: user.tenantSlug,
      roles: user.roles,
      permissions: user.permissions,
    };
  }

  @Public()
  @Get('google')
  @UseGuards(GoogleAuthGuard)
  async googleAuth() {
    // Guard redirects to Google
  }

  @Public()
  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleAuthCallback(@Req() req: Request, @Res() res: Response, @Ip() ipAddress: string) {
    try {
      const userAgent = req.headers['user-agent'];
      const authResponse = await this.authService.googleLogin(req.user, ipAddress, userAgent);

      const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3050';

      // Redirect to frontend with token
      res.redirect(`${frontendUrl}/auth/google/callback?token=${authResponse.accessToken}`);
    } catch (error) {
      const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3050';
      res.redirect(`${frontendUrl}/auth/google/callback?error=authentication_failed`);
    }
  }

  @Public()
  @Post('verify-token')
  @HttpCode(HttpStatus.OK)
  async verifyToken(@Body() body: { token: string }) {
    return this.authService.verifyToken(body.token);
  }

  @Public()
  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  async verifyEmail(@Body() body: { token: string }) {
    return this.authService.verifyEmail(body.token);
  }

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 3, ttl: 60000 } }) // 3 solicitudes de reset por minuto
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto.email);
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 3, ttl: 60000 } }) // 3 intentos de reset por minuto
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto.token, resetPasswordDto.password);
  }

  @Post('resend-verification')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 3, ttl: 60000 } }) // 3 solicitudes por minuto
  async resendVerificationEmail(@Body() body: { email: string }) {
    return this.authService.resendVerificationEmail(body.email);
  }

  @Public()
  @Post('user-tenants')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 solicitudes por minuto
  async getUserTenantsByEmail(@Body() body: { email: string }) {
    return this.authService.getUserTenantsByEmail(body.email);
  }

  @UseGuards(JwtAuthGuard)
  @Get('sessions')
  @HttpCode(HttpStatus.OK)
  async getUserSessions(@CurrentUser() user: any) {
    return this.authService.getUserSessions(user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('sessions/:sessionId/revoke')
  @HttpCode(HttpStatus.OK)
  async revokeSession(@Param('sessionId') sessionId: string, @CurrentUser() user: any) {
    await this.authService.revokeSession(sessionId, user.userId);
    return { message: 'Sesión revocada exitosamente' };
  }

  @UseGuards(JwtAuthGuard)
  @Post('sessions/revoke-all')
  @HttpCode(HttpStatus.OK)
  async revokeAllSessions(@CurrentUser() user: any, @Body() body: { exceptCurrent?: boolean }) {
    // Get current session ID from refresh token if needed
    const exceptSessionId = body.exceptCurrent ? undefined : undefined; // TODO: Get from request
    const count = await this.authService.revokeAllUserSessions(user.userId, exceptSessionId);
    return { message: `${count} sesiones revocadas exitosamente` };
  }

  @UseGuards(JwtAuthGuard)
  @Post('sessions/:sessionId/delete')
  @HttpCode(HttpStatus.OK)
  async deleteSession(@Param('sessionId') sessionId: string, @CurrentUser() user: any) {
    await this.authService.deleteSession(sessionId, user.userId);
    return { message: 'Sesión eliminada exitosamente' };
  }

  @UseGuards(JwtAuthGuard)
  @Post('sessions/delete-all')
  @HttpCode(HttpStatus.OK)
  async deleteAllSessions(@CurrentUser() user: any, @Body() body: { onlyInactive?: boolean }) {
    const count = await this.authService.deleteAllUserSessions(user.userId, body.onlyInactive);
    return { message: `${count} sesiones eliminadas exitosamente` };
  }
}
