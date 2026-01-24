import { createClient, createAdminClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { TIER_LIMITS, type SubscriptionTier } from '@/types';

// ADMIN ONLY - Remove or protect before production
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tier = searchParams.get('tier') as SubscriptionTier;

  if (!tier || !['starter', 'pro', 'agency'].includes(tier)) {
    return NextResponse.json({
      error: 'Invalid tier. Use ?tier=starter, ?tier=pro, or ?tier=agency'
    }, { status: 400 });
  }

  // Use regular client to get current user
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Not logged in' }, { status: 401 });
  }

  const limits = TIER_LIMITS[tier];

  // Use admin client to bypass RLS
  const adminClient = createAdminClient();

  // Update subscription
  const { error: subError } = await adminClient
    .from('subscriptions')
    .upsert({
      user_id: user.id,
      tier,
      status: 'active',
    }, { onConflict: 'user_id' });

  if (subError) {
    return NextResponse.json({ error: subError.message }, { status: 500 });
  }

  // Update usage limits
  const today = new Date().toISOString().split('T')[0];
  const { error: usageError } = await adminClient
    .from('usage')
    .upsert({
      user_id: user.id,
      period_start: today,
      enhancement_limit: limits.enhancement_limit,
      consultation_limit: limits.consultation_limit,
    }, { onConflict: 'user_id,period_start' });

  if (usageError) {
    return NextResponse.json({ error: usageError.message }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    tier,
    limits: {
      enhancements: limits.enhancement_limit,
      active_visualizers: limits.active_visualizers,
      consultations: limits.consultation_limit,
    }
  });
}
