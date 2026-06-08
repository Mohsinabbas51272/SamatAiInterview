import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuditLogsService } from './audit-logs.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

@ApiTags('Audit Logs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.SUPER_ADMIN)
@Controller('audit-logs')
export class AuditLogsController {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  @ApiOperation({ summary: 'Get list of administrative audit logs (Admin only)' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'action', required: false })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  @ApiQuery({ name: 'offset', type: Number, required: false })
  @Get()
  findAll(
    @Query('search') search?: string,
    @Query('action') action?: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    return this.auditLogsService.findAll({
      search,
      action,
      limit: limit ? parseInt(limit.toString(), 10) : undefined,
      offset: offset ? parseInt(offset.toString(), 10) : undefined,
    });
  }
}
