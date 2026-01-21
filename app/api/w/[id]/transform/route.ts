import { createAdminClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { proModel } from '@/lib/gemini/client';
import { smileTransformPrompt } from '@/lib/gemini/widgets/smile';
import { roomStagingPrompt } from '@/lib/gemini/widgets/room-staging';
import { kitchenRemodelPrompt } from '@/lib/gemini/widgets/kitchen';
import { landscapingPrompt } from '@/lib/gemini/widgets/landscaping';

interface RouteParams {
  params: Promise<{ id: string }>;
}

const PROMPTS: Record<string, string> = {
  smile: smileTransformPrompt,
  room_staging: roomStagingPrompt('modern'),
  kitchen_remodel: kitchenRemodelPrompt('shaker white'),
  landscaping: landscapingPrompt,
};

export async function POST(request: Request, { params }: RouteParams) {
  const { id } = await params;

  try {
    const { image } = await request.json();

    if (!image) {
      return NextResponse.json(
        { error: 'No image provided' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Fetch widget and verify it's active
    const { data: widget, error: widgetError } = await supabase
      .from('widgets')
      .select('*, user_id')
      .eq('id', id)
      .single();

    if (widgetError || !widget) {
      return NextResponse.json(
        { error: 'Widget not found' },
        { status: 404 }
      );
    }

    if (widget.status !== 'active') {
      return NextResponse.json(
        { error: 'Widget is inactive' },
        { status: 403 }
      );
    }

    // Check subscription status
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', widget.user_id)
      .single();

    if (subscription && !['active', 'trialing'].includes(subscription.status)) {
      return NextResponse.json(
        { error: 'Service temporarily unavailable' },
        { status: 403 }
      );
    }

    // Get the appropriate prompt for this template
    const prompt = PROMPTS[widget.template];
    if (!prompt) {
      return NextResponse.json(
        { error: 'Invalid widget template' },
        { status: 400 }
      );
    }

    // Extract base64 data from data URL
    const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
    const mimeType = image.match(/^data:(image\/\w+);base64,/)?.[1] || 'image/jpeg';

    // Call Gemini API for transformation
    const result = await proModel.generateContent([
      {
        inlineData: {
          mimeType,
          data: base64Data,
        },
      },
      prompt,
    ]);

    const response = result.response;
    const text = response.text();

    // For now, since Gemini text models don't generate images directly,
    // we'll return a placeholder message. In production, you'd use
    // an image generation model like Imagen or a different approach.
    //
    // Note: The actual Gemini image generation API (gemini-2.5-flash-image-preview)
    // would be used here when available in the SDK.

    // Log usage
    await supabase.from('widget_usage').insert({
      widget_id: id,
      user_id: widget.user_id,
    });

    // Update usage counts
    const today = new Date();
    const periodStart = new Date(today.getFullYear(), today.getMonth(), 1)
      .toISOString()
      .split('T')[0];

    await supabase.rpc('increment_widget_transform_count', {
      p_user_id: widget.user_id,
      p_period_start: periodStart,
    });

    // For demo purposes, return the original image
    // In production, this would return the AI-transformed image
    return NextResponse.json({
      transformedImage: image,
      message: 'Transformation processed. Connect Gemini Image API for actual transformations.',
    });
  } catch (error) {
    console.error('Transform error:', error);
    return NextResponse.json(
      { error: 'Transformation failed. Please try again.' },
      { status: 500 }
    );
  }
}
