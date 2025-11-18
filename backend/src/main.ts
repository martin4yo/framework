import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  // Security Headers with Helmet
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
    crossOriginEmbedderPolicy: false, // Desactivado para desarrollo
  }));

  // Global prefix
  const apiPrefix = configService.get('API_PREFIX', 'api');
  app.setGlobalPrefix(apiPrefix);

  // CORS mejorado
  const corsOrigins = configService.get('CORS_ORIGINS', 'http://localhost:3050').split(',');
  const isDevelopment = configService.get('NODE_ENV') !== 'production';

  app.enableCors({
    origin: isDevelopment ? corsOrigins : (origin, callback) => {
      if (!origin || corsOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['X-Total-Count', 'X-Page', 'X-Per-Page'],
    maxAge: 3600, // Cache preflight requests for 1 hour
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  const port = configService.get('PORT', 3000);
  await app.listen(port);

  console.log(`
  ╔═══════════════════════════════════════════════╗
  ║                                               ║
  ║         AXIOMACLOUD is running!              ║
  ║                                               ║
  ║   API: http://localhost:${port}/${apiPrefix}              ║
  ║   Environment: ${configService.get('NODE_ENV')}                     ║
  ║   Database: ${configService.get('DB_DATABASE')}                   ║
  ║   CORS: ${corsOrigins.join(', ')}
  ║   Rate Limiting: ENABLED                      ║
  ║   Security Headers: ENABLED                   ║
  ║                                               ║
  ╚═══════════════════════════════════════════════╝
  `);
}

bootstrap();
