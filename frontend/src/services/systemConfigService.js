import api from './api';

const systemConfigService = {
  async get() {
    const response = await api.get('/system-config');
    return response.data;
  },
  async update(configData) {
    const response = await api.post('/system-config', configData);
    return response.data;
  },
};

export default systemConfigService;
