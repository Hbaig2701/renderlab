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
  params: Promise<{ id: string }>;
}

// Map of template to prompts
const PROMPT_MAP: Record<string, Record<string, string>> = {
  smile: smilePrompts,
  hair: hairPrompts,
  kitchen_remodel: kitchenPrompts,
  landscaping: landscapingPrompts,
};

// Default options for each template
const DEFAULT_OPTIONS: Record<string, string> = {
  smile: 'full_makeover',
  hair: 'balayage',
  kitchen_remodel: 'modern',
  landscaping: 'manicured',
};

export async function POST(request: Request, { params }: RouteParams) {
  const { id } = await params;

  try {
    const { image, option } = await request.json();

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
      .select('*')
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

    // Check usage (soft cap - always allows, but tracks overages)
    const usageCheck = await checkUsage(supabase, widget.user_id, 'widget');
    const isOverage = usageCheck.isOverage;

    // Get available options for this template
    const templateOptions = TEMPLATE_OPTIONS[widget.template as keyof typeof TEMPLATE_OPTIONS];
    const allOptionKeys = templateOptions.map(o => o.key);

    // Determine which options are enabled (null means all)
    const enabledOptions = widget.enabled_options || allOptionKeys;

    // Validate the selected option
    const selectedOption = option || DEFAULT_OPTIONS[widget.template];

    if (!enabledOptions.includes(selectedOption)) {
      return NextResponse.json(
        { error: 'Selected option is not available for this widget' },
        { status: 400 }
      );
    }

    // Get the appropriate prompt
    const prompts = PROMPT_MAP[widget.template];
    if (!prompts || !prompts[selectedOption]) {
      return NextResponse.json(
        { error: 'Invalid transformation option' },
        { status: 400 }
      );
    }

    const prompt = prompts[selectedOption];
    let transformedImage = image; // Default to original
    let imageGenerated = false;

    // Try Gemini API if key is configured
    if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'placeholder_gemini_key') {
      try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

        // Use Gemini 2.0 Flash with image generation
        const model = genAI.getGenerativeModel({
          model: 'gemini-2.0-flash-exp',
          generationConfig: {
            responseModalities: ['image', 'text'],
          } as any,
        });

        // Extract base64 data from data URL
        const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
        const mimeType = image.match(/^data:(image\/\w+);base64,/)?.[1] || 'image/jpeg';

        console.log(`[Transform] Template: ${widget.template}, Option: ${selectedOption}`);
        console.log(`[Transform] Prompt length: ${prompt.length} chars`);

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

        // Log response structure for debugging
        console.log(`[Transform] Response candidates: ${response.candidates?.length || 0}`);
        if (response.candidates?.[0]?.content?.parts) {
          console.log(`[Transform] Parts: ${response.candidates[0].content.parts.length}`);
          response.candidates[0].content.parts.forEach((part: any, i: number) => {
            console.log(`[Transform] Part ${i}: ${part.text ? 'text' : part.inlineData ? 'image' : 'unknown'}`);
          });
        }

        // Check if we got an image back
        if (response.candidates && response.candidates[0]?.content?.parts) {
          for (const part of response.candidates[0].content.parts) {
            if ((part as any).inlineData) {
              const imageData = (part as any).inlineData;
              transformedImage = `data:${imageData.mimeType};base64,${imageData.data}`;
              imageGenerated = true;
              console.log(`[Transform] Image generated successfully`);
              break;
            }
          }
        }

        if (!imageGenerated) {
          console.log(`[Transform] No image in response, returning original`);
        }
      } catch (aiError) {
        console.error('[Transform] Gemini API error:', aiError);
        // Fall back to original image if AI fails
      }
    } else {
      console.log('[Transform] No Gemini API key configured');
    }

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

    // Log overage if over limit
    if (isOverage) {
      await logOverage(supabase, widget.user_id, 'widget', usageCheck.overageRate);
      console.log(`[Transform] Overage logged for user ${widget.user_id}, rate: $${usageCheck.overageRate}`);
    }

    // Check and send usage alerts (get user email first)
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
      transformedImage,
    });
  } catch (error) {
    console.error('Transform error:', error);
    return NextResponse.json(
      { error: 'Transformation failed. Please try again.' },
      { status: 500 }
    );
  }
}
