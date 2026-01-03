// Charger les variables d'environnement
import 'dotenv/config';

import { Worker } from 'bullmq';
import { redisConnection, QUEUE_NAMES } from '@/lib/queue';
import { processAreaExecution } from '@/core/engine/executor';
import { AreaExecutionJobData } from '@/core/queue/jobs';
import { logger } from '@/lib/logger';
import { initializeRegistry } from '@/core/nodes/registry-init';

// Initialiser le registry des modules
initializeRegistry();

logger.info('Starting AREA worker...');

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
    connection: redisConnection,
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
  await worker.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, closing worker...');
  await worker.close();
  process.exit(0);
});

logger.info('AREA worker started and ready to process jobs');

