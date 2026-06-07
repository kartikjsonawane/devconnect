const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

const onlineUsers = new Map(); // userId -> socketId

const initSocketIO = (io) => {
  // Auth middleware for socket connections
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) {
      return next(new Error('Authentication token required'));
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      socket.userId = decoded.id;
      next();
    } catch (err) {
      return next(new Error('Invalid or expired token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.userId;
    logger.info(`Socket connected: ${userId} [${socket.id}]`);

    // Track online status
    onlineUsers.set(userId, socket.id);
    io.emit('user:online', { userId });

    // Join personal room for private notifications
    socket.join(`user:${userId}`);

    // ─── Chat Events ───────────────────────────────────────────────────────────
    socket.on('chat:join', ({ conversationId }) => {
      socket.join(`chat:${conversationId}`);
    });

    socket.on('chat:leave', ({ conversationId }) => {
      socket.leave(`chat:${conversationId}`);
    });

    socket.on('chat:typing', ({ conversationId, recipientId }) => {
      socket.to(`chat:${conversationId}`).emit('chat:typing', {
        userId,
        conversationId,
      });
    });

    socket.on('chat:stop_typing', ({ conversationId }) => {
      socket.to(`chat:${conversationId}`).emit('chat:stop_typing', {
        userId,
        conversationId,
      });
    });

    // ─── Notification Events ───────────────────────────────────────────────────
    socket.on('notification:read', ({ notificationId }) => {
      // Handled via REST; socket just for real-time UI sync
    });

    // ─── Disconnect ────────────────────────────────────────────────────────────
    socket.on('disconnect', () => {
      onlineUsers.delete(userId);
      io.emit('user:offline', { userId });
      logger.info(`Socket disconnected: ${userId}`);
    });
  });
};

const getSocketId = (userId) => onlineUsers.get(userId?.toString());

const isOnline = (userId) => onlineUsers.has(userId?.toString());

const getOnlineUsers = () => Array.from(onlineUsers.keys());

// Helper: emit notification to a specific user
const emitToUser = (io, userId, event, data) => {
  const socketId = getSocketId(userId);
  if (socketId) {
    io.to(`user:${userId}`).emit(event, data);
  }
};

module.exports = { initSocketIO, getSocketId, isOnline, getOnlineUsers, emitToUser };
