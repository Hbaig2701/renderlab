import { createAdminClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { TEMPLATE_OPTIONS } from '@/types';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  const { id } = await params;

  const supabase = createAdminClient();

  // Fetch widget configuration
  const { data: widget, error } = await supabase
    .from('widgets')
    .select('id, template, client_name, brand_color, logo_url, cta_text, enabled_options, status, user_id')
    .eq('id', id)
    .single();

  if (error || !widget) {
    return NextResponse.json(
      { error: 'Widget not found' },
      { status: 404 }
    );
  }

  if (widget.status !== 'active') {
    return NextResponse.json(
      { error: 'Widget is currently inactive' },
      { status: 403 }
    );
  }

  // Check if owner's subscription is active
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('status')
    .eq('user_id', widget.user_id)
    .single();

  if (subscription && !['active', 'trialing'].includes(subscription.status)) {
    return NextResponse.json(
      { error: 'Widget is temporarily unavailable' },
      { status: 403 }
    );
  }

  // Get available options for this template
  const templateOptions = TEMPLATE_OPTIONS[widget.template as keyof typeof TEMPLATE_OPTIONS] || [];

  // Filter to only enabled options (null means all enabled)
  const enabledOptionKeys = widget.enabled_options || templateOptions.map(o => o.key);
  const availableOptions = templateOptions.filter(o => enabledOptionKeys.includes(o.key));

  // Return widget config (without sensitive data)
  return NextResponse.json({
    id: widget.id,
    template: widget.template,
    client_name: widget.client_name,
    brand_color: widget.brand_color,
    logo_url: widget.logo_url,
    cta_text: widget.cta_text,
    options: availableOptions,
  });
}
