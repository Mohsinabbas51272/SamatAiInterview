import { IsString, IsArray, IsEnum, IsOptional, IsInt, Min, IsNumber, IsDateString } from 'class-validator';
import { JobStatus } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class CreateJobDto {
  @ApiProperty({ example: 'Senior React Developer' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'Engineering' })
  @IsString()
  department: string;

  @ApiProperty({ example: 'Remote, US' })
  @IsString()
  location: string;

  @ApiProperty({ example: 'Full-time' })
  @IsString()
  type: string;

  @ApiProperty({ enum: JobStatus, default: JobStatus.DRAFT })
  @IsEnum(JobStatus)
  @IsOptional()
  status?: JobStatus;

  @ApiProperty({ example: 'We are looking for a senior front-end developer...' })
  @IsString()
  description: string;

  @ApiProperty({ example: ['5+ years React', 'Strong CSS', 'TypeScript experience'] })
  @IsArray()
  @IsString({ each: true })
  requirements: string[];

  @ApiProperty({ example: ['React', 'CSS', 'TypeScript', 'Redux'] })
  @IsArray()
  @IsString({ each: true })
  skills: string[];

  @ApiProperty({ example: 3 })
  @IsInt()
  @Min(0)
  @IsOptional()
  experienceMin?: number;

  @ApiProperty({ example: 8 })
  @IsInt()
  @Min(0)
  @IsOptional()
  experienceMax?: number;

  @ApiProperty({ example: 90000 })
  @IsNumber()
  @IsOptional()
  salaryMin?: number;

  @ApiProperty({ example: 140000 })
  @IsNumber()
  @IsOptional()
  salaryMax?: number;

  @ApiProperty({ example: 'USD' })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiProperty({ example: '2026-12-31T23:59:59Z' })
  @IsDateString()
  @IsOptional()
  closingDate?: string;
}
