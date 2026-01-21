import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import { WidgetForm } from '@/components/widgets/widget-form';
import type { Widget } from '@/types';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditWidgetPage({ params }: PageProps) {
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

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Edit Widget</h1>
        <p className="text-muted-foreground mt-1">
          Update settings for {widget.client_name}
        </p>
      </div>

      <WidgetForm widget={widget as Widget} userId={user.id} />
    </div>
  );
}
