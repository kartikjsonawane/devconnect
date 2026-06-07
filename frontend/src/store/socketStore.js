import { create } from 'zustand';
import { io } from 'socket.io-client';
import { useNotificationStore } from './notificationStore';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export const useSocketStore = create((set, get) => ({
  socket: null,
  onlineUsers: new Set(),

  connect: (token) => {
    if (get().socket?.connected) return;

    const socket = io(SOCKET_URL, {
      auth: { token },
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    socket.on('connect', () => {
      set({ socket });
      socket.emit('feed:join');
    });

    socket.on('notification:new', (notification) => {
      useNotificationStore.getState().addNotification(notification);
    });

    socket.on('user:online', ({ userId }) => {
      set((state) => ({ onlineUsers: new Set([...state.onlineUsers, userId]) }));
    });

    socket.on('user:offline', ({ userId }) => {
      set((state) => {
        const next = new Set(state.onlineUsers);
        next.delete(userId);
        return { onlineUsers: next };
      });
    });

    socket.on('disconnect', () => set({ socket: null }));

    set({ socket });
  },

  disconnect: () => {
    get().socket?.disconnect();
    set({ socket: null, onlineUsers: new Set() });
  },

  emit: (event, data) => get().socket?.emit(event, data),

  joinPost: (postId) => get().socket?.emit('post:join', postId),
  leavePost: (postId) => get().socket?.emit('post:leave', postId),
}));
