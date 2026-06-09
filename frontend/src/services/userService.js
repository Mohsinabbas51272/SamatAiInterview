import api from './api';

const userService = {
  /**
   * Get current user's profile
   */
  async getProfile() {
    const response = await api.get('/users/profile');
    return response.data;
  },

  /**
   * Update current user's profile
   * @param {object} profileData - { firstName, lastName, phone, location, title, bio, skills, linkedinUrl, githubUrl, portfolioUrl, yearsOfExperience }
   */
  async updateProfile(profileData) {
    const response = await api.patch('/users/profile', profileData);
    return response.data;
  },

  /**
   * Get all users (Admin/HR only)
   * @param {string} [role] - Optional role filter (CANDIDATE, HR, ADMIN)
   */
  async getAll(role) {
    const params = role ? { role } : {};
    const response = await api.get('/users', { params });
    return response.data;
  },

  /**
   * Get a user by ID (Admin/HR only)
   * @param {string|number} id
   */
  async getById(id) {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  /**
   * Update user role (Admin only)
   * @param {string|number} id
   * @param {string} role
   */
  async updateRole(id, role) {
    const response = await api.patch(`/users/${id}/role`, { role });
    return response.data;
  },

  /**
   * Delete a user (Admin only)
   * @param {string|number} id
   */
  async deleteUser(id) {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },
};

export default userService;
