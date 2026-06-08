import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SavedJobsService {
  constructor(private prisma: PrismaService) {}

  async getSavedJobs(userId: string) {
    const candidateId = parseInt(userId, 10);
    return this.prisma.savedJob.findMany({
      where: { candidateId },
      include: {
        job: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async saveJob(userId: string, jobId: string) {
    const candidateId = parseInt(userId, 10);

    // Verify job exists
    const job = await this.prisma.job.findUnique({
      where: { id: jobId },
    });
    if (!job) {
      throw new NotFoundException('Job not found');
    }

    // Check if already saved
    const existing = await this.prisma.savedJob.findUnique({
      where: {
        candidateId_jobId: {
          candidateId,
          jobId,
        },
      },
    });

    if (existing) {
      throw new ConflictException('Job is already bookmarked');
    }

    return this.prisma.savedJob.create({
      data: {
        candidateId,
        jobId,
      },
      include: {
        job: true,
      },
    });
  }

  async unsaveJob(userId: string, jobId: string) {
    const candidateId = parseInt(userId, 10);

    const existing = await this.prisma.savedJob.findUnique({
      where: {
        candidateId_jobId: {
          candidateId,
          jobId,
        },
      },
    });

    if (!existing) {
      throw new NotFoundException('Saved job record not found');
    }

    await this.prisma.savedJob.delete({
      where: {
        candidateId_jobId: {
          candidateId,
          jobId,
        },
      },
    });

    return { success: true, message: 'Job unsaved successfully' };
  }
}
