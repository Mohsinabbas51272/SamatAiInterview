import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { PromptsService } from './prompts.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role, QuestionCategory } from '@prisma/client';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Prompt Management')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.SUPER_ADMIN)
@Controller('prompts')
export class PromptsController {
  constructor(private readonly promptsService: PromptsService) {}

  @ApiOperation({ summary: 'Get all system prompt templates (Admin only)' })
  @Get()
  getAll() {
    return this.promptsService.getAll();
  }

  @ApiOperation({ summary: 'Create new prompt template (Admin only)' })
  @Post()
  createPrompt(
    @Body()
    body: {
      name: string;
      category: QuestionCategory;
      template: string;
    },
  ) {
    return this.promptsService.createPrompt(body);
  }

  @ApiOperation({ summary: 'Update system prompt template details (Admin only)' })
  @Patch(':id')
  updatePrompt(
    @Param('id') id: string,
    @Body()
    body: {
      name?: string;
      category?: QuestionCategory;
      template?: string;
    },
  ) {
    return this.promptsService.updatePrompt(id, body);
  }

  @ApiOperation({ summary: 'Activate a prompt template for evaluations (Admin only)' })
  @Patch(':id/activate')
  activatePrompt(@Param('id') id: string) {
    return this.promptsService.activatePrompt(id);
  }

  @ApiOperation({ summary: 'Delete custom prompt template (Admin only)' })
  @Delete(':id')
  deletePrompt(@Param('id') id: string) {
    return this.promptsService.deletePrompt(id);
  }
}
