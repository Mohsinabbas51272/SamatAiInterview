import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuditLogsService {
  constructor(private prisma: PrismaService) {}

  async logAction(params: {
    userId?: number;
    action: string;
    entity: string;
    entityId: number;
    oldValue?: string;
    newValue?: string;
    metadata?: any;
  }) {
    return this.prisma.auditLog.create({
      data: {
        userId: params.userId || null,
        action: params.action,
        entity: params.entity,
        entityId: params.entityId,
        oldValue: params.oldValue || null,
        newValue: params.newValue || null,
        metadata: params.metadata || null,
      },
    });
  }

  async findAll(filters: { search?: string; action?: string; limit?: number; offset?: number }) {
    const where: any = {};

    if (filters.action) {
      where.action = filters.action;
    }

    if (filters.search) {
      where.OR = [
        { action: { contains: filters.search, mode: 'insensitive' } },
        { entity: { contains: filters.search, mode: 'insensitive' } },
        { oldValue: { contains: filters.search, mode: 'insensitive' } },
        { newValue: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const take = filters.limit || 50;
    const skip = filters.offset || 0;

    const [items, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        include: {
          User: {
            select: { id: true, email: true, profile: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        take,
        skip,
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      items,
      total,
    };
  }
}
