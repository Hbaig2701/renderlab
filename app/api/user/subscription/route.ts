import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!subscription) {
      // Return default starter plan if no subscription exists
      return NextResponse.json({
        tier: 'starter',
        status: 'trialing',
        current_period_end: null,
        stripe_customer_id: null,
      });
    }

    return NextResponse.json(subscription);
  } catch (error) {
    console.error('[User] Subscription fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscription' },
      { status: 500 }
    );
  }
}
