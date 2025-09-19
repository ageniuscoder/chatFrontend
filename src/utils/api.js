import axios from 'axios';
import { API_BASE_URL } from './constants';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Include cookies in requests
});

api.interceptors.request.use(
  (config) => {
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
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  signupInitiate: (data) => api.post('/signup/initiate', data),
  signupVerify: (data) => api.post('/signup/verify', data),
  login: (data) => api.post('/login', data),
  logout: () => api.post('/logout'), // ✅ Add new logout API call
  forgotInitiate: (data) => api.post('/forgot/initiate', data),
  forgotReset: (data) => api.post('/forgot/reset', data),
};

// User API calls
export const userAPI = {
  getProfile: () => api.get('/me'),
  updateProfile: (data) => api.put('/me', data),
};

export const featureAPI = {
  getLastSeen: (userId) => api.get(`/users/${userId}/last-seen`),
  searchUsers: (query) => api.get(`/users/search?q=${query}`), // Add this line
}
// Conversation API calls
export const conversationAPI = {
  getConversations: () => api.get('/conversations'),
  createPrivateChat: (data) => api.post('/conversations/private', data),
  createGroupChat: (data) => api.post('/conversations/group', data),
  addParticipant: (conversationId, data) => api.post(`/conversations/${conversationId}/participants`, data),
  removeParticipant: (conversationId, userId) => api.delete(`/conversations/${conversationId}/participants/${userId}`),
  getMessages: (conversationId, params) => api.get(`/conversations/${conversationId}/messages`, { params }),
  getParticipants: (conversationId) => api.get(`/conversations/${conversationId}/participants`),
};

// Message API calls
export const messageAPI = {
  sendMessage: (data) => api.post('/messages', data),
  markAsRead: (data) => api.post('/messages/read', data),
  editMessage: (messageId, data) => api.patch(`/messages/${messageId}`, data),
};

export default api;