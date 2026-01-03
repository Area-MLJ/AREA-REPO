/**
 * Types de jobs pour la queue
 */

export interface AreaExecutionJobData {
  hookLogId: string;
  areaActionId: string;
}

export type QueueJobType = 'area_execution';

