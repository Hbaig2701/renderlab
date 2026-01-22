import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe, getTierFromPriceId, isStripeConfigured } from '@/lib/stripe/client';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import Stripe from 'stripe';
import { TIER_LIMITS } from '@/types';

// Create Supabase client lazily (not at module load time)
function getSupabaseAdmin() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return null;
  }
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

export async function POST(request: Request) {
  // Check if Stripe is configured
  if (!isStripeConfigured || !stripe) {
    return NextResponse.json(
      { error: 'Billing is not configured yet' },
      { status: 503 }
    );
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json(
      { error: 'Database not configured' },
      { status: 503 }
    );
  }

  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('[Webhook] Signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutComplete(supabase, session);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdate(supabase, subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(supabase, subscription);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(supabase, invoice);
        break;
      }

      default:
        console.log(`[Webhook] Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[Webhook] Error handling event:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleCheckoutComplete(supabase: SupabaseClient<any, any, any>, session: Stripe.Checkout.Session) {
  const userId = session.metadata?.user_id;
  const tier = session.metadata?.tier as 'starter' | 'pro' | 'agency';

  if (!userId || !tier) {
    console.error('[Webhook] Missing metadata in checkout session');
    return;
  }

  const subscriptionId = session.subscription as string;

  // Get subscription details from Stripe
  const stripeSubscription = await stripe!.subscriptions.retrieve(subscriptionId);

  // In newer Stripe API, period dates are on subscription items
  const firstItem = stripeSubscription.items.data[0];
  const periodStartTimestamp = firstItem.current_period_start;
  const periodEndTimestamp = firstItem.current_period_end;

  // Update subscription in database
  await supabase.from('subscriptions').upsert({
    user_id: userId,
    stripe_customer_id: session.customer as string,
    stripe_subscription_id: subscriptionId,
    tier,
    status: 'active',
    current_period_start: new Date(periodStartTimestamp * 1000).toISOString(),
    current_period_end: new Date(periodEndTimestamp * 1000).toISOString(),
  }, {
    onConflict: 'user_id',
  });

  // Create or update usage record for the new period
  const limits = TIER_LIMITS[tier];
  const periodStart = new Date(periodStartTimestamp * 1000);
  const periodEnd = new Date(periodEndTimestamp * 1000);

  await supabase.from('usage').upsert({
    user_id: userId,
    period_start: periodStart.toISOString().split('T')[0],
    period_end: periodEnd.toISOString().split('T')[0],
    enhancement_count: 0,
    widget_transform_count: 0,
    enhancement_limit: limits.enhancement_limit,
    widget_transform_limit: limits.widget_transform_limit,
  }, {
    onConflict: 'user_id,period_start',
  });

  console.log(`[Webhook] Checkout complete for user ${userId}, tier: ${tier}`);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleSubscriptionUpdate(supabase: SupabaseClient<any, any, any>, subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  // Find user by customer ID
  const { data: sub } = await supabase
    .from('subscriptions')
    .select('user_id')
    .eq('stripe_customer_id', customerId)
    .single();

  if (!sub) {
    console.error('[Webhook] No subscription found for customer:', customerId);
    return;
  }

  // Determine tier from price
  const priceId = subscription.items.data[0]?.price.id;
  const tier = getTierFromPriceId(priceId || '') || 'starter';

  // Map Stripe status to our status
  let status: 'active' | 'canceled' | 'past_due' | 'trialing' = 'active';
  if (subscription.status === 'canceled') status = 'canceled';
  else if (subscription.status === 'past_due') status = 'past_due';
  else if (subscription.status === 'trialing') status = 'trialing';

  // In newer Stripe API, period dates are on subscription items
  const firstItem = subscription.items.data[0];
  const periodStartTimestamp = firstItem.current_period_start;
  const periodEndTimestamp = firstItem.current_period_end;

  await supabase.from('subscriptions').update({
    tier,
    status,
    current_period_start: new Date(periodStartTimestamp * 1000).toISOString(),
    current_period_end: new Date(periodEndTimestamp * 1000).toISOString(),
  }).eq('user_id', sub.user_id);

  // Update usage limits for the period
  const limits = TIER_LIMITS[tier];
  const periodStart = new Date(periodStartTimestamp * 1000);

  await supabase.from('usage').update({
    enhancement_limit: limits.enhancement_limit,
    widget_transform_limit: limits.widget_transform_limit,
  }).eq('user_id', sub.user_id).eq('period_start', periodStart.toISOString().split('T')[0]);

  console.log(`[Webhook] Subscription updated for user ${sub.user_id}, tier: ${tier}, status: ${status}`);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleSubscriptionDeleted(supabase: SupabaseClient<any, any, any>, subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  // Find user by customer ID
  const { data: sub } = await supabase
    .from('subscriptions')
    .select('user_id')
    .eq('stripe_customer_id', customerId)
    .single();

  if (!sub) {
    console.error('[Webhook] No subscription found for customer:', customerId);
    return;
  }

  await supabase.from('subscriptions').update({
    status: 'canceled',
    stripe_subscription_id: null,
  }).eq('user_id', sub.user_id);

  console.log(`[Webhook] Subscription canceled for user ${sub.user_id}`);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handlePaymentFailed(supabase: SupabaseClient<any, any, any>, invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;

  // Find user by customer ID
  const { data: sub } = await supabase
    .from('subscriptions')
    .select('user_id')
    .eq('stripe_customer_id', customerId)
    .single();

  if (!sub) {
    console.error('[Webhook] No subscription found for customer:', customerId);
    return;
  }

  await supabase.from('subscriptions').update({
    status: 'past_due',
  }).eq('user_id', sub.user_id);

  console.log(`[Webhook] Payment failed for user ${sub.user_id}`);
}
