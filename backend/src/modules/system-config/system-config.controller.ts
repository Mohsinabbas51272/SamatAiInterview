import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { SystemConfigService } from './system-config.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('System Configuration')
@Controller('system-config')
export class SystemConfigController {
  constructor(private readonly configService: SystemConfigService) {}

  @ApiOperation({ summary: 'Get general AI configuration' })
  @Get()
  getConfig() {
    return this.configService.getConfig();
  }

  @ApiOperation({ summary: 'Update AI configuration weights and templates (Admin only)' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Post()
  updateConfig(
    @Body()
    body: {
      model?: string;
      temperature?: number;
      screeningWeight?: number;
      interviewWeight?: number;
      systemPrompt?: string;
    },
  ) {
    return this.configService.updateConfig(body);
  }
}
