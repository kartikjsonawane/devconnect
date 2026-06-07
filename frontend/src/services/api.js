import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — attach access token
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle token refresh
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await axios.post(`${BASE_URL}/auth/refresh-token`, {}, { withCredentials: true });
        const { accessToken } = response.data.data;
        useAuthStore.getState().setAccessToken(accessToken);
        processQueue(null, accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        useAuthStore.getState().logout();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error.response?.data || error);
  }
);

// Auth
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  refreshToken: () => api.post('/auth/refresh-token'),
  changePassword: (data) => api.put('/auth/change-password', data),
};

// Users
export const userAPI = {
  getProfile: (username) => api.get(`/users/${username}`),
  updateProfile: (data) => api.put('/users/me', data),
  uploadAvatar: (formData) => api.post('/users/me/avatar', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  searchUsers: (params) => api.get('/users/search', { params }),
  getTrending: () => api.get('/users/trending'),
  getRecommended: () => api.get('/users/recommended'),
  getAnalytics: () => api.get('/users/me/analytics'),
  getGitHubData: (username) => api.get(`/users/github/${username}`),
  endorseSkill: (userId, skill) => api.post(`/users/${userId}/endorse/${skill}`),
};

// Posts
export const postAPI = {
  createPost: (formData) => api.post('/posts', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getFeed: (params) => api.get('/posts/feed', { params }),
  getExplore: (params) => api.get('/posts/explore', { params }),
  getPost: (postId) => api.get(`/posts/${postId}`),
  updatePost: (postId, data) => api.put(`/posts/${postId}`, data),
  deletePost: (postId) => api.delete(`/posts/${postId}`),
  toggleLike: (postId) => api.post(`/posts/${postId}/like`),
  bookmarkPost: (postId) => api.post(`/posts/${postId}/bookmark`),
  getBookmarks: (params) => api.get('/posts/bookmarks', { params }),
  getUserPosts: (username, params) => api.get(`/posts/user/${username}`, { params }),
  getComments: (postId, params) => api.get(`/posts/${postId}/comments`, { params }),
  createComment: (postId, data) => api.post(`/posts/${postId}/comments`, data),
  deleteComment: (postId, commentId) => api.delete(`/posts/${postId}/comments/${commentId}`),
};

// Follows
export const followAPI = {
  followUser: (userId) => api.post(`/users/${userId}/follow`),
  unfollowUser: (userId) => api.delete(`/users/${userId}/follow`),
  getFollowers: (userId, params) => api.get(`/users/${userId}/followers`, { params }),
  getFollowing: (userId, params) => api.get(`/users/${userId}/following`, { params }),
};

// Notifications
export const notificationAPI = {
  getNotifications: (params) => api.get('/notifications', { params }),
  markAsRead: (notificationIds) => api.put('/notifications/read', { notificationIds }),
  deleteNotification: (id) => api.delete(`/notifications/${id}`),
};

// Connections
export const connectionAPI = {
  sendRequest: (data) => api.post('/connections/request', data),
  respondToRequest: (requestId, action) => api.put(`/connections/request/${requestId}`, { action }),
  getPendingRequests: () => api.get('/connections/requests/pending'),
  getConnections: () => api.get('/connections'),
};

// Chat
export const chatAPI = {
  getConversations: () => api.get('/chat/conversations'),
  startConversation: (userId) => api.get(`/chat/conversations/${userId}/start`),
  getMessages: (conversationId, params) => api.get(`/chat/conversations/${conversationId}/messages`, { params }),
  sendMessage: (conversationId, data) => api.post(`/chat/conversations/${conversationId}/messages`, data),
};

// Search
export const searchAPI = {
  search: (params) => api.get('/search', { params }),
};

// AI
export const aiAPI = {
  getPostIdeas: () => api.get('/ai/post-ideas'),
};


// Comments (alias over postAPI for convenience)
export const commentAPI = {
  getComments: (postId, params) => api.get(`/posts/${postId}/comments`, { params }),
  createComment: (postId, data) => api.post(`/posts/${postId}/comments`, data),
  deleteComment: (postId, commentId) => api.delete(`/posts/${postId}/comments/${commentId}`),
};

export default api;
