import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Download, Search, Video, ListVideo, Trash2,
  CheckCircle2, XCircle, Loader2, Play, Clock,
  HardDrive, Sparkles, Film, MonitorPlay, Zap, RefreshCw,
  FileVideo, FolderDown, Link2, AlertCircle
} from 'lucide-react';
import videoDownloaderService from '../../services/videoDownloaderService';

const QUALITY_OPTIONS = [
  { value: '720', label: '720p', tag: 'HD', color: '#60a5fa' },
  { value: '1080', label: '1080p', tag: 'Full HD', color: '#a78bfa' },
  { value: '1440', label: '1440p', tag: '2K QHD', color: '#f472b6' },
  { value: '2160', label: '2160p', tag: '4K Ultra', color: '#fb923c' },
];

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '—';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function formatDuration(seconds) {
  if (!seconds) return '';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return h > 0
    ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    : `${m}:${String(s).padStart(2, '0')}`;
}

export default function VideoDownloader() {
  const [url, setUrl] = useState('');
  const [quality, setQuality] = useState('1080');
  const [fetchLoading, setFetchLoading] = useState(false);
  const [videoInfo, setVideoInfo] = useState(null);
  const [error, setError] = useState('');
  const [downloads, setDownloads] = useState([]);
  const [downloadingIds, setDownloadingIds] = useState(new Set());
  const [selectedPlaylistItems, setSelectedPlaylistItems] = useState(new Set());
  const [activeTab, setActiveTab] = useState('download'); // download | history
  const pollTimers = useRef({});

  // Load existing downloads on mount
  useEffect(() => {
    loadDownloadHistory();
    return () => {
      Object.values(pollTimers.current).forEach(clearInterval);
    };
  }, []);

  const loadDownloadHistory = async () => {
    try {
      const jobs = await videoDownloaderService.listJobs();
      if (Array.isArray(jobs) && jobs.length > 0) {
        setDownloads(jobs);
      }
    } catch (err) {
      console.log('No existing downloads yet');
    }
  };

  // Fetch video info
  const handleFetchInfo = async () => {
    if (!url.trim()) return;
    setError('');
    setVideoInfo(null);
    setFetchLoading(true);
    try {
      const info = await videoDownloaderService.fetchInfo(url.trim());
      if (info) {
        setVideoInfo(info);
        // If playlist info exists, pre-select all
        if (info.playlist?.videos) {
          setSelectedPlaylistItems(new Set(info.playlist.videos.map((_, i) => i)));
        }
      } else {
        setError('No data returned. Try a different URL.');
      }
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data?.data?.message || err.message || 'Failed to fetch video info';
      setError(msg);
    } finally {
      setFetchLoading(false);
    }
  };

  // Poll for download progress
  const startPolling = useCallback((jobId) => {
    if (pollTimers.current[jobId]) return;
    
    pollTimers.current[jobId] = setInterval(async () => {
      try {
        const status = await videoDownloaderService.getStatus(jobId);
        if (status) {
          setDownloads(prev =>
            prev.map(d => d.id === jobId ? { ...d, ...status } : d)
          );
          if (status.status === 'completed' || status.status === 'failed') {
            clearInterval(pollTimers.current[jobId]);
            delete pollTimers.current[jobId];
            setDownloadingIds(prev => {
              const next = new Set(prev);
              next.delete(jobId);
              return next;
            });
          }
        }
      } catch {
        clearInterval(pollTimers.current[jobId]);
        delete pollTimers.current[jobId];
      }
    }, 2000);
  }, []);

  // Download single video
  const handleDownload = async () => {
    if (!url.trim()) return;
    setError('');
    try {
      const result = await videoDownloaderService.startDownload({
        url: url.trim(),
        quality,
        isPlaylist: false,
      });
      
      if (result?.jobId) {
        const newJob = {
          id: result.jobId,
          title: videoInfo?.title || 'Downloading...',
          quality,
          status: 'pending',
          progress: 0,
          fileSize: 0,
          filename: '',
        };
        setDownloads(prev => [newJob, ...prev]);
        setDownloadingIds(prev => new Set(prev).add(result.jobId));
        startPolling(result.jobId);
        setActiveTab('history');
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to start download');
    }
  };

  // Download playlist items
  const handlePlaylistDownload = async () => {
    if (!url.trim() || !videoInfo?.playlist?.videos) return;
    setError('');

    for (const idx of selectedPlaylistItems) {
      const video = videoInfo.playlist.videos[idx];
      try {
        const result = await videoDownloaderService.startDownload({
          url: url.trim(),
          quality,
          isPlaylist: true,
          playlistIndex: String(video.index),
        });
        if (result?.jobId) {
          const newJob = {
            id: result.jobId,
            title: video.title || `Playlist Item ${video.index}`,
            quality,
            status: 'pending',
            progress: 0,
            fileSize: 0,
            filename: '',
          };
          setDownloads(prev => [newJob, ...prev]);
          setDownloadingIds(prev => new Set(prev).add(result.jobId));
          startPolling(result.jobId);
        }
      } catch (err) {
        console.error(`Failed playlist item ${video.index}`, err);
      }
    }
    setActiveTab('history');
  };

  // Download a single playlist video directly
  const handleSinglePlaylistDownload = async (video) => {
    if (!url.trim()) return;
    setError('');
    try {
      const result = await videoDownloaderService.startDownload({
        url: url.trim(),
        quality,
        isPlaylist: true,
        playlistIndex: String(video.index),
      });
      if (result?.jobId) {
        const newJob = {
          id: result.jobId,
          title: video.title || `Playlist Item ${video.index}`,
          quality,
          status: 'pending',
          progress: 0,
          fileSize: 0,
          filename: '',
        };
        setDownloads(prev => [newJob, ...prev]);
        setDownloadingIds(prev => new Set(prev).add(result.jobId));
        startPolling(result.jobId);
        setActiveTab('history');
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to start download');
    }
  };

  // Delete a job
  const handleDelete = async (jobId) => {
    try {
      await videoDownloaderService.deleteJob(jobId);
      setDownloads(prev => prev.filter(d => d.id !== jobId));
      if (pollTimers.current[jobId]) {
        clearInterval(pollTimers.current[jobId]);
        delete pollTimers.current[jobId];
      }
    } catch (err) {
      console.error('Delete failed', err);
    }
  };

  // Save file to user's machine
  const handleSaveFile = (jobId, filename) => {
    const fileUrl = videoDownloaderService.getFileUrl(jobId);
    const a = document.createElement('a');
    a.href = fileUrl;
    a.download = filename || 'video.mp4';
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Playlist selection helpers
  const togglePlaylistItem = (idx) => {
    setSelectedPlaylistItems(prev => {
      const next = new Set(prev);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });
  };

  const completedDownloads = downloads.filter(d => d.status === 'completed');
  const activeDownloads = downloads.filter(d => d.status !== 'completed' && d.status !== 'failed');
  const failedDownloads = downloads.filter(d => d.status === 'failed');

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', paddingBottom: '3rem' }}>
      {/* Hero Header */}
      <div style={{
        position: 'relative',
        borderRadius: '1.5rem',
        overflow: 'hidden',
        marginBottom: '1.5rem',
        padding: '2.5rem 2rem',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 40%, #312e81 70%, #4f46e5 100%)',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(circle at 80% 20%, rgba(139,92,246,0.3) 0%, transparent 50%), radial-gradient(circle at 20% 80%, rgba(59,130,246,0.2) 0%, transparent 50%)',
        }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
              background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.15)', borderRadius: 999,
              padding: '0.35rem 0.9rem', fontSize: '0.75rem', fontWeight: 700,
              color: 'rgba(255,255,255,0.9)', marginBottom: '1rem',
            }}>
              <Sparkles style={{ width: 14, height: 14 }} />
              <span>Powered by yt-dlp</span>
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'white', margin: '0 0 0.5rem', letterSpacing: '-0.02em' }}>
              <span style={{
                background: 'linear-gradient(135deg, #60a5fa, #a78bfa, #f472b6)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>Video</span> Downloader
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.95rem', lineHeight: 1.6, margin: 0, maxWidth: 540 }}>
              Download videos from 720p to 4K Ultra HD. Single videos & playlists supported.
            </p>
          </motion.div>
        </div>
      </div>

      {/* URL Input Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="vd-card"
      >
        {/* URL Row */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 250, display: 'flex', alignItems: 'center' }}>
            <Link2 style={{ position: 'absolute', left: 14, width: 18, height: 18, color: '#94a3b8', pointerEvents: 'none' }} />
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleFetchInfo()}
              placeholder="Paste YouTube, Vimeo, or any video URL here..."
              className="vd-input"
              id="video-url-input"
            />
            {url && (
              <button onClick={() => { setUrl(''); setVideoInfo(null); setError(''); }}
                style={{ position: 'absolute', right: 10, background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 4 }}>
                <XCircle style={{ width: 16, height: 16 }} />
              </button>
            )}
          </div>
          <button onClick={handleFetchInfo} disabled={fetchLoading || !url.trim()} className="vd-btn-primary" id="fetch-info-btn">
            {fetchLoading ? <Loader2 style={{ width: 18, height: 18 }} className="spin" /> : <Search style={{ width: 18, height: 18 }} />}
            <span>{fetchLoading ? 'Fetching...' : 'Fetch Info'}</span>
          </button>
        </div>

        {/* Quality Selector */}
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', marginRight: 4 }}>Quality:</span>
          {QUALITY_OPTIONS.map((q) => (
            <button
              key={q.value}
              onClick={() => setQuality(q.value)}
              className={`vd-pill ${quality === q.value ? 'active' : ''}`}
              style={quality === q.value ? { borderColor: q.color, background: q.color + '18', color: q.color } : {}}
            >
              <MonitorPlay style={{ width: 13, height: 13 }} />
              <span>{q.label}</span>
              <span style={{ fontSize: '0.62rem', opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{q.tag}</span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="vd-error">
            <AlertCircle style={{ width: 18, height: 18, flexShrink: 0 }} />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Video Info Card */}
      <AnimatePresence>
        {videoInfo && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="vd-card">
            <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
              {/* Thumbnail */}
              {videoInfo.thumbnail && (
                <div style={{ position: 'relative', width: 260, minWidth: 180, borderRadius: '0.85rem', overflow: 'hidden', flexShrink: 0 }}>
                  <img src={videoInfo.thumbnail} alt={videoInfo.title}
                    style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover', display: 'block' }} />
                  <div style={{
                    position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'rgba(0,0,0,0.25)', opacity: 0, transition: 'opacity 0.3s', color: 'white',
                  }} className="vd-thumb-overlay">
                    <Play style={{ width: 32, height: 32 }} />
                  </div>
                  {videoInfo.duration > 0 && (
                    <span style={{
                      position: 'absolute', bottom: 6, right: 6, background: 'rgba(0,0,0,0.8)',
                      color: 'white', fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: 4,
                    }}>{formatDuration(videoInfo.duration)}</span>
                  )}
                </div>
              )}

              {/* Details */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 0.3rem', lineHeight: 1.4 }}
                  className="vd-text-primary">{videoInfo.title}</h3>
                <p style={{ fontSize: '0.82rem', color: '#6366f1', fontWeight: 600, margin: '0 0 0.5rem' }}>{videoInfo.uploader}</p>
                
                {videoInfo.description && (
                  <p style={{ fontSize: '0.78rem', color: '#64748b', lineHeight: 1.5, margin: '0 0 0.65rem',
                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {videoInfo.description}
                  </p>
                )}

                {/* Meta Tags */}
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                  {videoInfo.duration > 0 && (
                    <span className="vd-meta-tag"><Clock style={{ width: 13, height: 13 }} />{formatDuration(videoInfo.duration)}</span>
                  )}
                  {videoInfo.viewCount > 0 && (
                    <span className="vd-meta-tag">
                      <Film style={{ width: 13, height: 13 }} />{(videoInfo.viewCount / 1000).toFixed(0)}K views
                    </span>
                  )}
                  {videoInfo.availableQualities?.length > 0 && (
                    <span className="vd-meta-tag">
                      <MonitorPlay style={{ width: 13, height: 13 }} />
                      Up to {videoInfo.availableQualities[videoInfo.availableQualities.length - 1].quality}p
                    </span>
                  )}
                  {videoInfo.type === 'video' && <span className="vd-meta-tag" style={{ background: '#dcfce7', color: '#16a34a' }}>Single Video</span>}
                </div>

                {/* Download Button */}
                <button onClick={handleDownload} className="vd-btn-download" id="download-single-btn">
                  <Download style={{ width: 18, height: 18 }} />
                  <span>Download {quality}p MP4</span>
                  <Zap style={{ width: 14, height: 14 }} />
                </button>
              </div>
            </div>

            {/* Playlist Section */}
            {videoInfo.playlist && videoInfo.playlist.videos?.length > 0 && (
              <div style={{ marginTop: '1.25rem', borderTop: '1px solid var(--vd-border)', paddingTop: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 6 }}
                    className="vd-text-primary">
                    <ListVideo style={{ width: 18, height: 18 }} />
                    Playlist: {videoInfo.playlist.title} ({videoInfo.playlist.videoCount} videos)
                  </h4>
                  <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                    <button onClick={() => setSelectedPlaylistItems(new Set(videoInfo.playlist.videos.map((_, i) => i)))}
                      className="vd-btn-sm">Select All</button>
                    <button onClick={() => setSelectedPlaylistItems(new Set())} className="vd-btn-sm">Deselect</button>
                    <button onClick={handlePlaylistDownload} disabled={selectedPlaylistItems.size === 0}
                      className="vd-btn-download" style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}>
                      <Download style={{ width: 14, height: 14 }} />
                      Download {selectedPlaylistItems.size} Videos
                    </button>
                  </div>
                </div>

                <div style={{ maxHeight: 340, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {videoInfo.playlist.videos.map((video, idx) => (
                    <div key={video.id || idx} onClick={() => togglePlaylistItem(idx)}
                      className="vd-playlist-row" style={{
                        borderColor: selectedPlaylistItems.has(idx) ? 'rgba(99,102,241,0.3)' : 'transparent',
                        background: selectedPlaylistItems.has(idx) ? 'rgba(99,102,241,0.05)' : 'transparent',
                      }}>
                      <div style={{ width: 22, flexShrink: 0, display: 'flex', alignItems: 'center' }}>
                        {selectedPlaylistItems.has(idx) ?
                          <CheckCircle2 style={{ width: 18, height: 18, color: '#6366f1' }} /> :
                          <div style={{ width: 18, height: 18, border: '2px solid #cbd5e1', borderRadius: '50%' }} />
                        }
                      </div>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', minWidth: 28 }}>#{video.index}</span>
                      <span style={{ fontSize: '0.82rem', fontWeight: 600, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginRight: '0.5rem' }}
                        className="vd-text-primary">{video.title}</span>
                      {video.duration > 0 && <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600, marginRight: '0.75rem' }}>{formatDuration(video.duration)}</span>}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSinglePlaylistDownload(video);
                        }}
                        className="vd-action-btn green"
                        style={{ padding: '4px 8px', display: 'flex', alignItems: 'center', gap: '4px', height: 'auto', flexShrink: 0 }}
                        title="Download this video"
                      >
                        <Download style={{ width: 12, height: 12 }} />
                        <span style={{ fontSize: '0.68rem', fontWeight: 700 }}>Download</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tab Switcher for Downloads */}
      {downloads.length > 0 && (
        <div style={{ display: 'flex', gap: 4, marginTop: '1.5rem', marginBottom: '0.75rem' }}>
          <button onClick={() => setActiveTab('history')}
            className={`vd-tab ${activeTab === 'history' ? 'active' : ''}`}>
            <FolderDown style={{ width: 16, height: 16 }} />
            All Downloads ({downloads.length})
          </button>
          {activeDownloads.length > 0 && (
            <button onClick={() => setActiveTab('active')}
              className={`vd-tab ${activeTab === 'active' ? 'active' : ''}`}>
              <RefreshCw style={{ width: 16, height: 16 }} className="spin" />
              Active ({activeDownloads.length})
            </button>
          )}
          <button onClick={loadDownloadHistory} className="vd-btn-sm" style={{ marginLeft: 'auto' }}>
            <RefreshCw style={{ width: 14, height: 14 }} /> Refresh
          </button>
        </div>
      )}

      {/* Downloads List */}
      <AnimatePresence>
        {downloads.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {(activeTab === 'active' ? activeDownloads : downloads).map((dl) => (
              <motion.div key={dl.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                className="vd-card" style={{ padding: '1rem 1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 6 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h4 style={{ fontSize: '0.88rem', fontWeight: 700, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                      className="vd-text-primary">
                      <FileVideo style={{ width: 14, height: 14, display: 'inline', verticalAlign: -2, marginRight: 6, color: '#6366f1' }} />
                      {dl.title || dl.filename || 'Processing...'}
                    </h4>
                  </div>
                  <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                    {dl.status === 'completed' && (
                      <button onClick={() => handleSaveFile(dl.id, dl.filename)} className="vd-action-btn green" title="Download file">
                        <Download style={{ width: 15, height: 15 }} />
                      </button>
                    )}
                    <button onClick={() => handleDelete(dl.id)} className="vd-action-btn red" title="Delete">
                      <Trash2 style={{ width: 15, height: 15 }} />
                    </button>
                  </div>
                </div>

                {/* Meta Row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: 6 }}>
                  <StatusBadge status={dl.status} />
                  {dl.quality && dl.quality !== 'unknown' && (
                    <span className="vd-badge purple">{dl.quality}p</span>
                  )}
                  {dl.fileSize > 0 && (
                    <span className="vd-badge gray">
                      <HardDrive style={{ width: 11, height: 11 }} /> {formatBytes(dl.fileSize)}
                    </span>
                  )}
                  {dl.filename && <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 500 }}>{dl.filename}</span>}
                </div>

                {/* Progress Bar */}
                {(dl.status === 'downloading' || dl.status === 'pending' || dl.status === 'merging') && (
                  <div style={{
                    position: 'relative', height: 20, borderRadius: 999, overflow: 'hidden',
                    background: 'var(--vd-progress-bg, #f1f5f9)',
                  }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${dl.progress || 0}%` }}
                      transition={{ ease: 'easeOut', duration: 0.5 }}
                      style={{
                        height: '100%', borderRadius: 999,
                        background: dl.status === 'merging'
                          ? 'linear-gradient(90deg, #f472b6, #ec4899)'
                          : 'linear-gradient(90deg, #6366f1, #8b5cf6, #a78bfa)',
                      }}
                    />
                    <span style={{
                      position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.68rem', fontWeight: 800, color: '#334155',
                    }}>
                      {dl.status === 'merging' ? 'Merging...' : `${dl.progress || 0}%`}
                    </span>
                  </div>
                )}

                {/* Error */}
                {dl.status === 'failed' && dl.error && (
                  <p style={{ fontSize: '0.75rem', color: '#ef4444', margin: '4px 0 0', fontWeight: 500 }}>{dl.error}</p>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty State */}
      {downloads.length === 0 && !videoInfo && !fetchLoading && (
        <div style={{
          textAlign: 'center', padding: '3rem 1rem', color: '#94a3b8',
        }}>
          <Video style={{ width: 48, height: 48, margin: '0 auto 1rem', opacity: 0.3 }} />
          <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>No downloads yet</p>
          <p style={{ fontSize: '0.82rem' }}>Paste a video URL above and click Fetch Info to get started</p>
        </div>
      )}

      <style>{`
        .spin { animation: vd-spin 1s linear infinite; }
        @keyframes vd-spin { to { transform: rotate(360deg); } }

        :root {
          --vd-bg: white;
          --vd-border: #e2e8f0;
          --vd-input-bg: #f8fafc;
          --vd-text: #0f172a;
          --vd-text-muted: #64748b;
          --vd-progress-bg: #f1f5f9;
        }
        .dark {
          --vd-bg: #0f172a;
          --vd-border: #1e293b;
          --vd-input-bg: #1e293b;
          --vd-text: #f1f5f9;
          --vd-text-muted: #94a3b8;
          --vd-progress-bg: #1e293b;
        }

        .vd-text-primary { color: var(--vd-text); }

        .vd-card {
          background: var(--vd-bg);
          border: 1px solid var(--vd-border);
          border-radius: 1.15rem;
          padding: 1.35rem;
          margin-bottom: 0.85rem;
          box-shadow: 0 2px 16px rgba(0,0,0,0.03);
        }

        .vd-input {
          width: 100%;
          padding: 0.8rem 2.2rem 0.8rem 2.6rem;
          border: 2px solid var(--vd-border);
          border-radius: 0.85rem;
          font-size: 0.92rem;
          background: var(--vd-input-bg);
          color: var(--vd-text);
          outline: none;
          transition: all 0.2s;
          font-weight: 500;
        }
        .vd-input:focus {
          border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99,102,241,0.1);
        }

        .vd-btn-primary {
          display: flex; align-items: center; gap: 0.45rem;
          padding: 0.8rem 1.4rem;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: white; border: none; border-radius: 0.85rem;
          font-weight: 700; font-size: 0.88rem; cursor: pointer;
          white-space: nowrap; transition: all 0.25s;
          box-shadow: 0 4px 16px rgba(99,102,241,0.3);
        }
        .vd-btn-primary:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 24px rgba(99,102,241,0.4); }
        .vd-btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

        .vd-btn-download {
          display: inline-flex; align-items: center; gap: 0.45rem;
          padding: 0.65rem 1.3rem;
          background: linear-gradient(135deg, #10b981, #059669);
          color: white; border: none; border-radius: 0.75rem;
          font-weight: 700; font-size: 0.88rem; cursor: pointer;
          transition: all 0.25s; box-shadow: 0 4px 16px rgba(16,185,129,0.3);
        }
        .vd-btn-download:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 24px rgba(16,185,129,0.4); }
        .vd-btn-download:disabled { opacity: 0.5; cursor: not-allowed; }

        .vd-btn-sm {
          display: inline-flex; align-items: center; gap: 4px;
          padding: 0.35rem 0.7rem; border: 1px solid var(--vd-border);
          border-radius: 0.5rem; background: transparent;
          font-size: 0.75rem; font-weight: 600; color: var(--vd-text-muted);
          cursor: pointer; transition: all 0.2s;
        }
        .vd-btn-sm:hover { border-color: #6366f1; color: #6366f1; }

        .vd-pill {
          display: flex; align-items: center; gap: 0.3rem;
          padding: 0.35rem 0.65rem; border: 2px solid var(--vd-border);
          border-radius: 999px; font-size: 0.75rem; font-weight: 700;
          cursor: pointer; background: transparent; color: var(--vd-text-muted);
          transition: all 0.2s;
        }

        .vd-error {
          display: flex; align-items: center; gap: 0.65rem;
          padding: 0.85rem 1.15rem; background: #fef2f2;
          border: 1px solid #fecaca; border-radius: 0.85rem;
          color: #dc2626; font-size: 0.85rem; font-weight: 600;
          margin-bottom: 0.85rem;
        }
        .dark .vd-error { background: rgba(220,38,38,0.08); border-color: rgba(220,38,38,0.25); color: #fca5a5; }

        .vd-meta-tag {
          display: inline-flex; align-items: center; gap: 4px;
          font-size: 0.72rem; font-weight: 600; color: #64748b;
          background: #f1f5f9; padding: 3px 8px; border-radius: 999px;
        }
        .dark .vd-meta-tag { background: #1e293b; color: #94a3b8; }

        .vd-tab {
          display: flex; align-items: center; gap: 5px;
          padding: 0.5rem 1rem; border: 2px solid var(--vd-border);
          border-radius: 0.65rem; background: transparent;
          font-size: 0.8rem; font-weight: 700; cursor: pointer;
          color: var(--vd-text-muted); transition: all 0.2s;
        }
        .vd-tab.active {
          border-color: #6366f1; background: rgba(99,102,241,0.08); color: #6366f1;
        }

        .vd-badge {
          display: inline-flex; align-items: center; gap: 3px;
          font-size: 0.68rem; font-weight: 700; padding: 2px 7px;
          border-radius: 4px; text-transform: uppercase; letter-spacing: 0.03em;
        }
        .vd-badge.purple { background: rgba(139,92,246,0.1); color: #8b5cf6; }
        .vd-badge.gray { background: #f1f5f9; color: #64748b; }
        .dark .vd-badge.gray { background: #1e293b; color: #94a3b8; }

        .vd-action-btn {
          padding: 6px; border: none; border-radius: 6px;
          cursor: pointer; transition: all 0.2s; display: flex;
        }
        .vd-action-btn.green { background: rgba(16,185,129,0.1); color: #10b981; }
        .vd-action-btn.green:hover { background: rgba(16,185,129,0.2); }
        .vd-action-btn.red { background: rgba(239,68,68,0.08); color: #ef4444; }
        .vd-action-btn.red:hover { background: rgba(239,68,68,0.15); }

        .vd-playlist-row {
          display: flex; align-items: center; gap: 0.6rem;
          padding: 0.5rem 0.65rem; border-radius: 0.6rem;
          cursor: pointer; transition: background 0.15s;
          border: 2px solid transparent;
        }
        .vd-playlist-row:hover { background: var(--vd-input-bg); }

        .vd-thumb-overlay:hover { opacity: 1 !important; }

        @media (max-width: 640px) {
          .vd-card { padding: 1rem; }
        }
      `}</style>
    </div>
  );
}

function StatusBadge({ status }) {
  const config = {
    pending: { bg: '#fef3c7', color: '#d97706', icon: <Loader2 style={{ width: 11, height: 11 }} className="spin" />, label: 'Pending' },
    downloading: { bg: '#dbeafe', color: '#2563eb', icon: <RefreshCw style={{ width: 11, height: 11 }} className="spin" />, label: 'Downloading' },
    merging: { bg: '#fce7f3', color: '#db2777', icon: <RefreshCw style={{ width: 11, height: 11 }} className="spin" />, label: 'Merging' },
    completed: { bg: '#dcfce7', color: '#16a34a', icon: <CheckCircle2 style={{ width: 11, height: 11 }} />, label: 'Completed' },
    failed: { bg: '#fef2f2', color: '#dc2626', icon: <XCircle style={{ width: 11, height: 11 }} />, label: 'Failed' },
  };
  const c = config[status] || config.pending;
  return (
    <span className="vd-badge" style={{ background: c.bg, color: c.color, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
      {c.icon} {c.label}
    </span>
  );
}
