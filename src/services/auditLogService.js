import api from './api';

const auditLogService = {
  async getAll(params = {}) {
    const response = await api.get('/audit-logs', { params });
    return response.data;
  },
};

export default auditLogService;
