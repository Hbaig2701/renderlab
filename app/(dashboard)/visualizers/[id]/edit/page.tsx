import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import { VisualizerForm } from '@/components/visualizers/visualizer-form';
import type { Visualizer } from '@/types';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditVisualizerPage({ params }: PageProps) {
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

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Edit Visualizer</h1>
        <p className="text-muted-foreground mt-1">
          Update settings for {visualizer.client_name}
        </p>
      </div>

      <VisualizerForm visualizer={visualizer as Visualizer} userId={user.id} />
    </div>
  );
}
