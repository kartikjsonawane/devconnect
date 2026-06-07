import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import useAuthStore from '../store/authStore';
import { useNotificationStore, useOnlineStore, useChatStore } from '../store/index';
import toast from 'react-hot-toast';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || '';

let socket = null;

const useSocket = () => {
  const { accessToken, isAuthenticated } = useAuthStore();
  const { addNotification } = useNotificationStore();
  const { setOnline, setOffline } = useOnlineStore();
  const { addMessage, setTyping } = useChatStore();
  const socketRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated || !accessToken) return;

    socket = io(SOCKET_URL, {
      auth: { token: accessToken },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('✅ Socket connected');
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    // ── Online Status ──────────────────────────────────────────────────────────
    socket.on('user:online', ({ userId }) => setOnline(userId));
    socket.on('user:offline', ({ userId }) => setOffline(userId));

    // ── Notifications ──────────────────────────────────────────────────────────
    socket.on('notification:new', ({ notification }) => {
      addNotification(notification);
      toast.custom((t) => (
        <div
          className={`flex items-center gap-3 bg-white dark:bg-slate-800 shadow-lg rounded-xl p-3 border border-gray-100 dark:border-slate-700 ${
            t.visible ? 'animate-slide-down' : 'opacity-0'
          }`}
        >
          <img
            src={notification.sender?.avatar || '/default-avatar.png'}
            className="w-8 h-8 rounded-full"
            alt=""
          />
          <p className="text-sm text-gray-700 dark:text-gray-300">{notification.message}</p>
        </div>
      ), { duration: 4000 });
    });

    // ── Feed updates ───────────────────────────────────────────────────────────
    socket.on('feed:new_post', ({ post }) => {
      // Handled per-page via event emitter or query invalidation
    });

    // ── Chat ───────────────────────────────────────────────────────────────────
    socket.on('chat:message', ({ message }) => {
      addMessage(message.conversation, message);
    });

    socket.on('chat:typing', ({ userId, conversationId }) => {
      setTyping(conversationId, userId, true);
    });

    socket.on('chat:stop_typing', ({ userId, conversationId }) => {
      setTyping(conversationId, userId, false);
    });

    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
    });

    return () => {
      socket.disconnect();
      socket = null;
    };
  }, [isAuthenticated, accessToken]);

  return socketRef.current;
};

export const getSocket = () => socket;
export default useSocket;
