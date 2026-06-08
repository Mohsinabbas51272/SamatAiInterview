import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Role, InterviewStatus, JobStatus } from '@prisma/client';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats(userId: string, role: Role) {
    if (role === Role.CANDIDATE) {
      return this.getCandidateStats(userId);
    } else {
      return this.getHRStats(userId, role);
    }
  }

  private async getCandidateStats(userId: string) {
    const userIdNum = parseInt(userId, 10);

    const [applicationsCount, interviewsScheduled, interviewsCompleted, averageScore] = await Promise.all([
      this.prisma.application.count({ where: { candidateId: userIdNum } }),
      this.prisma.interview.count({
        where: {
          candidateId: userIdNum,
          status: InterviewStatus.SCHEDULED,
        },
      }),
      this.prisma.interview.count({
        where: {
          candidateId: userIdNum,
          status: InterviewStatus.COMPLETED,
        },
      }),
      this.prisma.interview.aggregate({
        where: {
          candidateId: userIdNum,
          status: InterviewStatus.COMPLETED,
        },
        _avg: {
          overallScore: true,
        },
      }),
    ]);

    // Fetch monthly interview performance
    const completedInterviews = await this.prisma.interview.findMany({
      where: {
        candidateId: userIdNum,
        status: InterviewStatus.COMPLETED,
      },
      select: {
        scheduledAt: true,
        overallScore: true,
        job: { select: { title: true } },
      },
      orderBy: { scheduledAt: 'asc' },
    });

    const performanceTrend = completedInterviews.map(i => ({
      date: i.scheduledAt.toISOString().split('T')[0],
      score: i.overallScore,
      jobTitle: i.job.title,
    }));

    return {
      stats: {
        totalApplications: applicationsCount,
        upcomingInterviews: interviewsScheduled,
        completedInterviews: interviewsCompleted,
        avgScore: averageScore._avg?.overallScore ? Math.round(averageScore._avg.overallScore * 10) / 10 : null,
      },
      performanceTrend,
    };
  }

  private async getHRStats(userId: string, role: Role) {
    const userIdNum = parseInt(userId, 10);
    const isHrOnly = role === Role.HR;
    
    // Base filters
    const jobFilter: any = isHrOnly ? { createdById: userIdNum } : {};
    const interviewFilter: any = isHrOnly ? { job: { createdById: userIdNum } } : {};
    const applicationFilter: any = isHrOnly ? { job: { createdById: userIdNum } } : {};

    const [totalJobs, activeJobs, totalApplications, totalInterviews, avgScore] = await Promise.all([
      this.prisma.job.count({ where: jobFilter }),
      this.prisma.job.count({ where: { ...jobFilter, status: JobStatus.ACTIVE } }),
      this.prisma.application.count({ where: applicationFilter }),
      this.prisma.interview.count({ where: interviewFilter }),
      this.prisma.interview.aggregate({
        where: {
          ...interviewFilter,
          status: InterviewStatus.COMPLETED,
        },
        _avg: {
          overallScore: true,
        },
      }),
    ]);

    // Application funnel
    const applicationStatusBreakdown = await this.prisma.application.groupBy({
      by: ['status'],
      where: applicationFilter,
      _count: true,
    });

    const pipeline = applicationStatusBreakdown.map(g => ({
      status: g.status,
      count: g._count,
    }));

    // Department breakdown
    const departmentBreakdown = await this.prisma.job.groupBy({
      by: ['department'],
      where: jobFilter,
      _count: true,
    });

    const departmentStats = departmentBreakdown.map(g => ({
      department: g.department,
      jobCount: g._count,
    }));

    return {
      stats: {
        totalJobs,
        activeJobs,
        totalApplications,
        totalInterviews,
        avgScore: avgScore._avg?.overallScore ? Math.round(avgScore._avg.overallScore * 10) / 10 : null,
      },
      pipeline,
      departmentStats,
    };
  }
}
