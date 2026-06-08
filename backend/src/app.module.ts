import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { JobsModule } from './modules/jobs/jobs.module';
import { ResumeModule } from './modules/resume/resume.module';
import { InterviewModule } from './modules/interview/interview.module';
import { ReportModule } from './modules/report/report.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';

// New SaaS Extension Modules
import { EmailModule } from './modules/email/email.module';
import { SystemConfigModule } from './modules/system-config/system-config.module';
import { SavedJobsModule } from './modules/saved-jobs/saved-jobs.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { PromptsModule } from './modules/prompts/prompts.module';
import { QuestionsModule } from './modules/questions/questions.module';
import { AuditLogsModule } from './modules/audit-logs/audit-logs.module';
import { VideoDownloaderModule } from './modules/video-downloader/video-downloader.module';

@Module({
  imports: [
    // Config
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),

    // Rate limiting
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          ttl: config.get<number>('THROTTLE_TTL', 60) * 1000,
          limit: config.get<number>('THROTTLE_LIMIT', 100),
        },
      ],
    }),

    // Cron jobs
    ScheduleModule.forRoot(),

    // Core
    PrismaModule,

    // Feature modules
    AuthModule,
    UsersModule,
    JobsModule,
    ResumeModule,
    InterviewModule,
    ReportModule,
    AnalyticsModule,
    
    // SaaS Extensions
    EmailModule,
    SystemConfigModule,
    SavedJobsModule,
    NotificationsModule,
    PromptsModule,
    QuestionsModule,
    AuditLogsModule,
    VideoDownloaderModule,
  ],
})
export class AppModule {}

