import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SystemConfigService implements OnModuleInit {
  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    // Seed default configuration if none exists
    const config = await this.prisma.systemConfig.findUnique({
      where: { id: 'default' },
    });
    if (!config) {
      await this.prisma.systemConfig.create({
        data: {
          id: 'default',
          model: 'llama-3.3-70b-versatile',
          temperature: 0.7,
          screeningWeight: 40,
          interviewWeight: 60,
          systemPrompt: 'You are Aria, an AI technical interviewer. Ask candidates technical questions and evaluate their responses constructively.',
        },
      });
    } else if (config.model.includes('gemini')) {
      // Auto-migrate Gemini configs to Groq model
      await this.prisma.systemConfig.update({
        where: { id: 'default' },
        data: { model: 'llama-3.3-70b-versatile' },
      });
    }
  }

  async getConfig() {
    let config = await this.prisma.systemConfig.findUnique({
      where: { id: 'default' },
    });
    if (!config) {
      config = await this.prisma.systemConfig.create({
        data: {
          id: 'default',
          model: 'llama-3.3-70b-versatile',
          temperature: 0.7,
          screeningWeight: 40,
          interviewWeight: 60,
          systemPrompt: 'You are Aria, an AI technical interviewer. Ask candidates technical questions and evaluate their responses constructively.',
        },
      });
    } else if (config.model.includes('gemini')) {
      config = await this.prisma.systemConfig.update({
        where: { id: 'default' },
        data: { model: 'llama-3.3-70b-versatile' },
      });
    }
    return config;
  }

  async updateConfig(dto: {
    model?: string;
    temperature?: number;
    screeningWeight?: number;
    interviewWeight?: number;
    systemPrompt?: string;
  }) {
    return this.prisma.systemConfig.update({
      where: { id: 'default' },
      data: dto,
    });
  }
}
