import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { UsageCard } from '@/components/dashboard/usage-card';
import { UsageChart } from '@/components/dashboard/usage-chart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Layers, Plus, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { TIER_LIMITS, type SubscriptionTier, type Visualizer } from '@/types';

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  // Fetch subscription
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .single();

  // Fetch current usage
  const { data: usage } = await supabase
    .from('usage')
    .select('*')
    .eq('user_id', user.id)
    .order('period_start', { ascending: false })
    .limit(1)
    .single();

  // Fetch visualizers count
  const { count: visualizerCount } = await supabase
    .from('visualizers')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('status', 'active');

  // Fetch recent visualizers
  const { data: recentVisualizers } = await supabase
    .from('visualizers')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5);

  const tier = (subscription?.tier || 'starter') as SubscriptionTier;
  const limits = TIER_LIMITS[tier];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back! Here&apos;s an overview of your account.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-primary border-primary">
            {tier.charAt(0).toUpperCase() + tier.slice(1)} Plan
          </Badge>
          <Button asChild>
            <Link href="/visualizers/new">
              <Plus className="mr-2 h-4 w-4" />
              New Visualizer
            </Link>
          </Button>
        </div>
      </div>

      {/* Usage Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <UsageCard
          title="Enhancement Transforms"
          used={usage?.enhancement_count || 0}
          limit={limits.enhancement_limit}
          icon={<Sparkles className="h-4 w-4 text-muted-foreground" />}
        />
        <UsageCard
          title="Consultations"
          used={usage?.consultation_count || 0}
          limit={limits.consultation_limit}
          icon={<Layers className="h-4 w-4 text-muted-foreground" />}
        />
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Visualizers
            </CardTitle>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {visualizerCount || 0}{' '}
              <span className="text-sm font-normal text-muted-foreground">
                / {limits.active_visualizers === Infinity ? '∞' : limits.active_visualizers}
              </span>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Visualizers deployed to clients
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Usage Chart */}
      <UsageChart />

      {/* Recent Visualizers */}
      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Visualizers</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/visualizers">
              View all
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {recentVisualizers && recentVisualizers.length > 0 ? (
            <div className="space-y-3">
              {recentVisualizers.map((visualizer: Visualizer) => (
                <Link
                  key={visualizer.id}
                  href={`/visualizers/${visualizer.id}`}
                  className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: visualizer.brand_color }}
                    />
                    <div>
                      <p className="font-medium">{visualizer.client_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {visualizer.template.replace('_', ' ')}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant={visualizer.status === 'active' ? 'default' : 'secondary'}
                    className={visualizer.status === 'active' ? 'bg-success' : ''}
                  >
                    {visualizer.status}
                  </Badge>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Layers className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No visualizers yet</p>
              <Button asChild className="mt-4">
                <Link href="/visualizers/new">Create your first visualizer</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-card border-border hover:border-primary/50 transition-colors">
          <Link href="/enhance" className="block p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Enhancement Tools</h3>
                <p className="text-sm text-muted-foreground">
                  Enhance photos for restaurants, products, and headshots
                </p>
              </div>
            </div>
          </Link>
        </Card>
        <Card className="bg-card border-border hover:border-primary/50 transition-colors">
          <Link href="/calculator" className="block p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <Layers className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Pricing Calculator</h3>
                <p className="text-sm text-muted-foreground">
                  Calculate recommended pricing for your clients
                </p>
              </div>
            </div>
          </Link>
        </Card>
      </div>
    </div>
  );
}
