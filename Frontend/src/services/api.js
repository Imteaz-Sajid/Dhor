import axios from 'axios';

// Create axios instance with base URL
const API = axios.create({
  baseURL: 'http://localhost:5001/api',
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

// Vote API endpoints
export const voteAPI = {
  // Cast or update a vote on a report ('Confirm' or 'Dispute')
  castVote: async (reportId, voteType) => {
    try {
      const response = await API.post(`/votes/${reportId}`, { voteType });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to cast vote' };
    }
  },

  // Get confirm/dispute counts and current user's vote for a report
  getStats: async (reportId) => {
    try {
      const response = await API.get(`/votes/${reportId}/stats`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch vote stats' };
    }
  },
};

// Dashboard API endpoints
export const dashboardAPI = {
  getMyReports: async () => {
    try {
      const response = await API.get('/user/my-reports');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch dashboard data' };
    }
  },
};

// Police API endpoints
export const policeAPI = {
  updateStatus: async (reportId, statusData) => {
    try {
      const response = await API.patch(`/police/update-status/${reportId}`, statusData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update report status' };
    }
  },
  verifyReport: async (reportId) => {
    try {
      const response = await API.patch(`/police/verify/${reportId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to verify report' };
    }
  },
  markNotVerified: async (reportId) => {
    try {
      const response = await API.patch(`/police/not-verified/${reportId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to mark not verified' };
    }
  },
  assignCase: async (reportId) => {
    try {
      const response = await API.patch(`/police/assign/${reportId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to assign case' };
    }
  },
  updateCaseStatus: async (reportId, policeStatus) => {
    try {
      const response = await API.patch(`/police/case-status/${reportId}`, { policeStatus });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update case status' };
    }
  },
  getMyCases: async () => {
    try {
      const response = await API.get('/police/my-cases');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch cases' };
    }
  },
};

// Comment API endpoints
export const commentAPI = {
  getComments: async (reportId) => {
    try {
      const response = await API.get(`/comments/${reportId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch comments' };
    }
  },

  addComment: async (reportId, text) => {
    try {
      const response = await API.post(`/comments/${reportId}`, { text });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to post comment' };
    }
  },
};

// Station (Police Directory) API endpoints
export const stationAPI = {
  getAllStations: async () => {
    try {
      const response = await API.get('/stations');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch stations' };
    }
  },

  addStation: async (data) => {
    try {
      const response = await API.post('/stations', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to add station' };
    }
  },

  updateStation: async (id, data) => {
    try {
      const response = await API.put(`/stations/${id}`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update station' };
    }
  },
};

// Missing Entities API endpoints
export const missingAPI = {
  create: async (data) => {
    try {
      const response = await API.post('/missing', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to create missing report' };
    }
  },

  getAll: async (params = {}) => {
    try {
      const response = await API.get('/missing', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch missing reports' };
    }
  },

  updateStatus: async (id, status) => {
    try {
      const response = await API.put(`/missing/${id}/status`, { status });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update status' };
    }
  },
};

export default API;