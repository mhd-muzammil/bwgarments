const winston = require('winston');

const { combine, timestamp, printf, colorize, errors } = winston.format;

const logFormat = printf(({ level, message, timestamp, stack, ...meta }) => {
  const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
  return `${timestamp} [${level}]: ${stack || message}${metaStr}`;
});

const transports = [];

// In production (Render/Railway), log to stdout only — no file system writes
if (process.env.NODE_ENV === 'production') {
  transports.push(
    new winston.transports.Console({
      format: combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), logFormat),
    })
  );
} else {
  // Development: console with colors + file logs
  transports.push(
    new winston.transports.Console({
      format: combine(colorize(), timestamp({ format: 'HH:mm:ss' }), logFormat),
    })
  );

  try {
    transports.push(
      new winston.transports.File({ filename: 'logs/error.log', level: 'error', maxsize: 5242880, maxFiles: 5 }),
      new winston.transports.File({ filename: 'logs/combined.log', maxsize: 5242880, maxFiles: 5 })
    );
  } catch {
    // File logging optional in dev
  }
}

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: combine(errors({ stack: true }), timestamp(), logFormat),
  defaultMeta: { service: 'bw-garments' },
  transports,
});

// Stream for Morgan HTTP logging
logger.stream = {
  write: (message) => logger.http(message.trim()),
};

module.exports = logger;
