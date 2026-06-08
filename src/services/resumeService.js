import api from './api';

const resumeService = {
  /**
   * Upload a resume file (Candidate)
   * @param {File} file - The resume file (PDF, DOC, DOCX, TXT)
   */
  async upload(file) {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/resume/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  /**
   * Get current user's resume
   */
  async get() {
    const response = await api.get('/resume');
    return response.data;
  },

  /**
   * Delete current user's resume
   */
  async remove() {
    const response = await api.delete('/resume');
    return response.data;
  },
};

export default resumeService;
