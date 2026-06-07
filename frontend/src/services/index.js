import api from './api';

// ─── Auth ──────────────────────────────────────────────────────────────────────
export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  refreshToken: () => api.post('/auth/refresh'),
  getMe: () => api.get('/auth/me'),
  changePassword: (data) => api.put('/auth/change-password', data),
};

// ─── User ──────────────────────────────────────────────────────────────────────
export const userService = {
  getProfile: (username) => api.get(`/users/${username}`),
  updateProfile: (data) => api.put('/users/profile', data),
  uploadAvatar: (formData) =>
    api.post('/users/avatar', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  uploadCover: (formData) =>
    api.post('/users/cover', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  searchDevelopers: (params) => api.get('/users/search', { params }),
  getTrending: (limit = 10) => api.get('/users/trending', { params: { limit } }),
  getRecommended: () => api.get('/users/me/recommended'),
  syncGitHub: (data) => api.post('/users/github/sync', data),
  endorseSkill: (userId, skill) => api.post(`/users/${userId}/endorse`, { skill }),
  getAnalytics: () => api.get('/users/me/analytics'),
  getBookmarks: () => api.get('/users/me/bookmarks'),
  updateSettings: (data) => api.put('/users/settings', data),
  deactivateAccount: () => api.delete('/users/account'),
};

// ─── Posts ─────────────────────────────────────────────────────────────────────
export const postService = {
  getFeed: (params) => api.get('/posts/feed', { params }),
  getTrending: (params) => api.get('/posts/trending', { params }),
  getPost: (id) => api.get(`/posts/${id}`),
  getUserPosts: (userId, params) => api.get(`/posts/user/${userId}`, { params }),
  createPost: (formData) =>
    api.post('/posts', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  updatePost: (id, data) => api.put(`/posts/${id}`, data),
  deletePost: (id) => api.delete(`/posts/${id}`),
  toggleLike: (id) => api.post(`/posts/${id}/like`),
  toggleBookmark: (id) => api.post(`/posts/${id}/bookmark`),
};

// ─── Comments ─────────────────────────────────────────────────────────────────
export const commentService = {
  getComments: (postId, params) => api.get(`/comments/${postId}`, { params }),
  createComment: (postId, data) => api.post(`/comments/${postId}`, data),
  deleteComment: (id) => api.delete(`/comments/${id}`),
};

// ─── Follow ────────────────────────────────────────────────────────────────────
export const followService = {
  toggleFollow: (userId) => api.post(`/follow/${userId}`),
  getFollowers: (userId, params) => api.get(`/follow/${userId}/followers`, { params }),
  getFollowing: (userId, params) => api.get(`/follow/${userId}/following`, { params }),
};

// ─── Notifications ─────────────────────────────────────────────────────────────
export const notificationService = {
  getAll: (params) => api.get('/notifications', { params }),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
};

// ─── Connections ───────────────────────────────────────────────────────────────
export const connectionService = {
  getAll: () => api.get('/connections'),
  getPending: () => api.get('/connections/pending'),
  sendRequest: (userId, data) => api.post(`/connections/${userId}`, data),
  respond: (requestId, action) => api.put(`/connections/${requestId}/respond`, { action }),
};

// ─── Chat ──────────────────────────────────────────────────────────────────────
export const chatService = {
  getConversations: () => api.get('/chat/conversations'),
  getOrCreateConversation: (userId) => api.get(`/chat/conversations/${userId}/with`),
  getMessages: (conversationId, params) => api.get(`/chat/${conversationId}/messages`, { params }),
  sendMessage: (conversationId, data) => api.post(`/chat/${conversationId}/messages`, data),
};

// ─── Search ────────────────────────────────────────────────────────────────────
export const searchService = {
  search: (params) => api.get('/search', { params }),
};
