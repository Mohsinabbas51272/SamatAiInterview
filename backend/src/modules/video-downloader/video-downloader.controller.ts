import { Controller, Post, Get, Delete, Body, Param, Res, Req, Header, UseInterceptors } from '@nestjs/common';
import { VideoDownloaderService } from './video-downloader.service';
import { FetchInfoDto, StartDownloadDto } from './dto/fetch-info.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Response, Request } from 'express';
import * as fs from 'fs';
import * as path from 'path';

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

  @ApiOperation({ summary: 'Get download concurrency limit' })
  @Get('concurrency')
  getConcurrencyLimit() {
    return this.service.getConcurrencyLimit();
  }

  @ApiOperation({ summary: 'Set download concurrency limit' })
  @Post('concurrency')
  setConcurrencyLimit(@Body() body: { limit: number }) {
    return this.service.setConcurrencyLimit(body.limit);
  }

  @ApiOperation({ summary: 'Download the completed file' })
  @Get('file/:jobId')
  async getFile(@Param('jobId') jobId: string, @Req() req: Request, @Res() res: Response) {
    const { filePath, filename, fileSize } = this.service.getDownloadFile(jobId);

    // If filePath is a direct download URL, redirect the client directly!
    if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
      return res.redirect(filePath);
    }

    // Detect MIME type from extension
    const ext = path.extname(filename).toLowerCase();
    const mimeTypes: Record<string, string> = {
      '.mp4': 'video/mp4',
      '.mkv': 'video/x-matroska',
      '.webm': 'video/webm',
      '.mp3': 'audio/mpeg',
      '.m4a': 'audio/mp4',
      '.aac': 'audio/aac',
      '.ogg': 'audio/ogg',
    };
    const contentType = mimeTypes[ext] || 'application/octet-stream';

    // ASCII-safe fallback filename: strip ALL non-printable and non-ASCII chars
    // HTTP headers only allow Latin-1 in filename="...", so any char > 0x7E crashes Node.js
    const safeFilename = filename
      .replace(/[^\x20-\x7E]/g, '_')  // replace any non-printable or non-ASCII char with _
      .replace(/["%\\]/g, '_')         // replace chars illegal inside quoted-string
      .replace(/_+/g, '_')             // collapse consecutive underscores
      .trim();

    // RFC 5987 UTF-8 encoded filename for modern browsers (supports full Unicode)
    const encodedFilename = encodeURIComponent(filename);
    const contentDisposition =
      `attachment; filename="${safeFilename}"; filename*=UTF-8''${encodedFilename}`;

    // Support Range requests (needed for iOS Safari, Android Chrome resumable downloads)
    const rangeHeader = req.headers['range'];
    if (rangeHeader) {
      const parts = rangeHeader.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunkSize = end - start + 1;

      res.set({
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize.toString(),
        'Content-Type': contentType,
        'Content-Disposition': contentDisposition,
        'Cache-Control': 'no-cache',
      });
      res.status(206);
      const stream = fs.createReadStream(filePath, { start, end });
      stream.pipe(res);
    } else {
      res.set({
        'Content-Type': contentType,
        'Content-Disposition': contentDisposition,
        'Content-Length': fileSize.toString(),
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'no-cache',
      });
      const stream = fs.createReadStream(filePath);
      stream.pipe(res);
    }
  }

  @ApiOperation({ summary: 'Clear all download history and files' })
  @Delete('history/clear')
  clearAllHistory() {
    return this.service.clearAllHistory();
  }

  @ApiOperation({ summary: 'Delete a download job and its file' })
  @Delete(':jobId')
  deleteJob(@Param('jobId') jobId: string) {
    return this.service.deleteJob(jobId);
  }
}
