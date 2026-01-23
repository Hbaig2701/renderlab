import { createAdminClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { nanoid } from 'nanoid';

interface RouteParams {
  params: Promise<{ widgetId: string }>;
}

// POST /api/s/{widgetId}/consultations - Create a new consultation
export async function POST(request: Request, { params }: RouteParams) {
  const { widgetId } = await params;

  try {
    const { client_name, original_image } = await request.json();

    if (!original_image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Fetch widget and verify it's active with sales tool enabled
    const { data: widget, error: widgetError } = await supabase
      .from('widgets')
      .select('id, user_id, status, sales_tool_enabled')
      .eq('id', widgetId)
      .single();

    if (widgetError || !widget) {
      return NextResponse.json({ error: 'Widget not found' }, { status: 404 });
    }

    if (widget.status !== 'active' || !widget.sales_tool_enabled) {
      return NextResponse.json({ error: 'Sales tool not available' }, { status: 403 });
    }

    // Generate consultation ID
    const consultationId = `cons_${nanoid(12)}`;

    // Store the original image in Supabase storage
    // Extract base64 data and upload
    const base64Match = original_image.match(/^data:(image\/\w+);base64,(.+)$/);
    if (!base64Match) {
      return NextResponse.json({ error: 'Invalid image format' }, { status: 400 });
    }

    const mimeType = base64Match[1];
    const base64Data = base64Match[2];
    const extension = mimeType.split('/')[1] || 'jpg';
    const buffer = Buffer.from(base64Data, 'base64');

    // Upload to storage
    const storagePath = `${widgetId}/${consultationId}/original.${extension}`;
    const { error: uploadError } = await supabase.storage
      .from('consultation-images')
      .upload(storagePath, buffer, {
        contentType: mimeType,
        upsert: true,
      });

    if (uploadError) {
      console.error('[Consultation] Upload error:', uploadError);
      return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 });
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('consultation-images')
      .getPublicUrl(storagePath);

    const originalImageUrl = urlData.publicUrl;

    // Create consultation record
    const { error: insertError } = await supabase
      .from('consultations')
      .insert({
        id: consultationId,
        widget_id: widgetId,
        user_id: widget.user_id,
        client_name: client_name || null,
        original_image_url: originalImageUrl,
      });

    if (insertError) {
      console.error('[Consultation] Insert error:', insertError);
      return NextResponse.json({ error: 'Failed to create consultation' }, { status: 500 });
    }

    return NextResponse.json({
      consultation_id: consultationId,
      original_image_url: originalImageUrl,
    });
  } catch (error) {
    console.error('[Consultation] Error:', error);
    return NextResponse.json({ error: 'Failed to create consultation' }, { status: 500 });
  }
}

// GET /api/s/{widgetId}/consultations - List consultations
export async function GET(request: Request, { params }: RouteParams) {
  const { widgetId } = await params;
  const supabase = createAdminClient();

  const { data: consultations, error } = await supabase
    .from('consultations')
    .select('id, client_name, created_at, style_label, sent_at, preview_id')
    .eq('widget_id', widgetId)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch consultations' }, { status: 500 });
  }

  return NextResponse.json({ consultations: consultations || [] });
}
