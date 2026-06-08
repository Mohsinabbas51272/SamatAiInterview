import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ReportService } from './report.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Role } from '@prisma/client';
import { GetUser } from '../../common/decorators/user.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('reports')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @ApiOperation({ summary: 'Get all evaluation reports' })
  @Get()
  findAll(@GetUser('id') userId: string, @GetUser('role') role: Role) {
    return this.reportService.findAll(userId, role);
  }

  @ApiOperation({ summary: 'Get report by interview ID' })
  @Get('interview/:interviewId')
  findByInterviewId(
    @Param('interviewId') interviewId: string,
    @GetUser('id') userId: string,
    @GetUser('role') role: Role,
  ) {
    return this.reportService.findByInterviewId(interviewId, userId, role);
  }
}
