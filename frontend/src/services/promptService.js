import api from './api';

const promptService = {
  async getAll() {
    const response = await api.get('/prompts');
    return response.data;
  },
  async create(promptData) {
    const response = await api.post('/prompts', promptData);
    return response.data;
  },
  async update(id, promptData) {
    const response = await api.patch(`/prompts/${id}`, promptData);
    return response.data;
  },
  async activate(id) {
    const response = await api.patch(`/prompts/${id}/activate`);
    return response.data;
  },
  async delete(id) {
    const response = await api.delete(`/prompts/${id}`);
    return response.data;
  },
};

export default promptService;
