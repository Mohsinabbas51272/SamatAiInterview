import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errors: any = null;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exResponse = exception.getResponse();
      if (typeof exResponse === 'string') {
        message = exResponse;
      } else if (typeof exResponse === 'object') {
        const resp = exResponse as any;
        message = resp.message || message;
        errors = resp.errors || null;
        if (Array.isArray(resp.message)) {
          errors = resp.message;
          message = 'Validation failed';
        }
      }
    } else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      status = HttpStatus.BAD_REQUEST;
      if (exception.code === 'P2002') {
        message = 'A record with this value already exists';
        errors = exception.meta;
      } else if (exception.code === 'P2025') {
        status = HttpStatus.NOT_FOUND;
        message = 'Record not found';
      } else {
        message = 'Database error';
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    this.logger.error(
      `${request.method} ${request.url} → ${status}: ${message}`,
      exception instanceof Error ? exception.stack : '',
    );

    response.status(status).json({
      success: false,
      statusCode: status,
      message,
      errors,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}
