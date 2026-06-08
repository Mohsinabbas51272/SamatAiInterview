import { IsString, IsInt, Min, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AnswerQuestionDto {
  @ApiProperty({ example: 'question-uuid' })
  @IsString()
  questionId: string;

  @ApiProperty({ example: 'I would use React Context or a library like Redux for global state...' })
  @IsString()
  answerText: string;

  @ApiProperty({ example: 45 })
  @IsInt()
  @Min(1)
  timeTaken: number; // in seconds

  @ApiProperty({ example: 'https://storage.googleapis.com/smart-interviews/audios/123.mp3', required: false })
  @IsString()
  @IsOptional()
  audioUrl?: string;

  @ApiProperty({ example: 'https://storage.googleapis.com/smart-interviews/videos/123.mp4', required: false })
  @IsString()
  @IsOptional()
  videoUrl?: string;
}
