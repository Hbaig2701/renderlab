import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Edit } from 'lucide-react';
import Link from 'next/link';
import { VISUALIZER_TEMPLATES } from '@/types';
import { ROIReportButton } from '@/components/visualizers/roi-report-button';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function VisualizerDetailPage({ params }: PageProps) {
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

  // Get consultation stats for this visualizer
  const { count: totalConsultations } = await supabase
    .from('consultations')
    .select('*', { count: 'exact', head: true })
    .eq('visualizer_id', id);

  // Get consultations from last 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const { count: weekConsultations } = await supabase
    .from('consultations')
    .select('*', { count: 'exact', head: true })
    .eq('visualizer_id', id)
    .gte('created_at', sevenDaysAgo.toISOString());

  const template = VISUALIZER_TEMPLATES[visualizer.template as keyof typeof VISUALIZER_TEMPLATES];
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div
            className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
            style={{ backgroundColor: visualizer.brand_color + '20' }}
          >
            {template.icon}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">{visualizer.client_name}</h1>
              <Badge
                variant={visualizer.status === 'active' ? 'default' : 'secondary'}
                className={visualizer.status === 'active' ? 'bg-success' : ''}
              >
                {visualizer.status}
              </Badge>
            </div>
            <p className="text-muted-foreground">{template.name}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <ROIReportButton
            visualizerId={visualizer.id}
            clientName={visualizer.client_name}
            templateName={template.name}
            totalConsultations={totalConsultations || 0}
            weekConsultations={weekConsultations || 0}
            createdAt={visualizer.created_at}
          />
          <Button variant="outline" asChild>
            <a href={`${appUrl}/s/${visualizer.id}`} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" />
              Open Tool
            </a>
          </Button>
          <Button asChild>
            <Link href={`/visualizers/${visualizer.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Consultations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalConsultations || 0}</div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Last 7 Days
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{weekConsultations || 0}</div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Visualizer ID
            </CardTitle>
          </CardHeader>
          <CardContent>
            <code className="text-lg font-mono">{visualizer.id}</code>
          </CardContent>
        </Card>
      </div>

      {/* Sales Tool Access */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Sales Tool Access</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-3">
            Share this URL with the business to access the consultation tool
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 px-3 py-2 rounded bg-secondary font-mono text-sm">
              {appUrl}/s/{visualizer.id}
            </code>
            <Button
              variant="outline"
              onClick={() => {
                navigator.clipboard.writeText(`${appUrl}/s/${visualizer.id}`);
              }}
            >
              Copy
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Visualizer Settings Summary */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Visualizer Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">Template</p>
              <p className="font-medium">{template.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Brand Color</p>
              <div className="flex items-center gap-2">
                <div
                  className="w-6 h-6 rounded border border-border"
                  style={{ backgroundColor: visualizer.brand_color }}
                />
                <span className="font-mono">{visualizer.brand_color}</span>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">CTA Text</p>
              <p className="font-medium">{visualizer.cta_text}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Created</p>
              <p className="font-medium">
                {new Date(visualizer.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
