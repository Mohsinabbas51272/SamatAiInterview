import { IsString, IsOptional, IsArray, IsUrl, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiProperty({ required: false, example: 'John' })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiProperty({ required: false, example: 'Doe' })
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiProperty({ required: false, example: '+1234567890' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ required: false, example: 'New York, USA' })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiProperty({ required: false, example: 'Full Stack Engineer' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({ required: false, example: 'Passionate software engineer with 5 years experience.' })
  @IsString()
  @IsOptional()
  bio?: string;

  @ApiProperty({ required: false, example: ['Node.js', 'React', 'TypeScript'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  skills?: string[];

  @ApiProperty({ required: false, example: 'https://linkedin.com/in/johndoe' })
  @IsUrl()
  @IsOptional()
  linkedinUrl?: string;

  @ApiProperty({ required: false, example: 'https://github.com/johndoe' })
  @IsUrl()
  @IsOptional()
  githubUrl?: string;

  @ApiProperty({ required: false, example: 'https://johndoe.dev' })
  @IsUrl()
  @IsOptional()
  portfolioUrl?: string;

  @ApiProperty({ required: false, example: 5 })
  @IsInt()
  @Min(0)
  @IsOptional()
  yearsOfExperience?: number;
}
