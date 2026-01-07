import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/db';
import { getRedisClient } from '@/lib/queue';

// Forcer la route à être dynamique pour éviter l'exécution pendant le build
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      database: 'unknown',
      redis: 'unknown'
    }
  };

  // Vérifier Supabase
  try {
    const supabase = getSupabaseClient();
    const { error } = await supabase.from('users').select('id').limit(1);
    health.services.database = error ? 'down' : 'up';
  } catch (error) {
    health.services.database = 'down';
  }

  // Vérifier Redis
  try {
    const redis = getRedisClient();
    await redis.ping();
    health.services.redis = 'up';
  } catch (error) {
    health.services.redis = 'down';
  }

  // Si un service est down, retourner 503
  const allServicesUp = 
    health.services.database === 'up' && 
    health.services.redis === 'up';

  if (!allServicesUp) {
    health.status = 'degraded';
  }

  return NextResponse.json(health, {
    status: allServicesUp ? 200 : 503
  });
}

