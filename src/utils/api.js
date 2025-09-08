import axios from 'axios';
import { API_BASE_URL } from './constants';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  signupInitiate: (data) => api.post('/signup/initiate', data),
  signupVerify: (data) => api.post('/signup/verify', data),
  login: (data) => api.post('/login', data),
  forgotInitiate: (data) => api.post('/forgot/initiate', data),
  forgotReset: (data) => api.post('/forgot/reset', data),
};

// User API calls
export const userAPI = {
  getProfile: () => api.get('/me'),
  updateProfile: (data) => api.put('/me', data),
  getLastSeen: (userId) => api.get(`/users/${userId}/last-seen`),
};

// Conversation API calls
export const conversationAPI = {
  getConversations: () => api.get('/conversations'),
  createPrivateChat: (data) => api.post('/conversations/private', data),
  createGroupChat: (data) => api.post('/conversations/group', data),
  addParticipant: (conversationId, data) => api.post(`/conversations/${conversationId}/participants`, data),
  removeParticipant: (conversationId, userId) => api.delete(`/conversations/${conversationId}/participants/${userId}`),
  getMessages: (conversationId, params) => api.get(`/conversations/${conversationId}/messages`, { params }),
};

// Message API calls
export const messageAPI = {
  sendMessage: (data) => api.post('/messages', data),
  markAsRead: (data) => api.post('/messages/read', data),
};

export default api;