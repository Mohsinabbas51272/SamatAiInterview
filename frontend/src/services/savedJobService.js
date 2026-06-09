import api from './api';

const savedJobService = {
  async getAll() {
    const response = await api.get('/saved-jobs');
    return response.data;
  },
  async save(jobId) {
    const response = await api.post(`/saved-jobs/${jobId}`);
    return response.data;
  },
  async unsave(jobId) {
    const response = await api.delete(`/saved-jobs/${jobId}`);
    return response.data;
  },
};

export default savedJobService;
