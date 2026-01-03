import { Queue, Worker, QueueEvents } from 'bullmq';
import Redis from 'ioredis';
import { logger } from './logger';

// Redis connection
const redisConnection = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});

redisConnection.on('error', (err) => {
  logger.error('Redis connection error:', err);
});

redisConnection.on('connect', () => {
  logger.info('Redis connected');
});

// Queue names
export const QUEUE_NAMES = {
  AREA_EXECUTION: 'area_execution',
} as const;

// Area execution queue
export const areaExecutionQueue = new Queue(QUEUE_NAMES.AREA_EXECUTION, {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: {
      age: 24 * 3600, // Keep completed jobs for 24 hours
      count: 1000,
    },
    removeOnFail: {
      age: 7 * 24 * 3600, // Keep failed jobs for 7 days
    },
  },
});

// Queue events for monitoring
export const areaExecutionQueueEvents = new QueueEvents(QUEUE_NAMES.AREA_EXECUTION, {
  connection: redisConnection,
});

areaExecutionQueueEvents.on('completed', ({ jobId }) => {
  logger.debug(`Job ${jobId} completed`);
});

areaExecutionQueueEvents.on('failed', ({ jobId, failedReason }) => {
  logger.error(`Job ${jobId} failed: ${failedReason}`);
});

export { redisConnection };
export default areaExecutionQueue;

