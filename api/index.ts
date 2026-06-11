// @ts-nocheck
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from '../backend/src/app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';

const express = require('express');
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
  console.log(`[Vercel Serverless] Incoming request: ${req.method} ${req.url}`);
  
  try {
    if (!appPromise) {
      appPromise = bootstrap();
    }
    
    if (bootstrapError) {
      console.error('[Vercel Serverless] Bootstrapping was in error state:', bootstrapError);
      return res.status(503).json({
        success: false,
        statusCode: 503,
        message: 'Service temporarily unavailable. Database connection or initialization error.',
        error: bootstrapError.message,
        stack: process.env.NODE_ENV === 'development' ? bootstrapError.stack : undefined,
        timestamp: new Date().toISOString(),
      });
    }
    
    await appPromise;
    server(req, res);
  } catch (error: any) {
    console.error('[Vercel Serverless] Request handling error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error?.message || 'Unknown error during initialization',
      stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined,
    });
  }
};
