import { createAdminClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { TEMPLATE_OPTIONS } from '@/types';

interface RouteParams {
  params: Promise<{ widgetId: string }>;
}

// GET /api/s/{widgetId} - Returns widget config and recent consultations
export async function GET(request: Request, { params }: RouteParams) {
  const { widgetId } = await params;
  const supabase = createAdminClient();

  // Fetch widget configuration
  const { data: widget, error: widgetError } = await supabase
    .from('widgets')
    .select(`
      id, template, client_name, brand_color, logo_url, cta_text,
      enabled_options, status, user_id, sales_tool_enabled,
      business_phone, business_email, business_website, business_tagline
    `)
    .eq('id', widgetId)
    .single();

  if (widgetError || !widget) {
    return NextResponse.json({ error: 'Widget not found' }, { status: 404 });
  }

  if (widget.status !== 'active') {
    return NextResponse.json({ error: 'Widget is inactive' }, { status: 403 });
  }

  if (!widget.sales_tool_enabled) {
    return NextResponse.json({ error: 'Sales tool not enabled for this widget' }, { status: 403 });
  }

  // Check owner's subscription
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('tier, status')
    .eq('user_id', widget.user_id)
    .single();

  if (subscription && !['active', 'trialing'].includes(subscription.status)) {
    return NextResponse.json({ error: 'Widget is temporarily unavailable' }, { status: 403 });
  }

  const tier = subscription?.tier || 'starter';
  const hasFullFeatures = tier === 'pro' || tier === 'agency';

  // Get available options for this template
  const templateOptions = TEMPLATE_OPTIONS[widget.template as keyof typeof TEMPLATE_OPTIONS] || [];
  const enabledOptionKeys = widget.enabled_options || templateOptions.map(o => o.key);
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
      .eq('widget_id', widgetId)
      .order('created_at', { ascending: false })
      .limit(20);

    consultations = consultationData || [];
  }

  return NextResponse.json({
    widget: {
      id: widget.id,
      template: widget.template,
      client_name: widget.client_name,
      brand_color: widget.brand_color,
      logo_url: widget.logo_url,
      cta_text: widget.cta_text,
      options: availableOptions,
      business_phone: widget.business_phone,
      business_email: widget.business_email,
      business_website: widget.business_website,
      business_tagline: widget.business_tagline,
    },
    tier,
    hasFullFeatures,
    consultations,
  });
}
