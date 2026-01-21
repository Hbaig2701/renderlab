'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { generateWidgetId } from '@/lib/utils/generate-id';
import { WIDGET_TEMPLATES, type WidgetTemplate, type Widget } from '@/types';

interface WidgetFormProps {
  widget?: Widget;
  userId: string;
}

export function WidgetForm({ widget, userId }: WidgetFormProps) {
  const [loading, setLoading] = useState(false);
  const [template, setTemplate] = useState<WidgetTemplate>(widget?.template || 'smile');
  const [clientName, setClientName] = useState(widget?.client_name || '');
  const [brandColor, setBrandColor] = useState(widget?.brand_color || '#F59E0B');
  const [ctaText, setCtaText] = useState(widget?.cta_text || 'See Your Transformation');
  const router = useRouter();
  const supabase = createClient();

  const isEditing = !!widget;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const widgetData = {
      template,
      client_name: clientName,
      brand_color: brandColor,
      cta_text: ctaText,
      user_id: userId,
    };

    if (isEditing) {
      const { error } = await supabase
        .from('widgets')
        .update(widgetData)
        .eq('id', widget.id);

      if (error) {
        toast.error('Failed to update widget');
        setLoading(false);
        return;
      }

      toast.success('Widget updated successfully');
      router.push(`/widgets/${widget.id}`);
    } else {
      const { error } = await supabase.from('widgets').insert({
        ...widgetData,
        id: generateWidgetId(),
        status: 'active',
      });

      if (error) {
        toast.error('Failed to create widget');
        setLoading(false);
        return;
      }

      toast.success('Widget created successfully');
      router.push('/widgets');
    }

    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Template Selection */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Widget Template</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {(Object.entries(WIDGET_TEMPLATES) as [WidgetTemplate, typeof WIDGET_TEMPLATES[WidgetTemplate]][]).map(
              ([key, value]) => (
                <div
                  key={key}
                  onClick={() => setTemplate(key)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                    template === key
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-muted-foreground'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{value.icon}</span>
                    <div>
                      <h3 className="font-medium">{value.name}</h3>
                      <p className="text-sm text-muted-foreground">{value.description}</p>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        </CardContent>
      </Card>

      {/* Client Details */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Client Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="clientName">Client Name</Label>
            <Input
              id="clientName"
              placeholder="e.g., Smith Dental Clinic"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              required
              className="bg-background"
            />
            <p className="text-xs text-muted-foreground">
              This name is for your reference only
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Branding */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Branding</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="brandColor">Brand Color</Label>
            <div className="flex gap-3">
              <Input
                type="color"
                id="brandColor"
                value={brandColor}
                onChange={(e) => setBrandColor(e.target.value)}
                className="w-14 h-10 p-1 cursor-pointer"
              />
              <Input
                value={brandColor}
                onChange={(e) => setBrandColor(e.target.value)}
                placeholder="#F59E0B"
                className="bg-background font-mono"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ctaText">Call-to-Action Text</Label>
            <Input
              id="ctaText"
              placeholder="See Your Transformation"
              value={ctaText}
              onChange={(e) => setCtaText(e.target.value)}
              className="bg-background"
            />
          </div>
        </CardContent>
      </Card>

      {/* Submit */}
      <div className="flex gap-4">
        <Button type="submit" disabled={loading || !clientName}>
          {loading ? 'Saving...' : isEditing ? 'Update Widget' : 'Create Widget'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
