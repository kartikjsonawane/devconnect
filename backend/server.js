require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');

const connectDB = require('./config/db');
const logger = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');
const notificationService = require('./services/notificationService');
const User = require('./models/User');

// Route imports
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const postRoutes = require('./routes/post.routes');
const followRoutes = require('./routes/follow.routes');
const notificationRoutes = require('./routes/notification.routes');
const connectionRoutes = require('./routes/connection.routes');
const chatRoutes = require('./routes/chat.routes');
const searchRoutes = require('./routes/search.routes');
const aiRoutes = require('./routes/ai.routes');

// Connect to MongoDB
connectDB();

const app = express();
// Trust Render's proxy so rate-limiter sees real client IPs, not Render's internal IP
app.set('trust proxy', 1);
const httpServer = http.createServer(app);

// Socket.io setup
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
  pingTimeout: 60000,
});

// Export io for use in controllers
module.exports.io = io;

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parsing & sanitization
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());
app.use(mongoSanitize());

// Compression & logging
app.use(compression());
app.use(morgan('combined', {
  stream: { write: (message) => logger.http(message.trim()) },
  skip: (req) => process.env.NODE_ENV === 'test',
}));

// Rate limiting
app.use('/api/', apiLimiter);

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/posts', postRoutes);
app.use('/api/v1/users', followRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/connections', connectionRoutes);
app.use('/api/v1/chat', chatRoutes);
app.use('/api/v1/search', searchRoutes);
app.use('/api/v1/ai', aiRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Global error handler
app.use(errorHandler);

// Socket.io
notificationService.setSocketIO(io);

const onlineUsers = new Map();

io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Authentication required'));
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    socket.userId = decoded.userId;
    next();
  } catch {
    next(new Error('Invalid token'));
  }
});

io.on('connection', async (socket) => {
  const userId = socket.userId;
  logger.debug(`Socket connected: ${userId}`);

  socket.join(`user:${userId}`);
  onlineUsers.set(userId, socket.id);

  await User.findByIdAndUpdate(userId, { isOnline: true, lastSeen: new Date() });
  io.emit('user:online', { userId });

  socket.on('post:join', (postId) => socket.join(`post:${postId}`));
  socket.on('post:leave', (postId) => socket.leave(`post:${postId}`));
  socket.on('feed:join', () => socket.join(`followers:${userId}`));

  socket.on('chat:typing', ({ conversationId }) => {
    socket.to(`chat:${conversationId}`).emit('chat:typing', { userId, conversationId });
  });
  socket.on('chat:stop_typing', ({ conversationId }) => {
    socket.to(`chat:${conversationId}`).emit('chat:stop_typing', { userId, conversationId });
  });
  socket.on('chat:join', (conversationId) => socket.join(`chat:${conversationId}`));

  socket.on('disconnect', async () => {
    logger.debug(`Socket disconnected: ${userId}`);
    onlineUsers.delete(userId);
    await User.findByIdAndUpdate(userId, { isOnline: false, lastSeen: new Date() });
    io.emit('user:offline', { userId });
  });
});

// Start server
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  logger.info(`DevConnect API running on port ${PORT} [${process.env.NODE_ENV}]`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  httpServer.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Rejection:', reason);
});

module.exports = app;
