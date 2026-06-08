import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role, QuestionCategory, QuestionDifficulty } from '@prisma/client';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

@ApiTags('Question Bank')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('questions')
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @ApiOperation({ summary: 'List all questions in the bank (HR/Admin only)' })
  @Roles(Role.HR, Role.ADMIN)
  @ApiQuery({ name: 'category', enum: QuestionCategory, required: false })
  @ApiQuery({ name: 'difficulty', enum: QuestionDifficulty, required: false })
  @ApiQuery({ name: 'search', required: false })
  @Get()
  findAll(
    @Query('category') category?: QuestionCategory,
    @Query('difficulty') difficulty?: QuestionDifficulty,
    @Query('search') search?: string,
  ) {
    return this.questionsService.findAll({ category, difficulty, search });
  }

  @ApiOperation({ summary: 'Get single question details (HR/Admin only)' })
  @Roles(Role.HR, Role.ADMIN)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.questionsService.findOne(id);
  }

  @ApiOperation({ summary: 'Create new question (Admin only)' })
  @Roles(Role.ADMIN)
  @Post()
  create(
    @Body()
    body: {
      text: string;
      category: QuestionCategory;
      difficulty: QuestionDifficulty;
      expectedAnswer?: string;
      timeLimit?: number;
    },
  ) {
    return this.questionsService.create(body);
  }

  @ApiOperation({ summary: 'Update existing question bank item (Admin only)' })
  @Roles(Role.ADMIN)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body()
    body: {
      text?: string;
      category?: QuestionCategory;
      difficulty?: QuestionDifficulty;
      expectedAnswer?: string;
      timeLimit?: number;
    },
  ) {
    return this.questionsService.update(id, body);
  }

  @ApiOperation({ summary: 'Remove a question from the bank (Admin only)' })
  @Roles(Role.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.questionsService.remove(id);
  }
}
