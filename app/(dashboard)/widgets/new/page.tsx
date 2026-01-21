import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { WidgetForm } from '@/components/widgets/widget-form';

export default async function NewWidgetPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Create Widget</h1>
        <p className="text-muted-foreground mt-1">
          Deploy a new transformation widget for your client
        </p>
      </div>

      <WidgetForm userId={user.id} />
    </div>
  );
}
