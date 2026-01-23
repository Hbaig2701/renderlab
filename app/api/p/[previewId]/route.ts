import { createAdminClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

interface RouteParams {
  params: Promise<{ previewId: string }>;
}

// GET /api/p/{previewId} - Get preview data for shareable page
export async function GET(request: Request, { params }: RouteParams) {
  const { previewId } = await params;
  const supabase = createAdminClient();

  // Fetch consultation by preview ID
  const { data: consultation, error: consultationError } = await supabase
    .from('consultations')
    .select('*')
    .eq('preview_id', previewId)
    .single();

  if (consultationError || !consultation) {
    return NextResponse.json({ error: 'Preview not found' }, { status: 404 });
  }

  // Fetch widget for business info
  const { data: widget, error: widgetError } = await supabase
    .from('widgets')
    .select(`
      client_name, logo_url, brand_color,
      business_phone, business_email, business_website, business_tagline
    `)
    .eq('id', consultation.widget_id)
    .single();

  if (widgetError || !widget) {
    return NextResponse.json({ error: 'Widget not found' }, { status: 404 });
  }

  // Increment view count
  await supabase
    .from('consultations')
    .update({ preview_views: (consultation.preview_views || 0) + 1 })
    .eq('id', consultation.id);

  return NextResponse.json({
    before_url: consultation.original_image_url,
    after_url: consultation.transformed_image_url,
    style_label: consultation.style_label,
    quote_amount: consultation.quote_amount,
    business: {
      name: widget.client_name,
      logo_url: widget.logo_url,
      brand_color: widget.brand_color,
      phone: widget.business_phone,
      email: widget.business_email,
      website: widget.business_website,
      tagline: widget.business_tagline,
    },
  });
}
