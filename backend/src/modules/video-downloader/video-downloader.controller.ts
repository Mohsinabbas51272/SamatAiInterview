import { Controller, Post, Get, Delete, Body, Param, Res, UseInterceptors } from '@nestjs/common';
import { VideoDownloaderService } from './video-downloader.service';
import { FetchInfoDto, StartDownloadDto } from './dto/fetch-info.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Response } from 'express';
import * as fs from 'fs';

@ApiTags('Video Downloader')
@Controller('video-downloader')
export class VideoDownloaderController {
  constructor(private readonly service: VideoDownloaderService) {}

  @ApiOperation({ summary: 'Fetch video/playlist metadata' })
  @Post('info')
  fetchInfo(@Body() dto: FetchInfoDto) {
    return this.service.fetchInfo(dto);
  }

  @ApiOperation({ summary: 'Start downloading a video' })
  @Post('download')
  startDownload(@Body() dto: StartDownloadDto) {
    return this.service.startDownload(dto);
  }

  @ApiOperation({ summary: 'Get download job status' })
  @Get('status/:jobId')
  getStatus(@Param('jobId') jobId: string) {
    return this.service.getJobStatus(jobId);
  }

  @ApiOperation({ summary: 'List all download jobs' })
  @Get('jobs')
  listJobs() {
    return this.service.listJobs();
  }

  @ApiOperation({ summary: 'Download the completed file' })
  @Get('file/:jobId')
  async getFile(@Param('jobId') jobId: string, @Res() res: Response) {
    const { filePath, filename, fileSize } = this.service.getDownloadFile(jobId);
    
    // Set headers for file download
    res.set({
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
      'Content-Length': fileSize.toString(),
      'Cache-Control': 'no-cache',
    });

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  }

  @ApiOperation({ summary: 'Delete a download job and its file' })
  @Delete(':jobId')
  deleteJob(@Param('jobId') jobId: string) {
    return this.service.deleteJob(jobId);
  }
}
