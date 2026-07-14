import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useTheme } from '../hooks/useTheme';
import authService from '../services/authService';
import userService from '../services/userService';
import notificationService from '../services/notificationService';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // Theme integrations
  const themeProps = useTheme();

  // ─── Auth State ───
  const [user, setUser] = useState(null); // Full user object from backend
  const [profile, setProfile] = useState(null); // User's profile
  const [role, setRole] = useState('guest'); // 'guest', 'candidate', 'hr', 'admin'
  const [authLoading, setAuthLoading] = useState(true); // Initial session restore
  const [authError, setAuthError] = useState(null);

  // ─── Notifications State ───
  const [notifications, setNotifications] = useState([]);

  // ─── AI Config (Frontend Persistent) ───
  const [aiConfig, setAiConfigState] = useState(() => {
    const saved = localStorage.getItem('aiConfig');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // ignore
      }
    }
    return {
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      screeningWeight: 40,
      interviewWeight: 60,
      systemPrompt: 'You are Aria, an AI technical interviewer. Ask candidates technical questions and evaluate their responses constructively.',
    };
  });

  const setAiConfig = (config) => {
    localStorage.setItem('aiConfig', JSON.stringify(config));
    setAiConfigState(config);
  };

  // ─── UI State ───
  const [toasts, setToasts] = useState([]);

  // ─── Toast Helper ───
  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  // ─── Helper: Extract data from API response ───
  const extractData = useCallback((response) => {
    if (response && response.data !== undefined) {
      return response.data;
    }
    return response;
  }, []);

  // ─── Fetch Notifications ───
  const fetchNotifications = useCallback(async () => {
    if (!localStorage.getItem('accessToken')) return;
    try {
      const res = await notificationService.getAll();
      const data = extractData(res) || [];
      
      setNotifications((prev) => {
        // Only notify about new notifications if it's not the initial fetch
        if (prev && prev.length > 0) {
          const prevIds = new Set(prev.map(n => n.id));
          const newUnread = data.filter(n => !n.isRead && !prevIds.has(n.id));
          newUnread.forEach(n => {
            addToast(`🔔 ${n.title}: ${n.message}`, 'info');
          });
        }
        return data;
      });
    } catch (err) {
      console.warn('Failed to fetch notifications:', err);
    }
  }, [addToast]);

  const markNotificationRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      addToast('Notification marked as read', 'success');
    } catch (err) {
      addToast('Failed to mark notification as read', 'error');
    }
  };

  const markAllNotificationsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      addToast('All notifications marked as read', 'success');
    } catch (err) {
      addToast('Failed to mark all as read', 'error');
    }
  };

  // ─── Restore Session on Mount ───
  useEffect(() => {
    const restoreSession = async () => {
      const accessToken = localStorage.getItem('accessToken');
      const storedUser = localStorage.getItem('user');

      if (!accessToken) {
        setAuthLoading(false);
        return;
      }

      try {
        // Restore user from localStorage first for quick render
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          setUser(parsed);
          setRole((parsed.role || 'guest').toLowerCase());
        }

        // Fetch fresh profile from backend
        const profileRes = await userService.getProfile();
        const profileData = extractData(profileRes);
        setProfile(profileData);
      } catch (err) {
        console.warn('Session restore failed:', err);
      } finally {
        setAuthLoading(false);
      }
    };

    restoreSession();
  }, []);

  // ─── Poll Notifications ───
  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 15000); // every 15s
      return () => clearInterval(interval);
    } else {
      setNotifications([]);
    }
  }, [user, fetchNotifications]);

  // ─── Register ───
  const registerUser = async ({ email, password, firstName, lastName, role: selectedRole }) => {
    setAuthError(null);
    try {
      await authService.register({
        email,
        password,
        firstName,
        lastName,
        role: selectedRole || 'CANDIDATE',
      });

      // Auto-login after registration
      const loginRes = await authService.login({ email, password });
      const loginData = extractData(loginRes);

      const userData = loginData.user;
      const accessToken = loginData.accessToken;
      const refreshToken = loginData.refreshToken;

      // Store tokens
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(userData));

      setUser(userData);
      setRole((userData.role || 'guest').toLowerCase());

      // Fetch profile
      try {
        const profileRes = await userService.getProfile();
        setProfile(extractData(profileRes));
      } catch {
        // Profile may not exist yet
      }

      addToast(`Welcome, ${userData.profile?.firstName || userData.email}! Account created successfully.`, 'success');
      return { success: true, user: userData };
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed. Please try again.';
      setAuthError(message);
      addToast(message, 'error');
      return { success: false, error: message };
    }
  };

  // ─── Login ───
  const loginUser = async (email, password) => {
    setAuthError(null);
    try {
      const loginRes = await authService.login({ email, password });
      const loginData = extractData(loginRes);

      const userData = loginData.user;
      const accessToken = loginData.accessToken;
      const refreshToken = loginData.refreshToken;

      // Store tokens
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(userData));

      setUser(userData);
      setRole((userData.role || 'guest').toLowerCase());

      // Fetch profile
      try {
        const profileRes = await userService.getProfile();
        setProfile(extractData(profileRes));
      } catch {
        // Profile fetch failed silently
      }

      addToast(`Welcome back, ${userData.profile?.firstName || userData.email}!`, 'success');
      return { success: true, user: userData };
    } catch (err) {
      const message = err.response?.data?.message || 'Invalid email or password.';
      setAuthError(message);
      addToast(message, 'error');
      return { success: false, error: message };
    }
  };

  // ─── Logout ───
  const logoutUser = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await authService.logout(refreshToken);
      }
    } catch {
      // Ignore logout API errors
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      setUser(null);
      setProfile(null);
      setRole('guest');
      setNotifications([]);
      addToast('You have been logged out successfully.', 'info');
    }
  };

  // ─── Update Profile ───
  const updateProfile = async (profileData) => {
    try {
      const res = await userService.updateProfile(profileData);
      const updated = extractData(res);
      setProfile(updated);
      addToast('Profile updated successfully!', 'success');
      return { success: true, profile: updated };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to update profile.';
      addToast(message, 'error');
      return { success: false, error: message };
    }
  };

  // ─── Helper: Get role-based redirect path ───
  const getRoleRedirect = (userRole) => {
    const roleKey = (userRole || '').toLowerCase();
    switch (roleKey) {
      case 'admin':
      case 'super_admin':
        return '/admin/users';
      case 'hr':
        return '/hr';
      case 'candidate':
        return '/candidate';
      default:
        return '/';
    }
  };

  // ─── Check auth status ───
  const isAuthenticated = !!user && !!localStorage.getItem('accessToken');

  return (
    <AppContext.Provider
      value={{
        ...themeProps,
        // Auth
        user,
        profile,
        role,
        authLoading,
        authError,
        isAuthenticated,
        loginUser,
        registerUser,
        logoutUser,
        updateProfile,
        getRoleRedirect,
        extractData,
        // Notifications
        notifications,
        fetchNotifications,
        markNotificationRead,
        markAllNotificationsRead,
        // AI Config
        aiConfig,
        setAiConfig,
        // UI
        toasts,
        addToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
