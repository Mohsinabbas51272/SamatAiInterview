import { Injectable, BadRequestException, Logger, NotFoundException } from '@nestjs/common';
import { FetchInfoDto, StartDownloadDto } from './dto/fetch-info.dto';
import { execFile, spawn } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import { v4 as uuidv4 } from 'uuid';

const execFileAsync = promisify(execFile);

// Resolve yt-dlp binary path: prefer system binary, fall back to static
function resolveYtDlpPath(): string | null {
  // On development/local: try system yt-dlp first
  if (!process.env.VERCEL && !process.env.AWS_LAMBDA_FUNCTION_NAME) {
    const systemBinary = '/usr/local/bin/yt-dlp';
    if (fs.existsSync(systemBinary)) {
      return systemBinary;
    }
    // Also try common Linux path
    if (fs.existsSync('/usr/bin/yt-dlp')) {
      return '/usr/bin/yt-dlp';
    }
  }

  // On serverless: try to use npm package (yt-dlp-static)
  try {
    return require('yt-dlp-static');
  } catch (e) {
    // yt-dlp-static not available or unsupported platform
    return null;
  }
}

const ytdlpPath = resolveYtDlpPath();


interface DownloadJob {
  id: string;
  url: string;
  quality: string;
  status: 'pending' | 'downloading' | 'merging' | 'completed' | 'failed';
  progress: number;
  filename: string;
  filePath: string;
  fileSize: number;
  title: string;
  error?: string;
  createdAt: Date;
}

@Injectable()
export class VideoDownloaderService {
  private readonly logger = new Logger(VideoDownloaderService.name);
  private readonly downloadDir: string | null;
  private readonly jobs = new Map<string, DownloadJob>();
  private readonly queueData = new Map<string, { dto: StartDownloadDto; cleanUrl: string }>();
  private readonly activeProcesses = new Map<string, any>();
  private concurrencyLimit = 2;
  private readonly isEnabled: boolean;

  constructor() {
    // Check if yt-dlp is available
    if (!ytdlpPath) {
      this.logger.warn('VideoDownloaderService disabled: yt-dlp not available on this platform');
      this.downloadDir = null;
      this.isEnabled = false;
      return;
    }

    this.isEnabled = true;

    // Use a writable temp folder on serverless environments (Vercel, AWS Lambda, etc.).
    const isServerless = Boolean(
      process.env.VERCEL ||
      process.env.VERCEL_ENV ||
      process.env.NOW_REGION ||
      process.env.AWS_LAMBDA_FUNCTION_NAME ||
      process.env.FUNCTIONS_WORKER_RUNTIME
    );

    const preferredDir = process.env.VIDEO_DOWNLOADER_DIR
      ? path.resolve(process.env.VIDEO_DOWNLOADER_DIR)
      : isServerless
      ? path.join(os.tmpdir(), 'VideoDownloader')
      : path.join(os.homedir(), 'Downloads', 'VideoDownloader');

    const fallbackDir = path.join(os.tmpdir(), 'VideoDownloader');
    this.downloadDir = preferredDir;

    const ensureDirectory = (dir: string) => {
      try {
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        return true;
      } catch (err) {
        this.logger.warn(`Could not create download directory: ${dir}`, err);
        return false;
      }
    };

    if (!ensureDirectory(this.downloadDir) && this.downloadDir !== fallbackDir) {
      this.downloadDir = fallbackDir;
      ensureDirectory(this.downloadDir);
    }

    if (this.downloadDir && fs.existsSync(this.downloadDir)) {
      this.loadExistingDownloads();
    } else {
      this.logger.warn('VideoDownloaderService disabled because no writable download directory could be created');
      this.isEnabled = false;
    }
  }

  /**
   * Load previously downloaded files from the downloads directory
   */
  private loadExistingDownloads() {
    if (!this.downloadDir || !fs.existsSync(this.downloadDir)) {
      return;
    }

    try {
      const files = fs.readdirSync(this.downloadDir).filter(f => {
        const ext = path.extname(f).toLowerCase();
        return ['.mp4', '.mkv', '.webm', '.mp3', '.m4a'].includes(ext);
      });

      for (const file of files) {
        const filePath = path.join(this.downloadDir, file);
        const stats = fs.statSync(filePath);
        const id = uuidv4();
        const title = file.replace(/\.[^/.]+$/, ''); // remove extension

        this.jobs.set(id, {
          id,
          url: '',
          quality: 'unknown',
          status: 'completed',
          progress: 100,
          filename: file,
          filePath,
          fileSize: stats.size,
          title,
          createdAt: stats.mtime,
        });
      }
      this.logger.log(`Loaded ${files.length} existing downloads`);
    } catch (err) {
      this.logger.warn('Could not load existing downloads', err);
    }
  }

