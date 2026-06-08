import api from './api';

const notificationService = {
  async getAll() {
    const response = await api.get('/notifications');
    return response.data;
  },
  async markAsRead(id) {
    const response = await api.patch(`/notifications/${id}/read`);
    return response.data;
  },
  async markAllAsRead() {
    const response = await api.post('/notifications/read-all');
    return response.data;
  },
};

export default notificationService;
