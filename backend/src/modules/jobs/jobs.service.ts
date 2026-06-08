import { Injectable, NotFoundException, ConflictException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { JobStatus, ApplicationStatus, Role } from '@prisma/client';

@Injectable()
export class JobsService {
  constructor(private prisma: PrismaService) {}

  async create(createJobDto: CreateJobDto, userId: string) {
    return this.prisma.job.create({
      data: {
        ...createJobDto,
        createdById: parseInt(userId, 10),
      },
    });
  }

  async findAll(filters: {
    status?: JobStatus;
    department?: string;
    location?: string;
    type?: string;
    search?: string;
  }) {
    const { status, department, location, type, search } = filters;

    const where: any = {};

    if (status) {
      where.status = status;
    } else {
      // By default, candidates should only see ACTIVE jobs
      where.status = JobStatus.ACTIVE;
    }

    if (department) {
      where.department = { contains: department, mode: 'insensitive' };
    }

    if (location) {
      where.location = { contains: location, mode: 'insensitive' };
    }

    if (type) {
      where.type = { contains: type, mode: 'insensitive' };
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.job.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { applications: true },
        },
      },
    });
  }

  async findOne(id: string) {
    const job = await this.prisma.job.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: {
            id: true,
            email: true,
            profile: true,
          },
        },
      },
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    return job;
  }

  async update(id: string, updateJobDto: UpdateJobDto, userId: string, userRole: Role) {
    const job = await this.findOne(id);

    // Only creator or Admin can update
    if (job.createdById !== parseInt(userId, 10) && userRole !== Role.ADMIN) {
      throw new ForbiddenException('You do not have permission to modify this job');
    }

    return this.prisma.job.update({
      where: { id },
      data: updateJobDto,
    });
  }

  async remove(id: string, userId: string, userRole: Role) {
    const job = await this.findOne(id);

    if (job.createdById !== parseInt(userId, 10) && userRole !== Role.ADMIN) {
      throw new ForbiddenException('You do not have permission to delete this job');
    }

    await this.prisma.job.delete({
      where: { id },
    });

    return { success: true, message: 'Job deleted successfully' };
  }

  // --- Applications ---

  async apply(jobId: string, candidateId: string, coverLetter?: string) {
    // Check if job exists and is active
    const job = await this.findOne(jobId);
    if (job.status !== JobStatus.ACTIVE) {
      throw new BadRequestException('Cannot apply to an inactive or draft job');
    }

    const candidateIdNum = parseInt(candidateId, 10);

    // Check if user already applied
    const existing = await this.prisma.application.findUnique({
      where: {
        jobId_candidateId: {
          jobId,
          candidateId: candidateIdNum,
        },
      },
    });

    if (existing) {
      throw new ConflictException('You have already applied to this job');
    }

    // Calculate initial match score if candidate has resume
    const resume = await this.prisma.resume.findUnique({
      where: { userId: candidateIdNum },
    });

    let matchScore: number | null = null;
    if (resume && resume.parsedData && job.skills.length > 0) {
      const parsed = resume.parsedData as any;
      const parsedSkills = parsed.skills || [];
      const matchingSkills = job.skills.filter((s: string) =>
        parsedSkills.some((ps: string) => ps.toLowerCase().includes(s.toLowerCase())),
      );
      matchScore = (matchingSkills.length / job.skills.length) * 100;
    }

    return this.prisma.application.create({
      data: {
        jobId,
        candidateId: candidateIdNum,
        coverLetter,
        matchScore,
      },
    });
  }

  async getApplications(jobId: string, userId: string, userRole: Role) {
    const job = await this.findOne(jobId);

    if (job.createdById !== parseInt(userId, 10) && userRole !== Role.ADMIN) {
      throw new ForbiddenException('You do not have permission to view applicants for this job');
    }

    return this.prisma.application.findMany({
      where: { jobId },
      include: {
        candidate: {
          select: {
            id: true,
            email: true,
            profile: true,
            resume: {
              select: {
                id: true,
                status: true,
                matchScore: true,
                extractedSkills: true,
              },
            },
          },
        },
      },
      orderBy: { matchScore: 'desc' },
    });
  }

  async getCandidateApplications(candidateId: string) {
    return this.prisma.application.findMany({
      where: { candidateId: parseInt(candidateId, 10) },
      include: {
        job: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateApplicationStatus(
    applicationId: string,
    status: ApplicationStatus,
    userId: string,
    userRole: Role,
  ) {
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
      include: { job: true },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    if (application.job.createdById !== parseInt(userId, 10) && userRole !== Role.ADMIN) {
      throw new ForbiddenException('You do not have permission to update status for this job');
    }

    return this.prisma.application.update({
      where: { id: applicationId },
      data: { status },
    });
  }
}
