import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role, JobStatus, ApplicationStatus } from '@prisma/client';
import { GetUser } from '../../common/decorators/user.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

@ApiTags('Jobs')
@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @ApiOperation({ summary: 'Get all jobs (Active by default for Candidates)' })
  @ApiQuery({ name: 'status', enum: JobStatus, required: false })
  @ApiQuery({ name: 'department', required: false })
  @ApiQuery({ name: 'location', required: false })
  @ApiQuery({ name: 'type', required: false })
  @ApiQuery({ name: 'search', required: false })
  @Get()
  findAll(
    @Query('status') status?: JobStatus,
    @Query('department') department?: string,
    @Query('location') location?: string,
    @Query('type') type?: string,
    @Query('search') search?: string,
  ) {
    return this.jobsService.findAll({ status, department, location, type, search });
  }

  @ApiOperation({ summary: 'Get a job by ID' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.jobsService.findOne(id);
  }

  @ApiOperation({ summary: 'Create a new job listing (HR/Admin only)' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.HR, Role.ADMIN)
  @Post()
  create(@Body() createJobDto: CreateJobDto, @GetUser('id') userId: string) {
    return this.jobsService.create(createJobDto, userId);
  }

  @ApiOperation({ summary: 'Update an existing job listing (HR/Admin only)' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.HR, Role.ADMIN)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateJobDto: UpdateJobDto,
    @GetUser('id') userId: string,
    @GetUser('role') userRole: Role,
  ) {
    return this.jobsService.update(id, updateJobDto, userId, userRole);
  }

  @ApiOperation({ summary: 'Delete a job listing (HR/Admin only)' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.HR, Role.ADMIN)
  @Delete(':id')
  remove(
    @Param('id') id: string,
    @GetUser('id') userId: string,
    @GetUser('role') userRole: Role,
  ) {
    return this.jobsService.remove(id, userId, userRole);
  }

  // --- Application Endpoints ---

  @ApiOperation({ summary: 'Apply to a job listing (Candidate only)' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CANDIDATE)
  @Post(':id/apply')
  apply(
    @Param('id') jobId: string,
    @GetUser('id') candidateId: string,
    @Body('coverLetter') coverLetter?: string,
  ) {
    return this.jobsService.apply(jobId, candidateId, coverLetter);
  }

  @ApiOperation({ summary: 'Get all applications for a job (HR/Admin only)' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.HR, Role.ADMIN)
  @Get(':id/applications')
  getApplications(
    @Param('id') jobId: string,
    @GetUser('id') userId: string,
    @GetUser('role') userRole: Role,
  ) {
    return this.jobsService.getApplications(jobId, userId, userRole);
  }

  @ApiOperation({ summary: 'Get candidate applied jobs (Candidate only)' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CANDIDATE)
  @Get('applications/my')
  getMyApplications(@GetUser('id') candidateId: string) {
    return this.jobsService.getCandidateApplications(candidateId);
  }

  @ApiOperation({ summary: 'Update candidate application status (HR/Admin only)' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.HR, Role.ADMIN)
  @Patch('applications/:applicationId/status')
  updateStatus(
    @Param('applicationId') applicationId: string,
    @Body('status') status: ApplicationStatus,
    @GetUser('id') userId: string,
    @GetUser('role') userRole: Role,
  ) {
    return this.jobsService.updateApplicationStatus(applicationId, status, userId, userRole);
  }
}
