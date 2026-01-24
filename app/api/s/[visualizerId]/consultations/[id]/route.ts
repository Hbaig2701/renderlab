import { createAdminClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

interface RouteParams {
  params: Promise<{ visualizerId: string; id: string }>;
}

// GET /api/s/{visualizerId}/consultations/{id} - Get consultation details
export async function GET(request: Request, { params }: RouteParams) {
  const { visualizerId, id } = await params;
  const supabase = createAdminClient();

  const { data: consultation, error } = await supabase
    .from('consultations')
    .select('*')
    .eq('id', id)
    .eq('visualizer_id', visualizerId)
    .single();

  if (error || !consultation) {
    return NextResponse.json({ error: 'Consultation not found' }, { status: 404 });
  }

  return NextResponse.json({ consultation });
}
