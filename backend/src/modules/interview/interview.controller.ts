import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { InterviewService } from './interview.service';
import { ScheduleInterviewDto } from './dto/schedule-interview.dto';
import { AnswerQuestionDto } from './dto/answer-question.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { GetUser } from '../../common/decorators/user.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Interviews')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('interviews')
export class InterviewController {
  constructor(private readonly interviewService: InterviewService) {}

  @ApiOperation({ summary: 'Schedule an interview (HR/Admin only)' })
  @Roles(Role.HR, Role.ADMIN)
  @Post()
  schedule(@Body() scheduleInterviewDto: ScheduleInterviewDto) {
    return this.interviewService.schedule(scheduleInterviewDto);
  }

  @ApiOperation({ summary: 'Get all interviews for current user' })
  @Get()
  findAll(@GetUser('id') userId: string, @GetUser('role') role: Role) {
    return this.interviewService.findAll(userId, role);
  }

  @ApiOperation({ summary: 'Get details of a single interview' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.interviewService.findOne(id);
  }

  @ApiOperation({ summary: 'Start/Join an interview session (Candidate only)' })
  @Roles(Role.CANDIDATE)
  @Post(':id/start')
  startInterview(@Param('id') id: string, @GetUser('id') userId: string) {
    return this.interviewService.startInterview(id, userId);
  }

  @ApiOperation({ summary: 'Submit an answer to a question & get immediate AI feedback (Candidate only)' })
  @Roles(Role.CANDIDATE)
  @Post(':id/answer')
  submitAnswer(
    @Param('id') id: string,
    @Body() answerDto: AnswerQuestionDto,
    @GetUser('id') userId: string,
  ) {
    return this.interviewService.submitAnswer(id, answerDto, userId);
  }

  @ApiOperation({ summary: 'End the interview session and compile the AI report (Candidate only)' })
  @Roles(Role.CANDIDATE)
  @Post(':id/end')
  endInterview(@Param('id') id: string, @GetUser('id') userId: string) {
    return this.interviewService.endInterview(id, userId);
  }
}
