import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { QuestionCategory } from '@prisma/client';

@Injectable()
export class PromptsService implements OnModuleInit {
  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    // Seed prompt templates if empty
    const count = await this.prisma.promptTemplate.count();
    if (count === 0) {
      const defaultPrompts = [
        {
          name: 'Core Technical prompt template',
          category: QuestionCategory.TECHNICAL,
          template: 'You are Aria, an expert software architecture interviewer. Ask structured system design questions and grade based on scalability, patterns, and security aspects.',
          isActive: true,
        },
        {
          name: 'Standard Behavioral assessment prompt template',
          category: QuestionCategory.BEHAVIORAL,
          template: 'You are Aria, an industrial psychologist. Assess candidate answers using the STAR method (Situation, Task, Action, Result) with empathy and professionalism.',
          isActive: true,
        },
        {
          name: 'Situational roleplay template',
          category: QuestionCategory.SITUATIONAL,
          template: 'You are Aria, a Lead Product Manager. Present candidate with team deadlock situations and analyze their conflict resolution capability.',
          isActive: true,
        },
      ];

      for (const p of defaultPrompts) {
        await this.prisma.promptTemplate.create({ data: p });
      }
    }
  }

  async getAll() {
    return this.prisma.promptTemplate.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async createPrompt(dto: { name: string; category: QuestionCategory; template: string }) {
    return this.prisma.promptTemplate.create({
      data: {
        ...dto,
        isActive: false,
      },
    });
  }

  async updatePrompt(
    id: string,
    dto: { name?: string; category?: QuestionCategory; template?: string },
  ) {
    const existing = await this.prisma.promptTemplate.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Prompt template not found');
    }

    return this.prisma.promptTemplate.update({
      where: { id },
      data: dto,
    });
  }

  async deletePrompt(id: string) {
    const existing = await this.prisma.promptTemplate.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Prompt template not found');
    }

    await this.prisma.promptTemplate.delete({ where: { id } });
    return { success: true, message: 'Template removed successfully' };
  }

  async activatePrompt(id: string) {
    const existing = await this.prisma.promptTemplate.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Prompt template not found');
    }

    // Deactivate all prompts in the same category
    await this.prisma.promptTemplate.updateMany({
      where: { category: existing.category },
      data: { isActive: false },
    });

    // Activate selected prompt
    return this.prisma.promptTemplate.update({
      where: { id },
      data: { isActive: true },
    });
  }
}
