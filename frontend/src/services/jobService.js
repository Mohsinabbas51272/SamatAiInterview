import api from './api';

const jobService = {
  /**
   * Get all jobs with optional filters
   * @param {{ status?: string, department?: string, location?: string, type?: string, search?: string }} [filters]
   */
  async getAll(filters = {}) {
    const params = {};
    if (filters.status) params.status = filters.status;
    if (filters.department) params.department = filters.department;
    if (filters.location) params.location = filters.location;
    if (filters.type) params.type = filters.type;
    if (filters.search) params.search = filters.search;
    const response = await api.get('/jobs', { params });
    return response.data;
  },

  /**
   * Get a single job by ID
   * @param {string} id
   */
  async getById(id) {
    const response = await api.get(`/jobs/${id}`);
    return response.data;
  },

  /**
   * Create a new job listing (HR/Admin)
   * @param {object} jobData
   */
  async create(jobData) {
    const response = await api.post('/jobs', jobData);
    return response.data;
  },

  /**
   * Update an existing job (HR/Admin)
   * @param {string} id
   * @param {object} jobData
   */
  async update(id, jobData) {
    const response = await api.patch(`/jobs/${id}`, jobData);
    return response.data;
  },

  /**
   * Delete a job listing (HR/Admin)
   * @param {string} id
   */
  async remove(id) {
    const response = await api.delete(`/jobs/${id}`);
    return response.data;
  },

  /**
   * Apply to a job (Candidate)
   * @param {string} jobId
   * @param {string} [coverLetter]
   */
  async apply(jobId, coverLetter) {
    const response = await api.post(`/jobs/${jobId}/apply`, { coverLetter });
    return response.data;
  },

  /**
   * Get all applications for a job (HR/Admin)
   * @param {string} jobId
   */
  async getApplications(jobId) {
    const response = await api.get(`/jobs/${jobId}/applications`);
    return response.data;
  },

  /**
   * Get my applications (Candidate)
   */
  async getMyApplications() {
    const response = await api.get('/jobs/applications/my');
    return response.data;
  },

  /**
   * Update application status (HR/Admin)
   * @param {string} applicationId
   * @param {string} status
   */
  async updateApplicationStatus(applicationId, status) {
    const response = await api.patch(`/jobs/applications/${applicationId}/status`, { status });
    return response.data;
  },
};

export default jobService;
