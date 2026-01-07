import { Queue, Worker, QueueEvents } from 'bullmq';
import Redis from 'ioredis';
import { logger } from './logger';

// Queue names
export const QUEUE_NAMES = {
  AREA_EXECUTION: 'area_execution',
} as const;

// Lazy initialization pour éviter les problèmes au build time
let _redisConnection: Redis | null = null;
let _areaExecutionQueue: Queue | null = null;
let _areaExecutionQueueEvents: QueueEvents | null = null;

function getRedisConnection(): Redis {
  if (!_redisConnection) {
    // Créer la connexion seulement au runtime, pas au build time
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    _redisConnection = new Redis(redisUrl, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      lazyConnect: false, // Se connecter immédiatement pour le worker
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    });

    _redisConnection.on('error', (err) => {
      logger.error('Redis connection error:', err);
    });

    _redisConnection.on('connect', () => {
      logger.info('Redis connected');
    });
  }
  return _redisConnection;
}

function getAreaExecutionQueue(): Queue {
  if (!_areaExecutionQueue) {
    _areaExecutionQueue = new Queue(QUEUE_NAMES.AREA_EXECUTION, {
      connection: getRedisConnection(),
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
  }
  return _areaExecutionQueue;
}

function getAreaExecutionQueueEvents(): QueueEvents {
  if (!_areaExecutionQueueEvents) {
    _areaExecutionQueueEvents = new QueueEvents(QUEUE_NAMES.AREA_EXECUTION, {
      connection: getRedisConnection(),
    });

    _areaExecutionQueueEvents.on('completed', ({ jobId }) => {
      logger.debug(`Job ${jobId} completed`);
    });

    _areaExecutionQueueEvents.on('failed', ({ jobId, failedReason }) => {
      logger.error(`Job ${jobId} failed: ${failedReason}`);
    });
  }
  return _areaExecutionQueueEvents;
}

// Export function to get Redis client for health checks
export function getRedisClient(): Redis {
  return getRedisConnection();
}

// Exports avec lazy initialization
// Utiliser des getters pour éviter l'initialisation au build time
// Ces exports ne s'exécutent que quand ils sont accédés, pas au chargement du module
let _areaExecutionQueueExport: Queue | undefined;
let _areaExecutionQueueEventsExport: QueueEvents | undefined;
let _redisConnectionExport: Redis | undefined;

export const areaExecutionQueue = new Proxy({} as Queue, {
  get(_target, prop) {
    if (!_areaExecutionQueueExport) {
      _areaExecutionQueueExport = getAreaExecutionQueue();
    }
    return (_areaExecutionQueueExport as any)[prop];
  }
}) as Queue;

export const areaExecutionQueueEvents = new Proxy({} as QueueEvents, {
  get(_target, prop) {
    if (!_areaExecutionQueueEventsExport) {
      _areaExecutionQueueEventsExport = getAreaExecutionQueueEvents();
    }
    return (_areaExecutionQueueEventsExport as any)[prop];
  }
}) as QueueEvents;

export const redisConnection = new Proxy({} as Redis, {
  get(_target, prop) {
    if (!_redisConnectionExport) {
      _redisConnectionExport = getRedisConnection();
    }
    return (_redisConnectionExport as any)[prop];
  }
}) as Redis;

// Export par défaut
export default areaExecutionQueue;

