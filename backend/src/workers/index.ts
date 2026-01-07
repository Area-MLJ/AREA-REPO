// Charger les variables d'environnement
import 'dotenv/config';

import { Worker } from 'bullmq';
import Redis from 'ioredis';
import { QUEUE_NAMES } from '@/lib/queue';
import { processAreaExecution } from '@/core/engine/executor';
import { AreaExecutionJobData } from '@/core/queue/jobs';
import { logger } from '@/lib/logger';
import { initializeRegistry } from '@/core/nodes/registry-init';
import { syncServices, watchServices, startPeriodicSync } from '@/core/services/service-loader';

// Synchroniser les services depuis les fichiers JSON
syncServices()
  .then(() => {
    logger.info('Services synchronized from JSON files');
    
    // Activer le watch mode en développement
    if (process.env.NODE_ENV !== 'production') {
      watchServices();
    } else {
      // En production, synchronisation périodique
      startPeriodicSync(10); // Toutes les 10 minutes
    }
  })
  .catch((error) => {
    logger.error('Failed to sync services:', error);
  });

// Initialiser le registry des modules
initializeRegistry();

logger.info('Starting AREA worker...');

// Créer une nouvelle connexion Redis pour le worker
// BullMQ peut avoir des problèmes avec une connexion partagée
const redisUrl = process.env.REDIS_URL || 'redis://redis:6379';
const workerRedisOptions = {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  retryStrategy: (times: number) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
};

const workerRedisConnection = new Redis(redisUrl, workerRedisOptions);

workerRedisConnection.on('error', (err: Error) => {
  logger.error('Worker Redis connection error:', err);
});

workerRedisConnection.on('connect', () => {
  logger.info('Worker Redis connected');
});

const worker = new Worker<AreaExecutionJobData>(
  QUEUE_NAMES.AREA_EXECUTION,
  async (job) => {
    logger.info(`Processing job ${job.id}:`, job.data);

    const { hookLogId, areaActionId } = job.data;

    try {
      await processAreaExecution(hookLogId, areaActionId);
      logger.info(`Job ${job.id} completed successfully`);
    } catch (error: any) {
      logger.error(`Job ${job.id} failed:`, error);
      throw error; // Laisser BullMQ gérer les retries
    }
  },
  {
    connection: {
      ...workerRedisOptions,
      url: redisUrl,
    } as any,
    concurrency: 5, // Traiter jusqu'à 5 jobs en parallèle
    removeOnComplete: {
      age: 24 * 3600, // Garder les jobs complétés pendant 24h
      count: 1000,
    },
    removeOnFail: {
      age: 7 * 24 * 3600, // Garder les jobs échoués pendant 7 jours
    },
  }
);

worker.on('completed', (job) => {
  logger.info(`Job ${job.id} has been completed`);
});

worker.on('failed', (job, err) => {
  logger.error(`Job ${job?.id} has failed:`, err);
});

worker.on('error', (err) => {
  logger.error('Worker error:', err);
});

// Gestion propre de l'arrêt
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, closing worker...');
  const { stopWatching } = await import('@/core/services/service-loader');
  stopWatching();
  await worker.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, closing worker...');
  const { stopWatching } = await import('@/core/services/service-loader');
  stopWatching();
  await worker.close();
  process.exit(0);
});

logger.info('AREA worker started and ready to process jobs');

