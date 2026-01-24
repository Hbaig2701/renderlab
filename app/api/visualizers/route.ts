import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { generateWidgetId } from '@/lib/utils/generate-id';

export async function GET() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: visualizers, error } = await supabase
    .from('visualizers')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(visualizers);
}

export async function POST(request: Request) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { template, client_name, brand_color, logo_url, cta_text } = body;

  if (!template || !client_name) {
    return NextResponse.json(
      { error: 'Template and client name are required' },
      { status: 400 }
    );
  }

  const { data: visualizer, error } = await supabase
    .from('visualizers')
    .insert({
      id: generateWidgetId(),
      user_id: user.id,
      template,
      client_name,
      brand_color: brand_color || '#F59E0B',
      logo_url: logo_url || null,
      cta_text: cta_text || 'See Your Transformation',
      status: 'active',
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(visualizer, { status: 201 });
}
