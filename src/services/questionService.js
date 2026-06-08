import api from './api';

const questionService = {
  async getAll(params = {}) {
    const response = await api.get('/questions', { params });
    return response.data;
  },
  async getById(id) {
    const response = await api.get(`/questions/${id}`);
    return response.data;
  },
  async create(questionData) {
    const response = await api.post('/questions', questionData);
    return response.data;
  },
  async update(id, questionData) {
    const response = await api.patch(`/questions/${id}`, questionData);
    return response.data;
  },
  async delete(id) {
    const response = await api.delete(`/questions/${id}`);
    return response.data;
  },
};

export default questionService;
