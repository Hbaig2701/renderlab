import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Edit } from 'lucide-react';
import Link from 'next/link';
import { WIDGET_TEMPLATES } from '@/types';
import { EmbedCodeDisplay } from '@/components/widgets/embed-code-modal';
import { ROIReportButton } from '@/components/widgets/roi-report-button';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function WidgetDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  const { data: widget } = await supabase
    .from('widgets')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (!widget) {
    notFound();
  }

  // Get usage stats for this widget
  const { count: totalTransforms } = await supabase
    .from('widget_usage')
    .select('*', { count: 'exact', head: true })
    .eq('widget_id', id);

  // Get transforms from last 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const { count: weekTransforms } = await supabase
    .from('widget_usage')
    .select('*', { count: 'exact', head: true })
    .eq('widget_id', id)
    .gte('transformed_at', sevenDaysAgo.toISOString());

  const template = WIDGET_TEMPLATES[widget.template as keyof typeof WIDGET_TEMPLATES];
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div
            className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
            style={{ backgroundColor: widget.brand_color + '20' }}
          >
            {template.icon}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">{widget.client_name}</h1>
              <Badge
                variant={widget.status === 'active' ? 'default' : 'secondary'}
                className={widget.status === 'active' ? 'bg-success' : ''}
              >
                {widget.status}
              </Badge>
            </div>
            <p className="text-muted-foreground">{template.name}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <ROIReportButton
            widgetId={widget.id}
            clientName={widget.client_name}
            templateName={template.name}
            totalTransforms={totalTransforms || 0}
            weekTransforms={weekTransforms || 0}
            createdAt={widget.created_at}
          />
          <Button variant="outline" asChild>
            <Link href={`/w/${widget.id}`} target="_blank">
              <ExternalLink className="mr-2 h-4 w-4" />
              Preview
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/widgets/${widget.id}/edit`}>
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
              Total Transforms
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalTransforms || 0}</div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Last 7 Days
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{weekTransforms || 0}</div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Widget ID
            </CardTitle>
          </CardHeader>
          <CardContent>
            <code className="text-lg font-mono">{widget.id}</code>
          </CardContent>
        </Card>
      </div>

      {/* Embed Code */}
      <EmbedCodeDisplay widgetId={widget.id} appUrl={appUrl} />

      {/* Widget Settings Summary */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Widget Settings</CardTitle>
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
                  style={{ backgroundColor: widget.brand_color }}
                />
                <span className="font-mono">{widget.brand_color}</span>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">CTA Text</p>
              <p className="font-medium">{widget.cta_text}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Created</p>
              <p className="font-medium">
                {new Date(widget.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
