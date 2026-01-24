import { SupabaseClient } from '@supabase/supabase-js';
import { TIER_LIMITS, type SubscriptionTier } from '@/types';
import { sendEmail } from '@/lib/email/client';
import { usageAlert80Template, usageAlert100Template } from '@/lib/email/templates';

interface UsageCheckResult {
  allowed: boolean;
  isOverage: boolean;
  currentCount: number;
  limit: number;
  overageRate: number;
}

/**
 * Check usage and determine if it's an overage (soft cap - always allow)
 */
export async function checkUsage(
  supabase: SupabaseClient,
  userId: string,
  type: 'enhancement' | 'consultation'
): Promise<UsageCheckResult> {
  // Get subscription tier
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('tier, status')
    .eq('user_id', userId)
    .single();

  const tier = (subscription?.tier || 'starter') as SubscriptionTier;
  const limits = TIER_LIMITS[tier];

  // Get current usage
  const today = new Date();
  const periodStart = new Date(today.getFullYear(), today.getMonth(), 1)
    .toISOString()
    .split('T')[0];

  const { data: usage } = await supabase
    .from('usage')
    .select('enhancement_count, consultation_count')
    .eq('user_id', userId)
    .eq('period_start', periodStart)
    .single();

  const currentCount = type === 'enhancement'
    ? (usage?.enhancement_count || 0)
    : (usage?.consultation_count || 0);

  const limit = type === 'enhancement'
    ? limits.enhancement_limit
    : limits.consultation_limit;

  const isOverage = currentCount >= limit;

  return {
    allowed: true, // Soft caps - always allow
    isOverage,
    currentCount,
    limit,
    overageRate: limits.overage_rate,
  };
}

/**
 * Log an overage event for billing
 */
export async function logOverage(
  supabase: SupabaseClient,
  userId: string,
  type: 'enhancement' | 'consultation',
  rate: number
): Promise<void> {
  await supabase.from('overages').insert({
    user_id: userId,
    type,
    rate,
  });
}

/**
 * Check if user should receive a usage alert (80% or 100%)
 */
export async function checkUsageAlert(
  supabase: SupabaseClient,
  userId: string,
  type: 'enhancement' | 'consultation',
  currentCount: number,
  limit: number
): Promise<'80' | '100' | null> {
  const percentage = (currentCount / limit) * 100;

  // Check if we've already sent an alert for this threshold
  const today = new Date();
  const periodStart = new Date(today.getFullYear(), today.getMonth(), 1)
    .toISOString()
    .split('T')[0];

  const { data: existingAlerts } = await supabase
    .from('usage_alerts')
    .select('threshold')
    .eq('user_id', userId)
    .eq('type', type)
    .eq('period_start', periodStart);

  const sentThresholds = existingAlerts?.map(a => a.threshold) || [];

  if (percentage >= 100 && !sentThresholds.includes(100)) {
    return '100';
  } else if (percentage >= 80 && percentage < 100 && !sentThresholds.includes(80)) {
    return '80';
  }

  return null;
}

/**
 * Record that a usage alert was sent
 */
export async function recordUsageAlert(
  supabase: SupabaseClient,
  userId: string,
  type: 'enhancement' | 'consultation',
  threshold: number
): Promise<void> {
  const today = new Date();
  const periodStart = new Date(today.getFullYear(), today.getMonth(), 1)
    .toISOString()
    .split('T')[0];

  await supabase.from('usage_alerts').insert({
    user_id: userId,
    type,
    threshold,
    period_start: periodStart,
  });
}

/**
 * Check usage and send alert email if threshold is reached
 */
export async function checkAndSendUsageAlert(
  supabase: SupabaseClient,
  userId: string,
  userEmail: string,
  type: 'enhancement' | 'consultation',
  currentCount: number,
  limit: number,
  overageRate: number
): Promise<void> {
  const alertThreshold = await checkUsageAlert(supabase, userId, type, currentCount, limit);

  if (!alertThreshold) {
    return;
  }

  try {
    // Send the appropriate email
    const typeLabel = type === 'enhancement' ? 'Enhancement' : 'Consultation';
    let emailSent = false;

    if (alertThreshold === '80') {
      emailSent = await sendEmail({
        to: userEmail,
        subject: `RenderLab: ${typeLabel} Usage at 80%`,
        html: usageAlert80Template(type, currentCount, limit),
      });
    } else if (alertThreshold === '100') {
      emailSent = await sendEmail({
        to: userEmail,
        subject: `RenderLab: ${typeLabel} Limit Reached`,
        html: usageAlert100Template(type, currentCount, limit, overageRate),
      });
    }

    // Record that the alert was sent (even if email failed, to prevent spam)
    await recordUsageAlert(supabase, userId, type, parseInt(alertThreshold));

    if (emailSent) {
      console.log(`[Usage] Alert sent to ${userEmail}: ${type} at ${alertThreshold}%`);
    }
  } catch (error) {
    console.error('[Usage] Failed to send alert:', error);
  }
}
