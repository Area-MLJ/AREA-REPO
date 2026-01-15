import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getSupabaseClient();
    const { data: reactions, error } = await supabase
      .from('service_reactions')
      .select('*, service_reaction_params(*)')
      .eq('service_id', params.id)
      .order('name', { ascending: true });

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch service reactions' },
        { status: 500 }
      );
    }

    return NextResponse.json(reactions || []);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

