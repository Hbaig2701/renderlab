'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreVertical, ExternalLink, BarChart3, Trash2, Code, Link2, Settings } from 'lucide-react';
import { toast } from 'sonner';
import { WIDGET_TEMPLATES, type Widget } from '@/types';
import { EmbedCodeModal } from './embed-code-modal';

interface WidgetCardProps {
  widget: Widget;
}

export function WidgetCard({ widget }: WidgetCardProps) {
  const [status, setStatus] = useState(widget.status);
  const [loading, setLoading] = useState(false);
  const [embedModalOpen, setEmbedModalOpen] = useState(false);
  const router = useRouter();
  const template = WIDGET_TEMPLATES[widget.template];
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://renderlab-tau.vercel.app';

  const toggleStatus = async () => {
    setLoading(true);
    const newStatus = status === 'active' ? 'inactive' : 'active';

    // Create client inside handler to avoid build-time execution
    const supabase = createClient();
    const { error } = await supabase
      .from('widgets')
      .update({ status: newStatus })
      .eq('id', widget.id);

    if (error) {
      toast.error('Failed to update widget status');
    } else {
      setStatus(newStatus);
      toast.success(`Widget ${newStatus === 'active' ? 'activated' : 'deactivated'}`);
    }
    setLoading(false);
  };

  const deleteWidget = async () => {
    if (!confirm('Are you sure you want to delete this widget?')) return;

    // Create client inside handler to avoid build-time execution
    const supabase = createClient();
    const { error } = await supabase.from('widgets').delete().eq('id', widget.id);

    if (error) {
      toast.error('Failed to delete widget');
    } else {
      toast.success('Widget deleted');
      router.refresh();
    }
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-row items-start justify-between pb-2">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
            style={{ backgroundColor: widget.brand_color + '20' }}
          >
            {template.icon}
          </div>
          <div>
            <h3 className="font-semibold">{widget.client_name}</h3>
            <p className="text-sm text-muted-foreground">{template.name}</p>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/widgets/${widget.id}`}>
                <BarChart3 className="mr-2 h-4 w-4" />
                View analytics
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={deleteWidget} className="text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete widget
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="pb-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <code className="px-2 py-1 rounded bg-secondary font-mono text-xs">
            {widget.id}
          </code>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-3 border-t border-border pt-3">
        {/* Status toggle */}
        <div className="flex items-center gap-2 w-full">
          <Switch
            checked={status === 'active'}
            onCheckedChange={toggleStatus}
            disabled={loading}
          />
          <Badge
            variant={status === 'active' ? 'default' : 'secondary'}
            className={status === 'active' ? 'bg-success' : ''}
          >
            {status}
          </Badge>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 w-full">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => setEmbedModalOpen(true)}
          >
            <Code className="mr-1.5 h-3.5 w-3.5" />
            <span className="hidden sm:inline">Embed</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            asChild
          >
            <a
              href={`${appUrl}/s/${widget.id}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Link2 className="mr-1.5 h-3.5 w-3.5" />
              <span className="hidden sm:inline">Sales Tool</span>
              <ExternalLink className="ml-1 h-3 w-3" />
            </a>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            asChild
          >
            <Link href={`/widgets/${widget.id}/edit`}>
              <Settings className="mr-1.5 h-3.5 w-3.5" />
              <span className="hidden sm:inline">Settings</span>
            </Link>
          </Button>
        </div>
      </CardFooter>

      {/* Embed Code Modal */}
      <EmbedCodeModal
        open={embedModalOpen}
        onOpenChange={setEmbedModalOpen}
        widgetId={widget.id}
        appUrl={appUrl}
      />
    </Card>
  );
}
