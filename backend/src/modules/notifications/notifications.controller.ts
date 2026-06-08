import { Controller, Get, Patch, Post, Param, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/user.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @ApiOperation({ summary: 'Get list of notifications for the logged in user' })
  @Get()
  getNotifications(@GetUser('id') userId: string) {
    return this.notificationsService.getNotifications(userId);
  }

  @ApiOperation({ summary: 'Mark an individual notification as read' })
  @Patch(':id/read')
  markAsRead(@GetUser('id') userId: string, @Param('id') id: string) {
    return this.notificationsService.markAsRead(userId, id);
  }

  @ApiOperation({ summary: 'Mark all user notifications as read' })
  @Post('read-all')
  markAllAsRead(@GetUser('id') userId: string) {
    return this.notificationsService.markAllAsRead(userId);
  }
}
