import api, { API_BASE_URL } from './api';

/**
 * Helper to extract data from NestJS TransformInterceptor wrapper
 * Response format: { success, statusCode, message, data, timestamp }
 */
const extractData = (response) => {
  const d = response.data;
  // Handle TransformInterceptor wrapped response
  if (d && typeof d === 'object' && 'data' in d && 'success' in d) {
    return d.data;
  }
  return d;
};

const videoDownloaderService = {
  /**
   * Fetch video/playlist metadata
   * @param {string} url - Video or playlist URL
   */
  async fetchInfo(url) {
    const response = await api.post('/video-downloader/info', { url });
    return extractData(response);
  },

  /**
   * Start downloading a video
   * @param {object} data - { url, quality, isPlaylist, playlistIndex }
   */
  async startDownload(data) {
    const response = await api.post('/video-downloader/download', data);
    return extractData(response);
  },

  /**
   * Get download job status/progress
   * @param {string} jobId
   */
  async getStatus(jobId) {
    const response = await api.get(`/video-downloader/status/${jobId}`);
    return extractData(response);
  },

  /**
   * List all download jobs
   */
  async listJobs() {
    const response = await api.get('/video-downloader/jobs');
    return extractData(response);
  },

  /**
   * Get download URL for completed file
   * @param {string} jobId
   */
  getFileUrl(jobId) {
    return `${API_BASE_URL}/video-downloader/file/${jobId}`;
  },

  /**
   * Delete a download job
   * @param {string} jobId
   */
  async deleteJob(jobId) {
    const response = await api.delete(`/video-downloader/${jobId}`);
    return extractData(response);
  },

  /**
   * Get download concurrency limit
   */
  async getConcurrencyLimit() {
    const response = await api.get('/video-downloader/concurrency');
    return extractData(response);
  },

  /**
   * Set download concurrency limit
   */
  async setConcurrencyLimit(limit) {
    const response = await api.post('/video-downloader/concurrency', { limit });
    return extractData(response);
  },

  /**
   * Clear all download jobs and file history
   */
  async clearAllHistory() {
    const response = await api.delete('/video-downloader/history/clear');
    return extractData(response);
  },
};

export default videoDownloaderService;
