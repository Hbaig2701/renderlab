'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface DailyData {
  date: string;
  enhancements: number;
  widgets: number;
}

interface UsageData {
  current: {
    enhancement_count: number;
    widget_transform_count: number;
    enhancement_limit: number;
    widget_transform_limit: number;
  };
  daily: DailyData[];
}

export function UsageChart() {
  const [data, setData] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeType, setActiveType] = useState<'enhancements' | 'widgets'>('enhancements');

  useEffect(() => {
    fetchUsage();
  }, []);

  const fetchUsage = async () => {
    try {
      const res = await fetch('/api/user/usage');
      if (res.ok) {
        const data = await res.json();
        setData(data);
      }
    } catch (error) {
      console.error('Failed to fetch usage:', error);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return null;
  }

  const chartData = data.daily;
  const maxValue = Math.max(
    ...chartData.map((d) => (activeType === 'enhancements' ? d.enhancements : d.widgets)),
    1
  );

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle>Usage (Last 30 Days)</CardTitle>
          <div className="flex gap-2">
            <button
              onClick={() => setActiveType('enhancements')}
              className={`px-3 py-1 text-xs rounded-full transition-colors ${
                activeType === 'enhancements'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              Enhancements
            </button>
            <button
              onClick={() => setActiveType('widgets')}
              className={`px-3 py-1 text-xs rounded-full transition-colors ${
                activeType === 'widgets'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              Widgets
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-48 flex items-end gap-1">
          {chartData.map((day, i) => {
            const value = activeType === 'enhancements' ? day.enhancements : day.widgets;
            const height = maxValue > 0 ? (value / maxValue) * 100 : 0;
            const date = new Date(day.date);
            const isToday = i === chartData.length - 1;

            return (
              <div
                key={day.date}
                className="flex-1 flex flex-col items-center group relative"
              >
                <div
                  className={`w-full rounded-t transition-all ${
                    isToday ? 'bg-primary' : 'bg-primary/60 hover:bg-primary/80'
                  }`}
                  style={{ height: `${Math.max(height, 2)}%` }}
                />
                {/* Tooltip */}
                <div className="absolute bottom-full mb-2 hidden group-hover:block bg-popover border border-border rounded-lg px-2 py-1 text-xs whitespace-nowrap z-10">
                  <p className="font-medium">{date.toLocaleDateString()}</p>
                  <p className="text-muted-foreground">
                    {value} {activeType}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex justify-between mt-2 text-xs text-muted-foreground">
          <span>30 days ago</span>
          <span>Today</span>
        </div>
        {/* Summary */}
        <div className="mt-4 pt-4 border-t border-border grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Total This Period</p>
            <p className="text-xl font-semibold">
              {activeType === 'enhancements'
                ? data.current.enhancement_count
                : data.current.widget_transform_count}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Limit</p>
            <p className="text-xl font-semibold">
              {activeType === 'enhancements'
                ? data.current.enhancement_limit
                : data.current.widget_transform_limit}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
