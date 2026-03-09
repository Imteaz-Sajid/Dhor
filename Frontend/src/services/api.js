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

  // Login user (for future implementation)
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

export default API;
