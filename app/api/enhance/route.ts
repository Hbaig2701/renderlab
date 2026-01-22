import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  enhancementPrompts,
  type EnhancementCategory
} from '@/lib/gemini/enhance';
import { checkUsage, logOverage, checkAndSendUsageAlert } from '@/lib/usage/tracking';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // Check authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { image, category, option } = await request.json();

    if (!image) {
      return NextResponse.json(
        { error: 'No image provided' },
        { status: 400 }
      );
    }

    if (!category || !['food', 'product', 'staging'].includes(category)) {
      return NextResponse.json(
        { error: 'Invalid category' },
        { status: 400 }
      );
    }

    // Check subscription status
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('status, tier')
      .eq('user_id', user.id)
      .single();

    if (subscription && !['active', 'trialing'].includes(subscription.status)) {
      return NextResponse.json(
        { error: 'Your subscription is not active' },
        { status: 403 }
      );
    }

    // Check usage (soft cap - always allows, but tracks overages)
    const usageCheck = await checkUsage(supabase, user.id, 'enhancement');
    const isOverage = usageCheck.isOverage;

    // Get the appropriate prompt
    let prompt: string;
    const cat = category as EnhancementCategory;

    if (cat === 'food') {
      prompt = enhancementPrompts.food;
    } else if (cat === 'product') {
      if (!option || !['white_studio', 'lifestyle', 'dramatic'].includes(option)) {
        return NextResponse.json(
          { error: 'Invalid product option' },
          { status: 400 }
        );
      }
      prompt = enhancementPrompts.product[option];
    } else if (cat === 'staging') {
      if (!option || !['modern', 'luxury', 'scandinavian', 'rustic'].includes(option)) {
        return NextResponse.json(
          { error: 'Invalid staging option' },
          { status: 400 }
        );
      }
      prompt = enhancementPrompts.staging[option];
    } else {
      return NextResponse.json(
        { error: 'Invalid category' },
        { status: 400 }
      );
    }

    let enhancedImage = image; // Default to original

    // Try Gemini API if key is configured
    if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'placeholder_gemini_key') {
      try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

        // Use Gemini 2.0 Flash with image generation
        const model = genAI.getGenerativeModel({
          model: 'gemini-2.0-flash-exp',
          generationConfig: {
            responseModalities: ['image', 'text'],
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } as unknown as any,
        });

        // Extract base64 data from data URL
        const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
        const mimeType = image.match(/^data:(image\/\w+);base64,/)?.[1] || 'image/jpeg';

        console.log(`[Enhance] Category: ${category}, Option: ${option || 'none'}`);

        // Use different instructions for staging (editing) vs other categories (enhancement)
        const instruction = cat === 'staging'
          ? `${prompt}\n\nEdit this image to add the furniture while preserving the exact room structure.`
          : `${prompt}\n\nGenerate the enhanced image.`;

        const result = await model.generateContent([
          {
            inlineData: {
              mimeType,
              data: base64Data,
            },
          },
          instruction,
        ]);

        const response = result.response;

        // Check if we got an image back
        if (response.candidates && response.candidates[0]?.content?.parts) {
          for (const part of response.candidates[0].content.parts) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const partAny = part as any;
            if (partAny.inlineData) {
              const imageData = partAny.inlineData;
              enhancedImage = `data:${imageData.mimeType};base64,${imageData.data}`;
              console.log(`[Enhance] Image generated successfully`);
              break;
            }
          }
        }
      } catch (aiError) {
        console.error('[Enhance] Gemini API error:', aiError);
        return NextResponse.json(
          { error: 'Enhancement failed. Please try again.' },
          { status: 500 }
        );
      }
    } else {
      console.log('[Enhance] No Gemini API key configured');
      return NextResponse.json(
        { error: 'Enhancement service not configured' },
        { status: 500 }
      );
    }

    // Log usage
    await supabase.from('enhancement_usage').insert({
      user_id: user.id,
      enhancement_type: option ? `${category}_${option}` : category,
    });

    // Update usage counts
    const today = new Date();
    const periodStart = new Date(today.getFullYear(), today.getMonth(), 1)
      .toISOString()
      .split('T')[0];

    await supabase.rpc('increment_enhancement_count', {
      p_user_id: user.id,
      p_period_start: periodStart,
    });

    // Log overage if over limit
    if (isOverage) {
      await logOverage(supabase, user.id, 'enhancement', usageCheck.overageRate);
      console.log(`[Enhance] Overage logged for user ${user.id}, rate: $${usageCheck.overageRate}`);
    }

    // Check and send usage alerts
    if (user.email) {
      await checkAndSendUsageAlert(
        supabase,
        user.id,
        user.email,
        'enhancement',
        usageCheck.currentCount + 1,
        usageCheck.limit,
        usageCheck.overageRate
      );
    }

    return NextResponse.json({
      enhancedImage,
      category,
      option,
    });
  } catch (error) {
    console.error('[Enhance] Error:', error);
    return NextResponse.json(
      { error: 'Enhancement failed. Please try again.' },
      { status: 500 }
    );
  }
}
