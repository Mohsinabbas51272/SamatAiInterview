import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('Prisma connected successfully');
    } catch (error: any) {
      this.logger.error('Failed to connect to database:', error.message);
      // Don't crash - let the error propagate to the endpoint
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
