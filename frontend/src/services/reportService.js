import api from './api';

const reportService = {
  /**
   * Get all evaluation reports for current user
   */
  async getAll() {
    const response = await api.get('/reports');
    return response.data;
  },

  /**
   * Get report by interview ID
   * @param {string} interviewId
   */
  async getByInterviewId(interviewId) {
    const response = await api.get(`/reports/interview/${interviewId}`);
    return response.data;
  },
};

export default reportService;
