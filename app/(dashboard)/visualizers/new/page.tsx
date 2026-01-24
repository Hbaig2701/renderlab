import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { VisualizerForm } from '@/components/visualizers/visualizer-form';

export default async function NewVisualizerPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Create Visualizer</h1>
        <p className="text-muted-foreground mt-1">
          Deploy a new transformation visualizer for your client
        </p>
      </div>

      <VisualizerForm userId={user.id} />
    </div>
  );
}
