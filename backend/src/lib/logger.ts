import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';
import fs from 'fs';

const colors = {
  error: '\x1b[31m',
  warn: '\x1b[33m',
  info: '\x1b[36m',
  http: '\x1b[34m',
  debug: '\x1b[37m',
  reset: '\x1b[0m',
};

const consoleFormat = winston.format.printf(({ timestamp, level, message, ...metadata }) => {
  const levelUpper = level.toUpperCase().padEnd(5);
  const color = colors[level as keyof typeof colors] || colors.reset;
  const reset = colors.reset;
  
  let formattedMessage = message;
  
  const methodMatch = message.match(/\[(GET|POST|PUT|DELETE|PATCH|OPTIONS)\]/);
  if (methodMatch) {
    const method = methodMatch[1];
    formattedMessage = message.replace(
      /\[(GET|POST|PUT|DELETE|PATCH|OPTIONS)\]/g,
      `${colors.http}[${method}]${reset}`
    );
  }
  
  let log = `${timestamp} ${color}[${levelUpper}]${reset} ${formattedMessage}`;
  
  if (Object.keys(metadata).length > 0 && metadata.constructor === Object) {
    log += ` ${JSON.stringify(metadata)}`;
  }
  
  return log;
});

const fileFormat = winston.format.printf(({ timestamp, level, message, ...metadata }) => {
  const levelUpper = level.toUpperCase().padEnd(5);
  let log = `${timestamp} [${levelUpper}] ${message}`;
  
  if (Object.keys(metadata).length > 0 && metadata.constructor === Object) {
    log += ` ${JSON.stringify(metadata)}`;
  }
  
  return log;
});

const transports: winston.transport[] = [
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      winston.format.errors({ stack: true }),
      consoleFormat
    ),
  }),
];

if (process.env.NODE_ENV === 'production' || process.env.LOG_TO_FILE === 'true') {
  const logsDir = path.join(process.cwd(), 'logs');
  
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }
  
  transports.push(
    new DailyRotateFile({
      filename: path.join(logsDir, 'application-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.errors({ stack: true }),
        fileFormat
      ),
    })
  );
  
  transports.push(
    new DailyRotateFile({
      filename: path.join(logsDir, 'error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxSize: '20m',
      maxFiles: '30d',
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.errors({ stack: true }),
        fileFormat
      ),
    })
  );
}

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'area-backend' },
  transports,
  exceptionHandlers: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        consoleFormat
      ),
    }),
  ],
  rejectionHandlers: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        consoleFormat
      ),
    }),
  ],
});

export default logger;
