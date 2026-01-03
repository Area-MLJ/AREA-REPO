import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();

    // Récupérer l'IP du client
    const clientHost =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      request.ip ||
      'unknown';

    // Récupérer tous les services avec leurs actions et réactions
    const { data: services, error: servicesError } = await supabase
      .from('services')
      .select(`
        id,
        name,
        display_name,
        service_actions (
          id,
          name,
          display_name,
          description,
          polling_supported,
          webhook_supported
        ),
        service_reactions (
          id,
          name,
          display_name,
          description
        )
      `)
      .order('name', { ascending: true });

    if (servicesError) {
      throw new Error(`Failed to fetch services: ${servicesError.message}`);
    }

    // Formater la réponse selon le format attendu
    const formattedServices = (services || []).map((service: any) => ({
      name: service.name,
      actions: (service.service_actions || []).map((action: any) => ({
        name: action.name,
        description: action.display_name || action.description || '',
      })),
      reactions: (service.service_reactions || []).map((reaction: any) => ({
        name: reaction.name,
        description: reaction.display_name || reaction.description || '',
      })),
    }));

    const response = {
      client: {
        host: clientHost,
      },
      server: {
        current_time: Math.floor(Date.now() / 1000), // Unix timestamp
        services: formattedServices,
      },
    };

    return NextResponse.json(response);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

