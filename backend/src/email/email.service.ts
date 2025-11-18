import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private initializationPromise: Promise<void>;

  constructor(private configService: ConfigService) {
    // Para desarrollo: usar Ethereal (emails de prueba)
    // Para producción: configurar SMTP real (Gmail, SendGrid, etc.)
    this.initializationPromise = this.initializeTransporter();
  }

  private async initializeTransporter(): Promise<void> {
    const emailProvider = this.configService.get<string>('EMAIL_PROVIDER', 'ethereal');

    if (emailProvider === 'ethereal') {
      // Crear cuenta de prueba en Ethereal
      const testAccount = await nodemailer.createTestAccount();

      this.transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });

      console.log('📧 [EmailService] Using Ethereal for testing');
      console.log('📧 [EmailService] User:', testAccount.user);
    } else {
      // Configuración SMTP real
      const smtpHost = this.configService.get<string>('SMTP_HOST');
      const smtpPort = this.configService.get<number>('SMTP_PORT', 587);
      const smtpUser = this.configService.get<string>('SMTP_USER');

      console.log('📧 [EmailService] Configuring SMTP...');
      console.log('📧 [EmailService] Host:', smtpHost);
      console.log('📧 [EmailService] Port:', smtpPort);
      console.log('📧 [EmailService] User:', smtpUser);

      this.transporter = nodemailer.createTransport({
        service: 'gmail', // Usar el servicio predefinido de Gmail
        auth: {
          user: smtpUser,
          pass: this.configService.get<string>('SMTP_PASS'),
        },
      });

      console.log('📧 [EmailService] Using Gmail service');
    }
  }

  async sendVerificationEmail(to: string, token: string, userName: string): Promise<void> {
    await this.initializationPromise;
    if (!this.transporter) {
      throw new Error('Email transporter not initialized');
    }

    const frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:3050');
    const verificationLink = `${frontendUrl}/auth/verify-email?token=${token}`;

    const mailOptions = {
      from: this.configService.get<string>('EMAIL_FROM', '"AxiomaCloud" <noreply@axiomacloud.com>'),
      to,
      subject: 'Verifica tu cuenta - AxiomaCloud',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
              .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>¡Bienvenido a AxiomaCloud!</h1>
              </div>
              <div class="content">
                <p>Hola ${userName},</p>
                <p>Gracias por registrarte en AxiomaCloud. Para completar tu registro, por favor verifica tu dirección de email haciendo click en el botón de abajo:</p>

                <div style="text-align: center;">
                  <a href="${verificationLink}" class="button">Verificar Email</a>
                </div>

                <p>O copia y pega este enlace en tu navegador:</p>
                <p style="background: white; padding: 10px; border-radius: 5px; word-break: break-all;">
                  ${verificationLink}
                </p>

                <p><strong>Nota:</strong> Una vez verificada tu cuenta, un administrador deberá asignarte un tenant para que puedas acceder al sistema.</p>

                <p>Si no creaste esta cuenta, puedes ignorar este email.</p>

                <p>Saludos,<br>El equipo de AxiomaCloud</p>
              </div>
              <div class="footer">
                <p>Este es un email automático, por favor no respondas.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('📧 [EmailService] Verification email sent:', info.messageId);

      // Si estamos usando Ethereal, mostrar URL de preview
      if (nodemailer.getTestMessageUrl(info)) {
        console.log('📧 [EmailService] Preview URL:', nodemailer.getTestMessageUrl(info));
      }
    } catch (error) {
      console.error('❌ [EmailService] Error sending email:', error);
      throw error;
    }
  }

  async sendPasswordResetEmail(to: string, token: string, userName: string): Promise<void> {
    await this.initializationPromise;
    if (!this.transporter) {
      throw new Error('Email transporter not initialized');
    }

    const frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:3050');
    const resetLink = `${frontendUrl}/auth/reset-password?token=${token}`;

    const mailOptions = {
      from: this.configService.get<string>('EMAIL_FROM', '"AxiomaCloud" <noreply@axiomacloud.com>'),
      to,
      subject: 'Resetear Contraseña - AxiomaCloud',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
              .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Resetear Contraseña</h1>
              </div>
              <div class="content">
                <p>Hola ${userName},</p>
                <p>Recibimos una solicitud para resetear tu contraseña. Haz click en el botón de abajo para continuar:</p>

                <div style="text-align: center;">
                  <a href="${resetLink}" class="button">Resetear Contraseña</a>
                </div>

                <p>O copia y pega este enlace en tu navegador:</p>
                <p style="background: white; padding: 10px; border-radius: 5px; word-break: break-all;">
                  ${resetLink}
                </p>

                <p><strong>Este enlace expirará en 1 hora.</strong></p>

                <p>Si no solicitaste resetear tu contraseña, puedes ignorar este email.</p>

                <p>Saludos,<br>El equipo de AxiomaCloud</p>
              </div>
              <div class="footer">
                <p>Este es un email automático, por favor no respondas.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('📧 [EmailService] Password reset email sent:', info.messageId);

      if (nodemailer.getTestMessageUrl(info)) {
        console.log('📧 [EmailService] Preview URL:', nodemailer.getTestMessageUrl(info));
      }
    } catch (error) {
      console.error('❌ [EmailService] Error sending email:', error);
      throw error;
    }
  }
}
