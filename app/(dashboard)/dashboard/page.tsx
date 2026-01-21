import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { UsageCard } from '@/components/dashboard/usage-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Layers, Plus, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { TIER_LIMITS, type SubscriptionTier } from '@/types';

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

  // Fetch widgets count
  const { count: widgetCount } = await supabase
    .from('widgets')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('status', 'active');

  // Fetch recent widgets
  const { data: recentWidgets } = await supabase
    .from('widgets')
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
            <Link href="/widgets/new">
              <Plus className="mr-2 h-4 w-4" />
              New Widget
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
          title="Widget Transforms"
          used={usage?.widget_transform_count || 0}
          limit={limits.widget_transform_limit}
          icon={<Layers className="h-4 w-4 text-muted-foreground" />}
        />
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Widgets
            </CardTitle>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {widgetCount || 0}{' '}
              <span className="text-sm font-normal text-muted-foreground">
                / {limits.active_widgets === Infinity ? '∞' : limits.active_widgets}
              </span>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Widgets deployed to clients
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Widgets */}
      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Widgets</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/widgets">
              View all
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {recentWidgets && recentWidgets.length > 0 ? (
            <div className="space-y-3">
              {recentWidgets.map((widget) => (
                <Link
                  key={widget.id}
                  href={`/widgets/${widget.id}`}
                  className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: widget.brand_color }}
                    />
                    <div>
                      <p className="font-medium">{widget.client_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {widget.template.replace('_', ' ')}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant={widget.status === 'active' ? 'default' : 'secondary'}
                    className={widget.status === 'active' ? 'bg-success' : ''}
                  >
                    {widget.status}
                  </Badge>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Layers className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No widgets yet</p>
              <Button asChild className="mt-4">
                <Link href="/widgets/new">Create your first widget</Link>
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
