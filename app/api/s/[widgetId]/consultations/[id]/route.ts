import { createAdminClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

interface RouteParams {
  params: Promise<{ widgetId: string; id: string }>;
}

// GET /api/s/{widgetId}/consultations/{id} - Get consultation details
export async function GET(request: Request, { params }: RouteParams) {
  const { widgetId, id } = await params;
  const supabase = createAdminClient();

  const { data: consultation, error } = await supabase
    .from('consultations')
    .select('*')
    .eq('id', id)
    .eq('widget_id', widgetId)
    .single();

  if (error || !consultation) {
    return NextResponse.json({ error: 'Consultation not found' }, { status: 404 });
  }

  return NextResponse.json({ consultation });
}
