import { IsString, IsEnum, IsDateString, IsInt, Min, IsOptional } from 'class-validator';
import { InterviewType, InterviewStatus } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class ScheduleInterviewDto {
  @ApiProperty({ example: 'job-id-uuid' })
  @IsString()
  jobId: string;

  @ApiProperty({ example: 'candidate-id-uuid' })
  @IsString()
  candidateId: string;

  @ApiProperty({ example: 'hr-id-uuid', required: false })
  @IsString()
  @IsOptional()
  hrId?: string;

  @ApiProperty({ enum: InterviewType, default: InterviewType.AI_MOCK })
  @IsEnum(InterviewType)
  @IsOptional()
  type?: InterviewType;

  @ApiProperty({ example: '2026-06-15T10:00:00Z' })
  @IsDateString()
  scheduledAt: string;

  @ApiProperty({ example: 45 })
  @IsInt()
  @Min(1)
  @IsOptional()
  duration?: number;

  @ApiProperty({ example: 'https://zoom.us/j/123456789', required: false })
  @IsString()
  @IsOptional()
  meetingLink?: string;

  @ApiProperty({ example: 'Focus on system design and communication skills.', required: false })
  @IsString()
  @IsOptional()
  notes?: string;
}
