import api from './api';

const interviewService = {
  /**
   * Schedule an interview (HR/Admin)
   * @param {object} data - { jobId, candidateId, hrId?, type?, scheduledAt, duration?, meetingLink?, notes? }
   */
  async schedule(data) {
    const response = await api.post('/interviews', data);
    return response.data;
  },

  /**
   * Get all interviews for current user
   */
  async getAll() {
    const response = await api.get('/interviews');
    return response.data;
  },

  /**
   * Get interview details by ID
   * @param {string} id
   */
  async getById(id) {
    const response = await api.get(`/interviews/${id}`);
    return response.data;
  },

  /**
   * Start/Join an interview session (Candidate)
   * @param {string} id
   */
  async start(id) {
    const response = await api.post(`/interviews/${id}/start`);
    return response.data;
  },

  // Alias used by InterviewRoom.jsx
  async startInterview(id) {
    return this.start(id);
  },

  /**
   * Submit an answer to a question (Candidate)
   * @param {string} interviewId
   * @param {object} answerData - { questionId, answerText, timeTaken?, audioUrl?, videoUrl? }
   */
  async submitAnswer(interviewId, answerData) {
    const response = await api.post(`/interviews/${interviewId}/answer`, answerData);
    return response.data;
  },

  /**
   * End the interview and compile AI report (Candidate)
   * @param {string} id
   */
  async end(id) {
    const response = await api.post(`/interviews/${id}/end`);
    return response.data;
  },

  // Alias used by InterviewRoom.jsx
  async endInterview(id) {
    return this.end(id);
  },
};

export default interviewService;
