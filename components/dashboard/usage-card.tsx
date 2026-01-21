'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface UsageCardProps {
  title: string;
  used: number;
  limit: number;
  icon?: React.ReactNode;
  className?: string;
}

export function UsageCard({ title, used, limit, icon, className }: UsageCardProps) {
  const percentage = Math.min((used / limit) * 100, 100);
  const isWarning = percentage >= 80;
  const isOver = percentage >= 100;

  return (
    <Card className={cn('bg-card border-border', className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {used.toLocaleString()}{' '}
          <span className="text-sm font-normal text-muted-foreground">
            / {limit.toLocaleString()}
          </span>
        </div>
        <Progress
          value={percentage}
          className={cn(
            'mt-3 h-2',
            isOver && '[&>div]:bg-destructive',
            isWarning && !isOver && '[&>div]:bg-warning'
          )}
        />
        <p className="mt-2 text-xs text-muted-foreground">
          {Math.round(percentage)}% used this period
        </p>
      </CardContent>
    </Card>
  );
}