  /**
   * Clean the URL to remove radio/mix parameters that cause infinite playlists
   */
  private cleanUrl(url: string): { cleanUrl: string; isPlaylist: boolean } {
    try {
      const parsed = new URL(url);
      
      // Remove index parameters so playlist indexes remain clean and 1-based
      parsed.searchParams.delete('index');
      
      const hasList = parsed.searchParams.has('list');
      
      return { cleanUrl: parsed.toString(), isPlaylist: hasList };
    } catch {
      return { cleanUrl: url, isPlaylist: false };
    }
  }

  /**
   * Fetch video/playlist metadata using yt-dlp --dump-json
   */
  async fetchInfo(dto: FetchInfoDto) {
    if (!this.isEnabled || !ytdlpPath) {
      throw new BadRequestException(
        'Video downloader is not available on this platform. ' +
        'This feature requires yt-dlp which is not supported on serverless environments. ' +
        'Please use the web version or contact support.'
      );
    }

    const { cleanUrl, isPlaylist: urlHasPlaylist } = this.cleanUrl(dto.url);
    
    try {
      // Always try single video first - it's faster and more reliable
      this.logger.log(`Fetching info for: ${cleanUrl}`);
      
      const { stdout: fullJson, stderr: stderrOut } = await execFileAsync(ytdlpPath, [
        '--dump-json',
        '--no-playlist',
        '--no-warnings',
        '--no-check-certificates',
        '--socket-timeout', '15',
        cleanUrl,
      ], { maxBuffer: 50 * 1024 * 1024, timeout: 45000 });

      if (!fullJson) {
        throw new Error(stderrOut || 'No output from yt-dlp');
      }

      const videoData = JSON.parse(fullJson);

      // Extract available qualities
      const formats = (videoData.formats || [])
        .filter((f: any) => f.height && f.vcodec && f.vcodec !== 'none')
        .map((f: any) => ({
          formatId: f.format_id,
          quality: f.height,
          ext: f.ext,
          filesize: f.filesize || f.filesize_approx || 0,
          fps: f.fps,
          vcodec: f.vcodec,
        }));

      // Deduplicate by quality, keep best
      const qualityMap = new Map<number, any>();
      for (const f of formats) {
        if (!qualityMap.has(f.quality) || (f.filesize > qualityMap.get(f.quality).filesize)) {
          qualityMap.set(f.quality, f);
        }
      }

      const availableQualities = Array.from(qualityMap.values())
        .filter(f => [360, 480, 720, 1080, 1440, 2160].includes(f.quality))
        .sort((a, b) => a.quality - b.quality);

      const result: any = {
        type: 'video',
        title: videoData.title || 'Untitled Video',
        thumbnail: videoData.thumbnail || null,
        duration: videoData.duration || 0,
        uploader: videoData.uploader || videoData.channel || 'Unknown',
        description: (videoData.description || '').substring(0, 300),
        viewCount: videoData.view_count || 0,
        uploadDate: videoData.upload_date || null,
        availableQualities,
        cleanUrl,
      };

      // If the URL had a real playlist (not radio), also try to fetch playlist info
      if (urlHasPlaylist) {
        try {
          const { stdout: plJson } = await execFileAsync(ytdlpPath, [
            '--flat-playlist',
            '--dump-single-json',
            '--no-warnings',
            '--no-check-certificates',
            '--socket-timeout', '10',
            '--playlist-end', '50', // Limit to 50 videos max
            cleanUrl,
          ], { maxBuffer: 50 * 1024 * 1024, timeout: 30000 });

          const plData = JSON.parse(plJson);
          if (plData.entries && plData.entries.length > 1) {
            result.playlist = {
              title: plData.title || 'Playlist',
              videoCount: plData.entries.length,
              videos: plData.entries.slice(0, 50).map((entry: any, idx: number) => ({
                index: idx + 1,
                id: entry.id,
                title: entry.title || `Video ${idx + 1}`,
                duration: entry.duration || 0,
                thumbnail: entry.thumbnails?.[0]?.url || null,
                url: entry.url || entry.webpage_url,
              })),
            };
          }
        } catch (plErr) {
          this.logger.warn('Could not fetch playlist info, continuing with single video', (plErr as any).message);
        }
      }

      return result;
    } catch (error: any) {
      this.logger.error('Failed to fetch video info', error.message, error.stderr);
      
      // Extract useful error messages from yt-dlp stderr
      let message = 'Failed to fetch video info.';
      const errorMsg = error.stderr || error.message || '';
      
      if (errorMsg.includes('No video formats found')) {
        message = 'This video has no downloadable formats. It may be age-restricted, private, or not available in your region.';
      } else if (errorMsg.includes('not available')) {
        message = 'This video is not available. It may have been deleted or made private.';
      } else if (errorMsg.includes('does not contain any streams')) {
        message = 'The URL does not contain any downloadable streams.';
      } else if (error.message?.includes('timeout') || errorMsg.includes('timed out')) {
        message = 'Request timed out. The video might be restricted, or your connection is slow. Please try a different URL.';
      } else if (error.message?.includes('not found') || error.message?.includes('ENOENT')) {
        message = 'yt-dlp is not installed. Install with npm install yt-dlp-static or brew install yt-dlp';
      } else if (errorMsg) {
        message = `yt-dlp error: ${errorMsg.split('\n')[0].substring(0, 200)}`;
      }
      
      throw new BadRequestException(message);
    }
  }

