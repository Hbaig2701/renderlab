import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { WidgetCard } from '@/components/widgets/widget-card';
import { Plus, Layers } from 'lucide-react';
import Link from 'next/link';
import type { Widget } from '@/types';

export default async function WidgetsPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  const { data: widgets } = await supabase
    .from('widgets')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Widgets</h1>
          <p className="text-muted-foreground mt-1">
            Manage your deployed transformation widgets
          </p>
        </div>
        <Button asChild>
          <Link href="/widgets/new">
            <Plus className="mr-2 h-4 w-4" />
            New Widget
          </Link>
        </Button>
      </div>

      {/* Widgets Grid */}
      {widgets && widgets.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {widgets.map((widget) => (
            <WidgetCard key={widget.id} widget={widget as Widget} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border border-dashed border-border rounded-lg">
          <Layers className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No widgets yet</h3>
          <p className="text-muted-foreground mb-4">
            Create your first widget to start delivering AI transformations to your clients.
          </p>
          <Button asChild>
            <Link href="/widgets/new">
              <Plus className="mr-2 h-4 w-4" />
              Create Widget
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
