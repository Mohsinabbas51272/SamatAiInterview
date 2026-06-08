import { Module, OnModuleInit, Logger } from '@nestjs/common';
import { ResumeService } from './resume.service';
import { ResumeController } from './resume.controller';

@Module({
  controllers: [ResumeController],
  providers: [ResumeService],
  exports: [ResumeService],
})
export class ResumeModule implements OnModuleInit {
  private readonly logger = new Logger(ResumeModule.name);
  
  onModuleInit() {
    this.logger.log('ResumeModule initialized successfully');
  }
}
