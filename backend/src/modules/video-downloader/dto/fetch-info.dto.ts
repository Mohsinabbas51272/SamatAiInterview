import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class FetchInfoDto {
  @ApiProperty({ description: 'Video or Playlist URL (YouTube, Vimeo, etc.)' })
  @IsString()
  @IsNotEmpty()
  url: string;
}

export class StartDownloadDto {
  @ApiProperty({ description: 'Video or Playlist URL' })
  @IsString()
  @IsNotEmpty()
  url: string;

  @ApiProperty({ description: 'Desired quality: 720, 1080, 1440, 2160', default: '1080' })
  @IsString()
  @IsOptional()
  quality?: string;

  @ApiProperty({ description: 'Whether this is a playlist download', default: false })
  @IsBoolean()
  @IsOptional()
  isPlaylist?: boolean;

  @ApiProperty({ description: 'For playlist: specific video index to download (1-based). Omit for all.' })
  @IsString()
  @IsOptional()
  playlistIndex?: string;
}
