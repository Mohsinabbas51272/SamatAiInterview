import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { QuestionCategory, QuestionDifficulty } from '@prisma/client';

@Injectable()
export class QuestionsService {
  constructor(private prisma: PrismaService) {}

  async findAll(filters: { category?: QuestionCategory; difficulty?: QuestionDifficulty; search?: string }) {
    const where: any = {};
    
    if (filters.category) {
      where.category = filters.category;
    }
    if (filters.difficulty) {
      where.difficulty = filters.difficulty;
    }
    if (filters.search) {
      where.text = {
        contains: filters.search,
        mode: 'insensitive',
      };
    }

    return this.prisma.question.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const question = await this.prisma.question.findUnique({ where: { id } });
    if (!question) {
      throw new NotFoundException('Question not found');
    }
    return question;
  }

  async create(dto: {
    text: string;
    category: QuestionCategory;
    difficulty: QuestionDifficulty;
    expectedAnswer?: string;
    timeLimit?: number;
  }) {
    return this.prisma.question.create({
      data: dto,
    });
  }

  async update(
    id: string,
    dto: {
      text?: string;
      category?: QuestionCategory;
      difficulty?: QuestionDifficulty;
      expectedAnswer?: string;
      timeLimit?: number;
    },
  ) {
    const existing = await this.prisma.question.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Question not found');
    }
    return this.prisma.question.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    const existing = await this.prisma.question.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Question not found');
    }
    await this.prisma.question.delete({ where: { id } });
    return { success: true, message: 'Question deleted successfully' };
  }
}
