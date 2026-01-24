import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Play, Image } from 'lucide-react';
import Link from 'next/link';
import { VISUALIZER_TEMPLATES, TEMPLATE_OPTIONS, TIER_LIMITS, type SubscriptionTier } from '@/types';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function DemoPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  const { data: visualizer } = await supabase
    .from('visualizers')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (!visualizer) {
    notFound();
  }

  // Get subscription for demo credits
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('tier')
    .eq('user_id', user.id)
    .single();

  const tier = (subscription?.tier || 'starter') as SubscriptionTier;
  const demoCreditsLimit = TIER_LIMITS[tier].demo_credits;

  // Get current month demo usage
  const now = new Date();
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];

  const { data: demoUsage } = await supabase
    .from('demo_usage')
    .select('credits_used')
    .eq('user_id', user.id)
    .eq('period_start', periodStart)
    .single();

  const creditsUsed = demoUsage?.credits_used || 0;
  const creditsRemaining = Math.max(0, demoCreditsLimit - creditsUsed);

  const template = VISUALIZER_TEMPLATES[visualizer.template as keyof typeof VISUALIZER_TEMPLATES];
  const templateOptions = TEMPLATE_OPTIONS[visualizer.template as keyof typeof TEMPLATE_OPTIONS] || [];

  // Filter to enabled options
  const enabledOptions = visualizer.enabled_options
    ? templateOptions.filter(o => visualizer.enabled_options.includes(o.key))
    : templateOptions;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/visualizers">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Demo Mode</h1>
          <p className="text-muted-foreground">
            {template.icon} {visualizer.client_name} - {template.name}
          </p>
        </div>
      </div>

      {/* Demo Credits */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Demo Credits</CardTitle>
              <CardDescription>
                Use demo credits to run live transformations for prospects
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-lg px-3 py-1">
              {creditsRemaining} / {demoCreditsLimit} remaining
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Sample Gallery */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Sample Transformations</CardTitle>
          <CardDescription>
            Pre-generated examples to show prospects (no credits required)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {enabledOptions.slice(0, 3).map((option) => (
              <div
                key={option.key}
                className="border border-border rounded-lg p-4 space-y-3"
              >
                <div className="aspect-square bg-secondary/50 rounded-lg flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <Image className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-xs">Sample images</p>
                    <p className="text-xs">coming soon</p>
                  </div>
                </div>
                <div className="text-center">
                  <p className="font-medium">{option.label}</p>
                  <p className="text-xs text-muted-foreground">{option.description}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-sm text-muted-foreground mt-4 text-center">
            Sample before/after images will be added here for demonstration purposes
          </p>
        </CardContent>
      </Card>

      {/* Live Demo */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Live Demo</CardTitle>
          <CardDescription>
            Run a real transformation to wow your prospect (uses demo credits)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {creditsRemaining > 0 ? (
            <>
              <p className="text-sm text-muted-foreground">
                Demo credits remaining: <strong>{creditsRemaining}</strong> of {demoCreditsLimit} this month
              </p>
              <Button disabled>
                <Play className="mr-2 h-4 w-4" />
                Try Live Demo (Coming Soon)
              </Button>
            </>
          ) : (
            <div className="p-4 bg-secondary/50 rounded-lg">
              <p className="text-sm text-muted-foreground">
                No demo credits remaining this month. Resets on the 1st.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                You can still use the regular consultation tool which counts against your consultation quota.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Links */}
      <div className="flex gap-4">
        <Button variant="outline" asChild>
          <Link href={`/visualizers/${visualizer.id}`}>
            View Analytics
          </Link>
        </Button>
        <Button asChild>
          <a
            href={`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/s/${visualizer.id}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Open Sales Tool
          </a>
        </Button>
      </div>
    </div>
  );
}
