import api from './api';

const authService = {
  /**
   * Register a new user
   * @param {{ email: string, password: string, firstName: string, lastName: string, role?: string }} data
   */
  async register(data) {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  /**
   * Login with email and password
   * @param {{ email: string, password: string }} credentials
   */
  async login(credentials) {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  /**
   * Refresh access token using refresh token
   * @param {string} refreshToken
   */
  async refresh(refreshToken) {
    const response = await api.post('/auth/refresh', { refreshToken });
    return response.data;
  },

  /**
   * Logout — revoke refresh token
   * @param {string} refreshToken
   */
  async logout(refreshToken) {
    const response = await api.delete('/auth/logout', {
      data: { refreshToken },
    });
    return response.data;
  },
};

export default authService;
