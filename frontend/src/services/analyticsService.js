import api from './api';

const analyticsService = {
  /**
   * Get dashboard statistics (role-aware: candidate vs HR/Admin)
   */
  async getDashboard() {
    const response = await api.get('/analytics/dashboard');
    return response.data;
  },
};

export default analyticsService;
