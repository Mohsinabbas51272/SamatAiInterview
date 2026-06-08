import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async getNotifications(userId: string) {
    const userIdNum = parseInt(userId, 10);
    return this.prisma.notification.findMany({
      where: { userId: userIdNum },
      orderBy: { createdAt: 'desc' },
      take: 50, // Keep it light
    });
  }

  async createNotification(userId: number, title: string, message: string) {
    return this.prisma.notification.create({
      data: {
        userId,
        title,
        message,
        isRead: false,
      },
    });
  }

  async markAsRead(userId: string, notificationId: string) {
    const userIdNum = parseInt(userId, 10);
    const existing = await this.prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!existing || existing.userId !== userIdNum) {
      throw new NotFoundException('Notification not found');
    }

    return this.prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId: string) {
    const userIdNum = parseInt(userId, 10);
    return this.prisma.notification.updateMany({
      where: {
        userId: userIdNum,
        isRead: false,
      },
      data: { isRead: true },
    });
  }
}
