import { createAdminClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { TEMPLATE_OPTIONS } from '@/types';

interface RouteParams {
  params: Promise<{ visualizerId: string }>;
}

// GET /api/s/{visualizerId} - Returns visualizer config and recent consultations
export async function GET(request: Request, { params }: RouteParams) {
  const { visualizerId } = await params;
  const supabase = createAdminClient();

  // Fetch visualizer configuration
  const { data: visualizer, error: visualizerError } = await supabase
    .from('visualizers')
    .select(`
      id, template, client_name, brand_color, logo_url, cta_text,
      enabled_options, status, user_id, sales_tool_enabled,
      business_phone, business_email, business_website, business_tagline
    `)
    .eq('id', visualizerId)
    .single();

  if (visualizerError || !visualizer) {
    return NextResponse.json({ error: 'Visualizer not found' }, { status: 404 });
  }

  if (visualizer.status !== 'active') {
    return NextResponse.json({ error: 'Visualizer is inactive' }, { status: 403 });
  }

  if (!visualizer.sales_tool_enabled) {
    return NextResponse.json({ error: 'Sales tool not enabled for this visualizer' }, { status: 403 });
  }

  // Check owner's subscription
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('tier, status')
    .eq('user_id', visualizer.user_id)
    .single();

  if (subscription && !['active', 'trialing'].includes(subscription.status)) {
    return NextResponse.json({ error: 'Visualizer is temporarily unavailable' }, { status: 403 });
  }

  const tier = subscription?.tier || 'starter';
  const hasFullFeatures = tier === 'pro' || tier === 'agency';

  // Get available options for this template
  const templateOptions = TEMPLATE_OPTIONS[visualizer.template as keyof typeof TEMPLATE_OPTIONS] || [];
  const enabledOptionKeys = visualizer.enabled_options || templateOptions.map(o => o.key);
  const availableOptions = templateOptions.filter(o => enabledOptionKeys.includes(o.key));

  // For Pro/Agency, fetch recent consultations (max 20)
  let consultations: Array<{
    id: string;
    client_name: string | null;
    created_at: string;
    style_label: string | null;
    sent_at: string | null;
  }> = [];

  if (hasFullFeatures) {
    const { data: consultationData } = await supabase
      .from('consultations')
      .select('id, client_name, created_at, style_label, sent_at')
      .eq('visualizer_id', visualizerId)
      .order('created_at', { ascending: false })
      .limit(20);

    consultations = consultationData || [];
  }

  return NextResponse.json({
    widget: {
      id: visualizer.id,
      template: visualizer.template,
      client_name: visualizer.client_name,
      brand_color: visualizer.brand_color,
      logo_url: visualizer.logo_url,
      cta_text: visualizer.cta_text,
      options: availableOptions,
      business_phone: visualizer.business_phone,
      business_email: visualizer.business_email,
      business_website: visualizer.business_website,
      business_tagline: visualizer.business_tagline,
    },
    tier,
    hasFullFeatures,
    consultations,
  });
}
