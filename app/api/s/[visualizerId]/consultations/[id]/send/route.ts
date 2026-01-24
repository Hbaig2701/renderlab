import { createAdminClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { sendPreviewEmail } from '@/lib/email/send-preview';

interface RouteParams {
  params: Promise<{ visualizerId: string; id: string }>;
}

// POST /api/s/{visualizerId}/consultations/{id}/send - Send preview to client
export async function POST(request: Request, { params }: RouteParams) {
  const { visualizerId, id } = await params;

  try {
    const { email, include_quote, quote_amount, personal_message } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Fetch consultation
    const { data: consultation, error: consultationError } = await supabase
      .from('consultations')
      .select('*')
      .eq('id', id)
      .eq('visualizer_id', visualizerId)
      .single();

    if (consultationError || !consultation) {
      return NextResponse.json({ error: 'Consultation not found' }, { status: 404 });
    }

    if (!consultation.transformed_image_url) {
      return NextResponse.json({ error: 'No transformation found. Please transform first.' }, { status: 400 });
    }

    // Fetch visualizer
    const { data: visualizer, error: visualizerError } = await supabase
      .from('visualizers')
      .select('*')
      .eq('id', visualizerId)
      .single();

    if (visualizerError || !visualizer) {
      return NextResponse.json({ error: 'Visualizer not found' }, { status: 404 });
    }

    // Check subscription tier - must be Pro or Agency
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('tier, status')
      .eq('user_id', visualizer.user_id)
      .single();

    if (!subscription || !['pro', 'agency'].includes(subscription.tier)) {
      return NextResponse.json({
        error: 'Sending previews requires Pro or Agency plan'
      }, { status: 403 });
    }

    if (!['active', 'trialing'].includes(subscription.status)) {
      return NextResponse.json({ error: 'Service temporarily unavailable' }, { status: 403 });
    }

    // Generate preview ID if not exists
    let previewId = consultation.preview_id;
    if (!previewId) {
      previewId = `p_${nanoid(10)}`;
    }

    // Build preview URL
    const clientDomain = process.env.NEXT_PUBLIC_CLIENT_DOMAIN || 'renderlab.com';
    const previewUrl = `https://${clientDomain}/p/${previewId}`;

    // Update consultation with send info
    const quoteValue = include_quote && quote_amount ? parseFloat(quote_amount) : null;

    await supabase
      .from('consultations')
      .update({
        client_email: email,
        preview_id: previewId,
        quote_amount: quoteValue,
        personal_message: personal_message || 'Thanks for meeting today! Here\'s the preview we discussed. Let me know if you have any questions.',
        sent_at: new Date().toISOString(),
      })
      .eq('id', id);

    // Send email
    try {
      await sendPreviewEmail({
        to: email,
        businessName: visualizer.client_name,
        businessLogo: visualizer.logo_url,
        businessPhone: visualizer.business_phone,
        businessEmail: visualizer.business_email,
        businessWebsite: visualizer.business_website,
        businessTagline: visualizer.business_tagline,
        beforeImageUrl: consultation.original_image_url,
        afterImageUrl: consultation.transformed_image_url,
        styleLabel: consultation.style_label || 'Your Transformation',
        personalMessage: personal_message || 'Thanks for meeting today! Here\'s the preview we discussed. Let me know if you have any questions.',
        quoteAmount: quoteValue,
        previewUrl,
      });
    } catch (emailError) {
      console.error('[Send] Email error:', emailError);
      // Still return success - consultation is saved, email can be retried
      return NextResponse.json({
        preview_id: previewId,
        preview_url: previewUrl,
        email_sent: false,
        email_error: 'Failed to send email. Preview link was created.',
      });
    }

    return NextResponse.json({
      preview_id: previewId,
      preview_url: previewUrl,
      email_sent: true,
    });
  } catch (error) {
    console.error('[Send] Error:', error);
    return NextResponse.json({ error: 'Failed to send preview' }, { status: 500 });
  }
}
