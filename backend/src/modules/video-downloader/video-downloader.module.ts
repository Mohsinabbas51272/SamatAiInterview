import { Module } from '@nestjs/common';
import { VideoDownloaderService } from './video-downloader.service';
import { VideoDownloaderController } from './video-downloader.controller';

@Module({
  controllers: [VideoDownloaderController],
  providers: [VideoDownloaderService],
  exports: [VideoDownloaderService],
})
export class VideoDownloaderModule {}
