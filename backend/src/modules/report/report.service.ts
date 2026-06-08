import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Role } from '@prisma/client';

@Injectable()
export class ReportService {
  constructor(private prisma: PrismaService) {}

  async findByInterviewId(interviewId: string, userId: string, userRole: Role) {
    const report = await this.prisma.report.findUnique({
      where: { interviewId },
      include: {
        interview: {
          include: {
            job: true,
            answers: {
              include: {
                question: true,
              },
            },
          },
        },
        candidate: {
          select: {
            id: true,
            email: true,
            profile: true,
          },
        },
      },
    });

    if (!report) {
      throw new NotFoundException('Evaluation report not found');
    }

    // Candidate can only view their own report
    if (userRole === Role.CANDIDATE && report.candidateId !== parseInt(userId, 10)) {
      throw new ForbiddenException('You do not have permission to view this report');
    }

    // HR can only view reports for jobs they created, unless they are Admin
    if (userRole === Role.HR && report.interview.job.createdById !== parseInt(userId, 10)) {
      throw new ForbiddenException('You do not have permission to view reports for this job');
    }

    return report;
  }

  async findAll(userId: string, userRole: Role) {
    const where: any = {};

    if (userRole === Role.CANDIDATE) {
      where.candidateId = parseInt(userId, 10);
    } else if (userRole === Role.HR) {
      where.interview = {
        job: {
          createdById: parseInt(userId, 10),
        },
      };
    }

    return this.prisma.report.findMany({
      where,
      include: {
        interview: {
          include: {
            job: true,
          },
        },
        candidate: {
          select: {
            id: true,
            email: true,
            profile: true,
          },
        },
      },
      orderBy: { generatedAt: 'desc' },
    });
  }
}
