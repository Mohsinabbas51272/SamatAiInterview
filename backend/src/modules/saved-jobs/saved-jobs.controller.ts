import { Controller, Get, Post, Delete, Param, UseGuards } from '@nestjs/common';
import { SavedJobsService } from './saved-jobs.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { GetUser } from '../../common/decorators/user.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Saved Jobs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('saved-jobs')
export class SavedJobsController {
  constructor(private readonly savedJobsService: SavedJobsService) {}

  @ApiOperation({ summary: 'Get list of saved jobs for active candidate' })
  @Roles(Role.CANDIDATE)
  @Get()
  getSavedJobs(@GetUser('id') userId: string) {
    return this.savedJobsService.getSavedJobs(userId);
  }

  @ApiOperation({ summary: 'Bookmark a job vacancy (Candidate only)' })
  @Roles(Role.CANDIDATE)
  @Post(':jobId')
  saveJob(@GetUser('id') userId: string, @Param('jobId') jobId: string) {
    return this.savedJobsService.saveJob(userId, jobId);
  }

  @ApiOperation({ summary: 'Remove a bookmarked job vacancy (Candidate only)' })
  @Roles(Role.CANDIDATE)
  @Delete(':jobId')
  unsaveJob(@GetUser('id') userId: string, @Param('jobId') jobId: string) {
    return this.savedJobsService.unsaveJob(userId, jobId);
  }
}
