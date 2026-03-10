import axios from 'axios';

// Create axios instance with base URL
const API = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to every request if available
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API endpoints
export const authAPI = {
  // Register a new user
  register: async (userData) => {
    try {
      const response = await API.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Registration failed' };
    }
  },

  // Login user
  login: async (credentials) => {
    try {
      const response = await API.post('/auth/login', credentials);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Login failed' };
    }
  },
};

// User API endpoints
export const userAPI = {
  // Get current user profile
  getProfile: async () => {
    try {
      const response = await API.get('/users/profile');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch profile' };
    }
  },

  // Update user profile
  updateProfile: async (profileData) => {
    try {
      const response = await API.put('/users/profile', profileData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update profile' };
    }
  },
};

// Post API endpoints
export const postAPI = {
  createPost: async (postData) => {
    try {
      const response = await API.post('/posts', postData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to create post' };
    }
  },

  getPosts: async () => {
    try {
      const response = await API.get('/posts');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch posts' };
    }
  },
};

// Report API endpoints
export const reportAPI = {
  // Upload avatar image
  uploadAvatar: async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    try {
      const token = localStorage.getItem('token');
      const response = await API.post('/reports/upload-avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Avatar upload failed' };
    }
  },

  // Upload image to Cloudinary via backend
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    try {
      const token = localStorage.getItem('token');
      const response = await API.post('/reports/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Image upload failed' };
    }
  },

  // AI pre-check for similar nearby crimes
  checkSimilar: async (description, coordinates) => {
    try {
      const response = await API.post('/reports/check-similar', { description, coordinates });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'AI check failed' };
    }
  },

  // Submit a new crime report
  createReport: async (reportData) => {
    try {
      const response = await API.post('/reports', reportData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to create report' };
    }
  },

  // Fetch all reports (community feed)
  getAllReports: async () => {
    try {
      const response = await API.get('/reports/all');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch reports' };
    }
  },

  // Fetch own reports
  getMyReports: async () => {
    try {
      const response = await API.get('/reports');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch reports' };
    }
  },
};

// Notification API endpoints
export const notificationAPI = {
  getNotifications: async () => {
    try {
      const response = await API.get('/notifications');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch notifications' };
    }
  },

  markAsRead: async (id) => {
    try {
      const response = await API.put(`/notifications/${id}/read`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to mark as read' };
    }
  },

  markAllAsRead: async () => {
    try {
      const response = await API.put('/notifications/read-all');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to mark all as read' };
    }
  },
};

// Stats API endpoints
export const statsAPI = {
  getOverview: async (params = {}) => {
    try {
      const response = await API.get('/stats/overview', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch statistics' };
    }
  },
};

export default API;