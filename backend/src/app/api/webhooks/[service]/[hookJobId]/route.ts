import { NextRequest, NextResponse } from 'next/server';
import hookService from '@/core/services/hook-service';
import { areaExecutionQueue } from '@/lib/queue';
import { logger } from '@/lib/logger';

export async function POST(
  request: NextRequest,
  { params }: { params: { service: string; hookJobId: string } }
) {
  try {
    // Récupérer le hook_job
    const hookJob = await hookService.getHookJobById(params.hookJobId);
    if (!hookJob) {
      return NextResponse.json({ error: 'Hook job not found' }, { status: 404 });
    }

    if (hookJob.type !== 'webhook') {
      return NextResponse.json(
        { error: 'Hook job is not a webhook type' },
        { status: 400 }
      );
    }

    if (hookJob.status !== 'active') {
      return NextResponse.json(
        { error: 'Hook job is not active' },
        { status: 400 }
      );
    }

    // Récupérer le payload
    const payload = await request.text();
    const eventPayload = payload || JSON.stringify({});

    // Créer un hook_log
    const hookLog = await hookService.createHookLog({
      hook_job_id: hookJob.id,
      event_payload: eventPayload,
    });

    // Créer un job dans la queue
    await areaExecutionQueue.add(
      'area_execution',
      {
        hookLogId: hookLog.id,
        areaActionId: hookJob.area_action_id,
      },
      {
        jobId: `webhook-${hookLog.id}`,
      }
    );

    logger.info(
      `Webhook received for service ${params.service}, hook_job ${params.hookJobId}, created hook_log ${hookLog.id}`
    );

    return NextResponse.json({
      message: 'Webhook received',
      hook_log_id: hookLog.id,
    });
  } catch (error: any) {
    logger.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

