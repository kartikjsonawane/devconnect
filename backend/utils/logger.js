const winston = require('winston');
const path = require('path');
const fs = require('fs');

const { combine, timestamp, errors, json, colorize, simple } = winston.format;

const isProduction = process.env.NODE_ENV === 'production';

// Always log to console — PaaS platforms (Render, Railway, etc.) capture stdout
const transports = [
  new winston.transports.Console({
    format: isProduction
      ? combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), errors({ stack: true }), json())
      : combine(colorize(), simple()),
  }),
];

// File transports only when the logs dir exists (local dev)
const logsDir = path.join(__dirname, '../logs');
if (!isProduction && fs.existsSync(logsDir)) {
  transports.push(
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      maxsize: 5242880,
      maxFiles: 5,
    }),
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      maxsize: 5242880,
      maxFiles: 5,
    })
  );
}

const logger = winston.createLogger({
  level: isProduction ? 'info' : 'debug',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    errors({ stack: true }),
    json()
  ),
  defaultMeta: { service: 'devconnect-api' },
  transports,
});

module.exports = logger;
