'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Loader2, ExternalLink, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { TIER_LIMITS, type SubscriptionTier } from '@/types';

interface SubscriptionData {
  tier: SubscriptionTier;
  status: string;
  current_period_end: string | null;
  stripe_customer_id: string | null;
}

const TIER_FEATURES: Record<SubscriptionTier, {
  name: string;
  price: number;
  features: string[];
}> = {
  starter: {
    name: 'Starter',
    price: 49,
    features: [
      '200 enhancement transforms/mo',
      '50 consultations/mo',
      '3 active visualizers',
      'All visualizer templates',
      'Basic analytics',
      '"Powered by RenderLab" badge',
    ],
  },
  pro: {
    name: 'Pro',
    price: 99,
    features: [
      '500 enhancement transforms/mo',
      '200 consultations/mo',
      '10 active visualizers',
      'All visualizer templates',
      'Full analytics',
      'White label option',
      'Remove branding',
    ],
  },
  agency: {
    name: 'Agency',
    price: 199,
    features: [
      '1,500 enhancement transforms/mo',
      '750 consultations/mo',
      'Unlimited active visualizers',
      'All visualizer templates',
      'Full analytics + export',
      'White label',
      'No branding',
      '5 team seats',
      'Lower overage rate ($0.20)',
    ],
  },
};

function BillingPageContent() {
  const searchParams = useSearchParams();
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState<SubscriptionTier | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    fetchSubscription();

    // Handle success/cancel from Stripe
    if (searchParams.get('success')) {
      toast.success('Subscription updated successfully!');
    } else if (searchParams.get('canceled')) {
      toast.info('Checkout canceled');
    }
  }, [searchParams]);

  const fetchSubscription = async () => {
    try {
      const res = await fetch('/api/user/subscription');
      if (res.ok) {
        const data = await res.json();
        setSubscription(data);
      }
    } catch (error) {
      console.error('Failed to fetch subscription:', error);
    }
    setLoading(false);
  };

  const handleCheckout = async (tier: SubscriptionTier) => {
    setCheckoutLoading(tier);
    try {
      const res = await fetch('/api/billing/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || 'Failed to create checkout session');
        return;
      }

      const { url } = await res.json();
      if (url) {
        window.location.href = url;
      }
    } catch {
      toast.error('Failed to create checkout session');
    }
    setCheckoutLoading(null);
  };

  const handlePortal = async () => {
    setPortalLoading(true);
    try {
      const res = await fetch('/api/billing/create-portal', {
        method: 'POST',
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || 'Failed to open billing portal');
        return;
      }

      const { url } = await res.json();
      if (url) {
        window.location.href = url;
      }
    } catch {
      toast.error('Failed to open billing portal');
    }
    setPortalLoading(false);
  };

  const currentTier = subscription?.tier || 'starter';
  const isActive = subscription?.status === 'active' || subscription?.status === 'trialing';

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Billing</h1>
        <p className="text-muted-foreground mt-1">
          Manage your subscription and billing details
        </p>
      </div>

      {/* Current Plan Status */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Current Plan</CardTitle>
              <CardDescription>
                {isActive
                  ? `Your ${currentTier} plan is active`
                  : 'No active subscription'}
              </CardDescription>
            </div>
            <Badge
              variant={isActive ? 'default' : 'secondary'}
              className={isActive ? 'bg-success' : ''}
            >
              {subscription?.status || 'inactive'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold">
                {TIER_FEATURES[currentTier].name}
              </p>
              <p className="text-muted-foreground">
                ${TIER_FEATURES[currentTier].price}/month
              </p>
              {subscription?.current_period_end && (
                <p className="text-sm text-muted-foreground mt-2">
                  {subscription.status === 'canceled'
                    ? 'Access until: '
                    : 'Renews: '}
                  {new Date(subscription.current_period_end).toLocaleDateString()}
                </p>
              )}
            </div>
            {subscription?.stripe_customer_id && (
              <Button variant="outline" onClick={handlePortal} disabled={portalLoading}>
                {portalLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <ExternalLink className="h-4 w-4 mr-2" />
                )}
                Manage Billing
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Usage Limits */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Your Plan Limits</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 rounded-lg bg-secondary/50">
              <p className="text-sm text-muted-foreground">Enhancement Transforms</p>
              <p className="text-2xl font-bold">
                {TIER_LIMITS[currentTier].enhancement_limit}
                <span className="text-sm font-normal text-muted-foreground">/mo</span>
              </p>
            </div>
            <div className="p-4 rounded-lg bg-secondary/50">
              <p className="text-sm text-muted-foreground">Consultations</p>
              <p className="text-2xl font-bold">
                {TIER_LIMITS[currentTier].consultation_limit}
                <span className="text-sm font-normal text-muted-foreground">/mo</span>
              </p>
            </div>
            <div className="p-4 rounded-lg bg-secondary/50">
              <p className="text-sm text-muted-foreground">Active Visualizers</p>
              <p className="text-2xl font-bold">
                {TIER_LIMITS[currentTier].active_visualizers === Infinity
                  ? 'Unlimited'
                  : TIER_LIMITS[currentTier].active_visualizers}
              </p>
            </div>
          </div>
          <div className="mt-4 p-3 rounded-lg bg-primary/10 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="text-sm font-medium">Soft Caps</p>
              <p className="text-sm text-muted-foreground">
                Visualizers never break! If you exceed your limits, you&apos;ll be charged{' '}
                ${TIER_LIMITS[currentTier].overage_rate} per additional transform.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pricing Plans */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Available Plans</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {(Object.entries(TIER_FEATURES) as [SubscriptionTier, typeof TIER_FEATURES.starter][]).map(
            ([tier, plan]) => (
              <Card
                key={tier}
                className={`bg-card border-border ${
                  tier === currentTier ? 'border-primary' : ''
                }`}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{plan.name}</CardTitle>
                    {tier === currentTier && (
                      <Badge variant="outline" className="border-primary text-primary">
                        Current
                      </Badge>
                    )}
                  </div>
                  <div className="mt-2">
                    <span className="text-3xl font-bold">${plan.price}</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-6">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-success mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  {tier === currentTier ? (
                    <Button variant="outline" disabled className="w-full">
                      Current Plan
                    </Button>
                  ) : (
                    <Button
                      className="w-full"
                      onClick={() => handleCheckout(tier)}
                      disabled={checkoutLoading !== null}
                    >
                      {checkoutLoading === tier ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : null}
                      {tier === 'starter' && currentTier !== 'starter'
                        ? 'Downgrade'
                        : 'Upgrade'}
                    </Button>
                  )}
                </CardContent>
              </Card>
            )
          )}
        </div>
      </div>
    </div>
  );
}

export default function BillingPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <BillingPageContent />
    </Suspense>
  );
}
