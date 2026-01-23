import { createAdminClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { smilePrompts } from '@/lib/gemini/widgets/smile';
import { hairPrompts } from '@/lib/gemini/widgets/hair';
import { kitchenPrompts } from '@/lib/gemini/widgets/kitchen';
import { landscapingPrompts } from '@/lib/gemini/widgets/landscaping';
import { TEMPLATE_OPTIONS } from '@/types';
import { checkUsage, logOverage, checkAndSendUsageAlert } from '@/lib/usage/tracking';

interface RouteParams {
  params: Promise<{ widgetId: string; id: string }>;
}

// Map of template to prompts
const PROMPT_MAP: Record<string, Record<string, string>> = {
  smile: smilePrompts,
  hair: hairPrompts,
  kitchen_remodel: kitchenPrompts,
  landscaping: landscapingPrompts,
};

// POST /api/s/{widgetId}/consultations/{id}/transform - Run transformation
export async function POST(request: Request, { params }: RouteParams) {
  const { widgetId, id } = await params;

  try {
    const { style_key } = await request.json();

    if (!style_key) {
      return NextResponse.json({ error: 'No style selected' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Fetch consultation
    const { data: consultation, error: consultationError } = await supabase
      .from('consultations')
      .select('*')
      .eq('id', id)
      .eq('widget_id', widgetId)
      .single();

    if (consultationError || !consultation) {
      return NextResponse.json({ error: 'Consultation not found' }, { status: 404 });
    }

    // Fetch widget
    const { data: widget, error: widgetError } = await supabase
      .from('widgets')
      .select('*')
      .eq('id', widgetId)
      .single();

    if (widgetError || !widget) {
      return NextResponse.json({ error: 'Widget not found' }, { status: 404 });
    }

    // Check subscription status
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', widget.user_id)
      .single();

    if (subscription && !['active', 'trialing'].includes(subscription.status)) {
      return NextResponse.json({ error: 'Service temporarily unavailable' }, { status: 403 });
    }

    // Check usage
    const usageCheck = await checkUsage(supabase, widget.user_id, 'widget');
    const isOverage = usageCheck.isOverage;

    // Validate the selected option
    const templateOptions = TEMPLATE_OPTIONS[widget.template as keyof typeof TEMPLATE_OPTIONS];
    const enabledOptions = widget.enabled_options || templateOptions.map(o => o.key);

    if (!enabledOptions.includes(style_key)) {
      return NextResponse.json({ error: 'Selected style is not available' }, { status: 400 });
    }

    // Get the style label
    const styleOption = templateOptions.find(o => o.key === style_key);
    const styleLabel = styleOption?.label || style_key;

    // Get the prompt
    const prompts = PROMPT_MAP[widget.template];
    if (!prompts || !prompts[style_key]) {
      return NextResponse.json({ error: 'Invalid transformation style' }, { status: 400 });
    }

    const prompt = prompts[style_key];

    // Fetch original image from storage
    const originalImageUrl = consultation.original_image_url;
    let transformedImageUrl = originalImageUrl; // Default fallback
    let imageGenerated = false;

    // Try Gemini API
    if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'placeholder_gemini_key') {
      try {
        // Fetch the original image
        const imageResponse = await fetch(originalImageUrl);
        const imageBuffer = await imageResponse.arrayBuffer();
        const base64Data = Buffer.from(imageBuffer).toString('base64');
        const mimeType = imageResponse.headers.get('content-type') || 'image/jpeg';

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({
          model: 'gemini-2.0-flash-exp',
          generationConfig: {
            responseModalities: ['image', 'text'],
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } as any,
        });

        console.log(`[SalesTool Transform] Template: ${widget.template}, Style: ${style_key}`);

        const result = await model.generateContent([
          {
            inlineData: {
              mimeType,
              data: base64Data,
            },
          },
          `${prompt}\n\nGenerate the transformed image.`,
        ]);

        const response = result.response;

        // Check for generated image
        if (response.candidates && response.candidates[0]?.content?.parts) {
          for (const part of response.candidates[0].content.parts) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const partAny = part as any;
            if (partAny.inlineData) {
              const imageData = partAny.inlineData;

              // Upload transformed image to storage
              const transformedBuffer = Buffer.from(imageData.data, 'base64');
              const extension = imageData.mimeType.split('/')[1] || 'jpg';
              const storagePath = `${widgetId}/${id}/transformed.${extension}`;

              const { error: uploadError } = await supabase.storage
                .from('consultation-images')
                .upload(storagePath, transformedBuffer, {
                  contentType: imageData.mimeType,
                  upsert: true,
                });

              if (!uploadError) {
                const { data: urlData } = supabase.storage
                  .from('consultation-images')
                  .getPublicUrl(storagePath);

                transformedImageUrl = urlData.publicUrl;
                imageGenerated = true;
                console.log(`[SalesTool Transform] Image generated successfully`);
              }
              break;
            }
          }
        }

        if (!imageGenerated) {
          console.log(`[SalesTool Transform] No image in response`);
        }
      } catch (aiError) {
        console.error('[SalesTool Transform] Gemini API error:', aiError);
      }
    } else {
      console.log('[SalesTool Transform] No Gemini API key configured');
    }

    // Update consultation with transformation
    await supabase
      .from('consultations')
      .update({
        transformed_image_url: transformedImageUrl,
        style_key: style_key,
        style_label: styleLabel,
      })
      .eq('id', id);

    // Log usage
    await supabase.from('widget_usage').insert({
      widget_id: widgetId,
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

    // Log overage if over limit
    if (isOverage) {
      await logOverage(supabase, widget.user_id, 'widget', usageCheck.overageRate);
    }

    // Check and send usage alerts
    const { data: userData } = await supabase.auth.admin.getUserById(widget.user_id);
    if (userData?.user?.email) {
      await checkAndSendUsageAlert(
        supabase,
        widget.user_id,
        userData.user.email,
        'widget',
        usageCheck.currentCount + 1,
        usageCheck.limit,
        usageCheck.overageRate
      );
    }

    return NextResponse.json({
      transformed_image_url: transformedImageUrl,
      style_key,
      style_label: styleLabel,
    });
  } catch (error) {
    console.error('[SalesTool Transform] Error:', error);
    return NextResponse.json({ error: 'Transformation failed' }, { status: 500 });
  }
}
