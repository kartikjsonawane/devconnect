const rateLimit = require('express-rate-limit');

const createLimiter = (windowMs, max, message) => {
  // Disable rate limiting in development so testing doesn't get blocked
  if (process.env.NODE_ENV !== 'production') {
    return (req, res, next) => next();
  }
  return rateLimit({
    windowMs,
    max,h
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({ success: false, message });
    },
  });
};

// General API limiter: 100 requests per 15 minutes
const apiLimiter = createLimiter(15 * 60 * 1000, 100, 'Too many requests, please try again later');

// Auth routes: 10 attempts per 15 minutes
const authLimiter = createLimiter(15 * 60 * 1000, 50, 'Too many authentication attempts, please wait before trying again');

// Upload limiter
const uploadLimiter = createLimiter(60 * 60 * 1000, 20, 'Upload limit reached, please try again in an hour');

module.exports = { apiLimiter, authLimiter, uploadLimiter };