  /**
   * Start downloading a video using yt-dlp
   */
  async startDownload(dto: StartDownloadDto) {
    if (!this.isEnabled || !ytdlpPath) {
      throw new BadRequestException(
        'Video downloader is not available on this platform. ' +
        'This feature requires yt-dlp which is not supported on serverless environments.'
      );
    }

    if (!this.downloadDir || !fs.existsSync(this.downloadDir)) {
      throw new BadRequestException('Download storage is unavailable. Please try again later.');
    }

    const { cleanUrl } = this.cleanUrl(dto.url);
    const quality = dto.quality || '1080';
    const jobId = uuidv4();

    const job: DownloadJob = {
      id: jobId,
      url: cleanUrl,
      quality,
      status: 'pending',
      progress: 0,
      filename: '',
      filePath: '',
      fileSize: 0,
      title: 'Queued...',
      createdAt: new Date(),
    };

    this.jobs.set(jobId, job);
    this.queueData.set(jobId, { dto, cleanUrl });

    // Trigger queue worker
    this.processQueue();

    return { jobId, status: 'pending', message: 'Download queued' };
  }

  /**
   * Execute the actual download in the background
   */
  private async runDownload(job: DownloadJob, dto: StartDownloadDto, cleanUrl: string) {
    // Type guard: ensure ytdlpPath and downloadDir are not null at this point
    if (!ytdlpPath || !this.downloadDir) {
      throw new Error('Video downloader is not available');
    }

    job.status = 'downloading';

    const outputTemplate = path.join(this.downloadDir, `%(title).80s_${job.quality}p.%(ext)s`);

    // Prefer H264 (avc1) and AAC (m4a) natively for max performance and macOS/iOS compatibility
    const formatSelection = `bestvideo[vcodec^=avc1][height<=${dto.quality || 1080}]+bestaudio[ext=m4a]/bestvideo[height<=${dto.quality || 1080}]+bestaudio/best[height<=${dto.quality || 1080}]/best`;

    const args: string[] = [
      '-f', formatSelection,
      '--recode-video', 'mp4',
      '-o', outputTemplate,
      '--newline',
      '--no-warnings',
      '--no-check-certificates',
      '--socket-timeout', '30',
      '--retries', '3',
      '--no-playlist',
      '--progress',
    ];

    if (dto.isPlaylist && dto.playlistIndex) {
      // Remove --no-playlist and add playlist item selection
      const noPlIdx = args.indexOf('--no-playlist');
      if (noPlIdx !== -1) args.splice(noPlIdx, 1);
      args.push('--playlist-items', dto.playlistIndex);
    }

    args.push(cleanUrl);

    this.logger.log(`Starting download: yt-dlp ${args.join(' ')}`);

    return new Promise<void>((resolve, reject) => {
      const proc = spawn(ytdlpPath as string, args);
      this.activeProcesses.set(job.id, proc);
      let stderrOutput = '';

      proc.stdout.on('data', (data: Buffer) => {
        const lines = data.toString().split('\n');
        
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;

          // Parse progress: [download]  45.2% of ~100MiB at 5.00MiB/s ETA 00:10
          const progressMatch = trimmed.match(/\[download\]\s+([\d.]+)%/);
          if (progressMatch) {
            job.progress = parseFloat(progressMatch[1]);
          }

          // Parse destination: [download] Destination: filename.mp4
          const destMatch = trimmed.match(/\[download\] Destination:\s+(.+)/);
          if (destMatch) {
            job.filePath = destMatch[1];
            job.filename = path.basename(destMatch[1]);
            // Extract title from filename
            const titlePart = job.filename.replace(/\.[^/.]+$/, '').replace(/_\d+p$/, '');
            if (titlePart) job.title = titlePart;
          }

          // Parse video conversion: [VideoConvertor] Converting video from webm to mp4
          const convertMatch = trimmed.match(/\[VideoConvertor\] Converting video from \w+ to \w+;\s+Destination:\s+(.+)/);
          if (convertMatch) {
            job.status = 'merging';
            job.filePath = convertMatch[1];
            job.filename = path.basename(convertMatch[1]);
            job.progress = 99;
          }

          // Parse merge: [Merger] Merging formats into "filename.mp4"
          const mergeMatch = trimmed.match(/\[Merger\] Merging formats into "(.+)"/);
          if (mergeMatch) {
            job.status = 'merging';
            job.filePath = mergeMatch[1];
            job.filename = path.basename(mergeMatch[1]);
            job.progress = 99;
          }

          // Downloading video title
          const titleMatch = trimmed.match(/\[download\] Downloading video (\d+) of (\d+)/);
          if (titleMatch) {
            job.title = `Downloading video ${titleMatch[1]} of ${titleMatch[2]}`;
          }

          // Already downloaded
          if (trimmed.includes('has already been downloaded')) {
            job.progress = 100;
            job.status = 'completed';
            const alreadyMatch = trimmed.match(/\[download\] (.+) has already been downloaded/);
            if (alreadyMatch) {
              job.filePath = alreadyMatch[1];
              job.filename = path.basename(alreadyMatch[1]);
            }
          }
        }
      });

      proc.stderr.on('data', (data: Buffer) => {
        stderrOutput += data.toString();
        this.logger.warn(`yt-dlp stderr: ${data.toString().trim()}`);
      });

      proc.on('close', (code) => {
        this.activeProcesses.delete(job.id);
        if (code === 0) {
          job.status = 'completed';
          job.progress = 100;

          // If we have a filePath, get its size
          if (job.filePath) {
            // If the file was converted to mp4, ensure filePath reflects that
            const mp4Path = job.filePath.replace(/\.[^/.]+$/, '.mp4');
            if (fs.existsSync(mp4Path)) {
              job.filePath = mp4Path;
            }
          }

          if (job.filePath && fs.existsSync(job.filePath)) {
            const stats = fs.statSync(job.filePath);
            job.fileSize = stats.size;
            job.filename = path.basename(job.filePath);
            job.title = job.filename.replace(/\.[^/.]+$/, '');
          } else {
            // Search for the file in downloads directory
            if (this.downloadDir) {
              const files = fs.readdirSync(this.downloadDir)
                .filter(f => {
                  const ext = path.extname(f).toLowerCase();
                  return ['.mp4', '.mkv', '.webm', '.mp3', '.m4a'].includes(ext);
                })
                .map(f => ({
                  name: f,
                  path: path.join(this.downloadDir as string, f),
                  time: fs.statSync(path.join(this.downloadDir as string, f)).mtimeMs,
                }))
                .sort((a, b) => b.time - a.time);

              if (files.length > 0) {
                const latest = files[0];
                job.filePath = latest.path;
                job.filename = latest.name;
                job.fileSize = fs.statSync(latest.path).size;
                job.title = latest.name.replace(/\.[^/.]+$/, '');
              }
            }
          }

          this.logger.log(`Download completed: ${job.filename} (${job.fileSize} bytes)`);
          resolve();
        } else {
          job.status = 'failed';
          // Extract meaningful error messages from stderr
          let errorMsg = '';
          
          if (stderrOutput) {
            // First try to find ERROR lines
            const errorLines = stderrOutput.split('\n').filter(l => l.includes('ERROR'));
            if (errorLines.length > 0) {
              errorMsg = errorLines[0].substring(0, 200);
            } else {
              // If no ERROR lines, get the last non-empty line
              const lines = stderrOutput.split('\n').filter(l => l.trim());
              errorMsg = lines[lines.length - 1]?.substring(0, 200) || '';
            }
          }
          
          job.error = errorMsg || `yt-dlp exited with code ${code}`;
          this.logger.error(`Download job ${job.id} failed: ${job.error}`);
          reject(new Error(job.error));
        }
      });

      proc.on('error', (err) => {
        this.activeProcesses.delete(job.id);
        job.status = 'failed';
        job.error = `Failed to start yt-dlp: ${err.message}. Make sure yt-dlp is installed (npm install yt-dlp-static or brew install yt-dlp).`;
        this.logger.error(`yt-dlp process error: ${job.error}`);
        reject(err);      });
    });
  }

  /**
   * Get download job progress
   */
  getJobStatus(jobId: string) {
    const job = this.jobs.get(jobId);
    if (!job) {
      throw new NotFoundException(`Download job ${jobId} not found`);
    }
    return {
      id: job.id,
      status: job.status,
      progress: Math.round(job.progress * 10) / 10,
      filename: job.filename,
      fileSize: job.fileSize,
      title: job.title,
      quality: job.quality,
      error: job.error,
      createdAt: job.createdAt,
    };
  }

  /**
   * Get the downloaded file for streaming/download
   */
  getDownloadFile(jobId: string) {
    const job = this.jobs.get(jobId);
    if (!job) {
      throw new NotFoundException('Download job not found');
    }
    if (job.status !== 'completed') {
      throw new BadRequestException('Download not yet completed');
    }
    if (!job.filePath || !fs.existsSync(job.filePath)) {
      throw new NotFoundException('File not found on server');
    }
    return {
      filePath: job.filePath,
      filename: job.filename,
      fileSize: job.fileSize,
    };
  }

  /**
   * List all download jobs
   */
  listJobs() {
    return Array.from(this.jobs.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 100)
      .map(j => ({
        id: j.id,
        status: j.status,
        progress: Math.round(j.progress * 10) / 10,
        filename: j.filename,
        title: j.title,
        quality: j.quality,
        fileSize: j.fileSize,
        error: j.error,
        createdAt: j.createdAt,
      }));
  }

  /**
   * Delete a completed download file
   */
  deleteJob(jobId: string) {
    const job = this.jobs.get(jobId);
    if (!job) {
      throw new NotFoundException('Download job not found');
    }
    // Kill running process if active
    const proc = this.activeProcesses.get(jobId);
    if (proc) {
      try {
        proc.kill('SIGINT');
      } catch (err) {
        this.logger.warn(`Failed to kill process for job ${jobId}`, err);
      }
      this.activeProcesses.delete(jobId);
    }
    // Clean up file
    if (job.filePath && fs.existsSync(job.filePath)) {
      try {
        fs.unlinkSync(job.filePath);
      } catch {}
    }
    this.jobs.delete(jobId);
    this.queueData.delete(jobId);
    this.processQueue();
    return { message: 'Job deleted successfully' };
  }

  /**
   * Clear all download history, files, and terminate active download processes
   */
  clearAllHistory() {
    // Kill running processes
    for (const [jobId, proc] of this.activeProcesses.entries()) {
      try {
        proc.kill('SIGINT');
      } catch (err) {
        this.logger.warn(`Failed to kill process for job ${jobId}`, err);
      }
    }
    this.activeProcesses.clear();

    // Delete files
    for (const job of this.jobs.values()) {
      if (job.filePath && fs.existsSync(job.filePath)) {
        try {
          fs.unlinkSync(job.filePath);
        } catch (err) {
          this.logger.warn(`Failed to delete file: ${job.filePath}`, err);
        }
      }
    }

    this.jobs.clear();
    this.queueData.clear();
    this.logger.log('All download history and files cleared');
    return { success: true, message: 'All history and files cleared successfully' };
  }

  /**
   * Process the download queue based on concurrency limit
   */
  private processQueue() {
    // Count active downloading or merging jobs
    const activeJobs = Array.from(this.jobs.values()).filter(
      j => j.status === 'downloading' || j.status === 'merging'
    );

    if (activeJobs.length >= this.concurrencyLimit) {
      return;
    }

    // Find pending jobs sorted by oldest first
    const pendingJobs = Array.from(this.jobs.values())
      .filter(j => j.status === 'pending')
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

    const slotsAvailable = this.concurrencyLimit - activeJobs.length;
    const nextJobs = pendingJobs.slice(0, slotsAvailable);

    for (const job of nextJobs) {
      const data = this.queueData.get(job.id);
      if (data) {
        job.status = 'downloading';
        job.title = 'Starting download...';
        this.runDownload(job, data.dto, data.cleanUrl)
          .catch(err => {
            this.logger.error(`Download job ${job.id} failed`, err.message);
            job.status = 'failed';
            job.error = err.message || 'Download failed';
          })
          .finally(() => {
            this.queueData.delete(job.id);
            this.processQueue();
          });
      }
    }
  }

  /**
   * Set dynamic download concurrency limit
   */
  setConcurrencyLimit(limit: number) {
    this.concurrencyLimit = limit;
    this.logger.log(`Updated download concurrency limit to: ${limit}`);
    this.processQueue();
    return { success: true, limit: this.concurrencyLimit };
  }

  /**
   * Get download concurrency limit
   */
  getConcurrencyLimit() {
    return { limit: this.concurrencyLimit };
  }
}
