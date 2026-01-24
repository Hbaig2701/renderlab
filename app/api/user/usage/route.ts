import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get current usage period
    const { data: usage } = await supabase
      .from('usage')
      .select('*')
      .eq('user_id', user.id)
      .order('period_start', { ascending: false })
      .limit(1)
      .single();

    // Get daily enhancement usage for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: enhancementDaily } = await supabase
      .from('enhancement_usage')
      .select('transformed_at')
      .eq('user_id', user.id)
      .gte('transformed_at', thirtyDaysAgo.toISOString());

    // Get daily widget usage for the last 30 days
    const { data: widgetDaily } = await supabase
      .from('widget_usage')
      .select('transformed_at')
      .eq('user_id', user.id)
      .gte('transformed_at', thirtyDaysAgo.toISOString());

    // Aggregate by date
    const enhancementByDate: Record<string, number> = {};
    const widgetByDate: Record<string, number> = {};

    enhancementDaily?.forEach((row: { transformed_at: string }) => {
      const dateStr = row.transformed_at.split('T')[0];
      enhancementByDate[dateStr] = (enhancementByDate[dateStr] || 0) + 1;
    });

    widgetDaily?.forEach((row: { transformed_at: string }) => {
      const dateStr = row.transformed_at.split('T')[0];
      widgetByDate[dateStr] = (widgetByDate[dateStr] || 0) + 1;
    });

    // Generate last 30 days array
    const dailyData = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      dailyData.push({
        date: dateStr,
        enhancements: enhancementByDate[dateStr] || 0,
        widgets: widgetByDate[dateStr] || 0,
      });
    }

    return NextResponse.json({
      current: usage || {
        enhancement_count: 0,
        widget_transform_count: 0,
        enhancement_limit: 200,
        widget_transform_limit: 50,
      },
      daily: dailyData,
    });
  } catch (error) {
    console.error('[User] Usage fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch usage' },
      { status: 500 }
    );
  }
}
