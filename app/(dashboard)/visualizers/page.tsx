import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { VisualizerCard } from '@/components/visualizers/visualizer-card';
import { Plus, Layers } from 'lucide-react';
import Link from 'next/link';
import type { Visualizer } from '@/types';

export default async function VisualizersPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  const { data: visualizers } = await supabase
    .from('visualizers')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Visualizers</h1>
          <p className="text-muted-foreground mt-1">
            Manage your deployed transformation visualizers
          </p>
        </div>
        <Button asChild>
          <Link href="/visualizers/new">
            <Plus className="mr-2 h-4 w-4" />
            New Visualizer
          </Link>
        </Button>
      </div>

      {/* Visualizers Grid */}
      {visualizers && visualizers.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {visualizers.map((visualizer: Visualizer) => (
            <VisualizerCard key={visualizer.id} visualizer={visualizer} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border border-dashed border-border rounded-lg">
          <Layers className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No visualizers yet</h3>
          <p className="text-muted-foreground mb-4">
            Create your first visualizer to start delivering AI transformations to your clients.
          </p>
          <Button asChild>
            <Link href="/visualizers/new">
              <Plus className="mr-2 h-4 w-4" />
              Create Visualizer
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
