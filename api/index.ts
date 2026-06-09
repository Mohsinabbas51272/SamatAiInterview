import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from '../backend/src/app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import * as express from 'express';

const server = express();
let appPromise: Promise<void> | null = null;
let bootstrapError: Error | null = null;

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule, new ExpressAdapter(server), {
      logger: ['error', 'warn', 'log'],
    });

    // Match the global prefix configured in the NestJS application
    app.setGlobalPrefix('api/v1');

    const configService = app.get(ConfigService);
    const frontendUrl = configService.get<string>('FRONTEND_URL', '*');

    // CORS configuration
    app.enableCors({
      origin: frontendUrl === '*' ? true : frontendUrl.split(',').map(o => o.trim()),
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    });

    // Global validation pipes
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );

    await app.init();
    console.log('NestJS app initialized successfully for Vercel');
  } catch (error) {
    console.error('Failed to bootstrap NestJS app:', error);
    bootstrapError = error as Error;
    throw error;
  }
}

export default async (req: any, res: any) => {
  try {
    if (!appPromise) {
      appPromise = bootstrap();
    }
    await appPromise;
    server(req, res);
  } catch (error: any) {
    console.error('Serverless function error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: bootstrapError?.message || error?.message || 'Unknown error during initialization',
      stack: process.env.NODE_ENV !== 'production' ? (bootstrapError?.stack || error?.stack) : undefined,
    });
  }
};
