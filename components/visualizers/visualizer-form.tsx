'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { generateWidgetId } from '@/lib/utils/generate-id';
import { VISUALIZER_TEMPLATES, TEMPLATE_OPTIONS, HAIR_CATEGORIES, type VisualizerTemplate, type Visualizer } from '@/types';

interface VisualizerFormProps {
  visualizer?: Visualizer;
  userId: string;
}

export function VisualizerForm({ visualizer, userId }: VisualizerFormProps) {
  const [loading, setLoading] = useState(false);
  const [template, setTemplate] = useState<VisualizerTemplate>(visualizer?.template || 'smile');
  const [clientName, setClientName] = useState(visualizer?.client_name || '');
  const [brandColor, setBrandColor] = useState(visualizer?.brand_color || '#F59E0B');
  const [ctaText, setCtaText] = useState(visualizer?.cta_text || 'See Your Transformation');
  const [enabledOptions, setEnabledOptions] = useState<string[]>([]);
  // Sales tool settings
  const [salesToolEnabled, setSalesToolEnabled] = useState(visualizer?.sales_tool_enabled || false);
  const [businessPhone, setBusinessPhone] = useState(visualizer?.business_phone || '');
  const [businessEmail, setBusinessEmail] = useState(visualizer?.business_email || '');
  const [businessWebsite, setBusinessWebsite] = useState(visualizer?.business_website || '');
  const [businessTagline, setBusinessTagline] = useState(visualizer?.business_tagline || '');
  const router = useRouter();

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://renderlab-tau.vercel.app';

  const isEditing = !!visualizer;
  const isHairTemplate = template === 'hair';

  // Get available options for selected template
  const templateOptions = TEMPLATE_OPTIONS[template] || [];

  // Initialize enabled options when template changes or on mount
  useEffect(() => {
    if (visualizer?.enabled_options) {
      setEnabledOptions(visualizer.enabled_options);
    } else {
      // Default: all options enabled
      setEnabledOptions(templateOptions.map(o => o.key));
    }
  }, [template]);

  const toggleOption = (key: string) => {
    setEnabledOptions(prev => {
      if (prev.includes(key)) {
        // Don't allow disabling all options
        if (prev.length === 1) {
          toast.error('At least one option must be enabled');
          return prev;
        }
        return prev.filter(k => k !== key);
      } else {
        return [...prev, key];
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // If all options are enabled, store null (default behavior)
    const optionsToStore = enabledOptions.length === templateOptions.length
      ? null
      : enabledOptions;

    const visualizerData = {
      template,
      client_name: clientName,
      brand_color: brandColor,
      cta_text: ctaText,
      enabled_options: optionsToStore,
      user_id: userId,
      sales_tool_enabled: salesToolEnabled,
      business_phone: businessPhone || null,
      business_email: businessEmail || null,
      business_website: businessWebsite || null,
      business_tagline: businessTagline || null,
    };

    // Create client inside handler to avoid build-time execution
    const supabase = createClient();

    if (isEditing) {
      const { error } = await supabase
        .from('visualizers')
        .update(visualizerData)
        .eq('id', visualizer.id);

      if (error) {
        console.error('Visualizer update error:', error);
        toast.error(`Failed to update visualizer: ${error.message}`);
        setLoading(false);
        return;
      }

      toast.success('Visualizer updated successfully');
      router.push(`/visualizers/${visualizer.id}`);
    } else {
      const { error } = await supabase.from('visualizers').insert({
        ...visualizerData,
        id: generateWidgetId(),
        status: 'active',
      });

      if (error) {
        console.error('Visualizer creation error:', error);
        toast.error(`Failed to create visualizer: ${error.message}`);
        setLoading(false);
        return;
      }

      toast.success('Visualizer created successfully');
      router.push('/visualizers');
    }

    router.refresh();
  };

  // Group options by category for hair template
  const getOptionsByCategory = (categoryKey: string) => {
    return templateOptions.filter(o => o.category === categoryKey);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Template Selection */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Visualizer Type</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {(Object.entries(VISUALIZER_TEMPLATES) as [VisualizerTemplate, typeof VISUALIZER_TEMPLATES[VisualizerTemplate]][]).map(
              ([key, value]) => (
                <div
                  key={key}
                  onClick={() => {
                    setTemplate(key);
                    // Reset to all options when changing template
                    setEnabledOptions(TEMPLATE_OPTIONS[key].map(o => o.key));
                  }}
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

      {/* Transformation Options */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Transformation Options</CardTitle>
          <p className="text-sm text-muted-foreground">
            Choose which transformation styles are available in this visualizer
          </p>
        </CardHeader>
        <CardContent>
          {isHairTemplate ? (
            // Hair template - grouped by category
            <div className="space-y-6">
              {Object.entries(HAIR_CATEGORIES).map(([categoryKey, categoryInfo]) => {
                const categoryOptions = getOptionsByCategory(categoryKey);
                if (categoryOptions.length === 0) return null;

                return (
                  <div key={categoryKey} className="space-y-3">
                    <div className="flex items-center gap-2 pb-2 border-b border-border">
                      <span className="text-lg">{categoryInfo.icon}</span>
                      <h4 className="font-medium text-sm uppercase tracking-wide text-muted-foreground">
                        {categoryInfo.label}
                      </h4>
                    </div>
                    <div className="space-y-2">
                      {categoryOptions.map((option) => (
                        <div
                          key={option.key}
                          className="flex items-center justify-between p-3 rounded-lg bg-background border border-border"
                        >
                          <div>
                            <p className="font-medium">{option.label}</p>
                            <p className="text-sm text-muted-foreground">{option.description}</p>
                          </div>
                          <Switch
                            checked={enabledOptions.includes(option.key)}
                            onCheckedChange={() => toggleOption(option.key)}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            // Other templates - flat list
            <div className="space-y-4">
              {templateOptions.map((option) => (
                <div
                  key={option.key}
                  className="flex items-center justify-between p-3 rounded-lg bg-background border border-border"
                >
                  <div>
                    <p className="font-medium">{option.label}</p>
                    <p className="text-sm text-muted-foreground">{option.description}</p>
                  </div>
                  <Switch
                    checked={enabledOptions.includes(option.key)}
                    onCheckedChange={() => toggleOption(option.key)}
                  />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Client Details */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Business Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="clientName">Business Name</Label>
            <Input
              id="clientName"
              placeholder={isHairTemplate ? "e.g., Luxe Hair Studio" : "e.g., Smith Dental Clinic"}
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
              placeholder={isHairTemplate ? "Show Me" : "See Your Transformation"}
              value={ctaText}
              onChange={(e) => setCtaText(e.target.value)}
              className="bg-background"
            />
          </div>
        </CardContent>
      </Card>

      {/* Sales Tool Access */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Sales Tool Access</CardTitle>
          <p className="text-sm text-muted-foreground">
            Use this visualizer as an in-person sales tool during consultations
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-lg bg-background border border-border">
            <div>
              <p className="font-medium">Enable sales tool</p>
              <p className="text-sm text-muted-foreground">
                Get a direct URL to use during in-person consultations
              </p>
            </div>
            <Switch
              checked={salesToolEnabled}
              onCheckedChange={setSalesToolEnabled}
            />
          </div>

          {salesToolEnabled && isEditing && (
            <>
              <div className="space-y-2">
                <Label>Tool URL</Label>
                <div className="flex gap-2">
                  <Input
                    value={`${appUrl}/s/${visualizer?.id}`}
                    readOnly
                    className="bg-background font-mono text-sm"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(`${appUrl}/s/${visualizer?.id}`);
                      toast.success('URL copied to clipboard');
                    }}
                  >
                    Copy
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Share this URL with the business
                </p>
              </div>

              <div className="border-t border-border pt-4 mt-4">
                <p className="text-sm font-medium mb-3">
                  Contact Info{' '}
                  <span className="font-normal text-muted-foreground">
                    (shown in emails &amp; preview pages)
                  </span>
                </p>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="businessPhone">Phone</Label>
                    <Input
                      id="businessPhone"
                      type="tel"
                      placeholder="(555) 123-4567"
                      value={businessPhone}
                      onChange={(e) => setBusinessPhone(e.target.value)}
                      className="bg-background"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="businessEmail">Email</Label>
                    <Input
                      id="businessEmail"
                      type="email"
                      placeholder="info@yourbusiness.com"
                      value={businessEmail}
                      onChange={(e) => setBusinessEmail(e.target.value)}
                      className="bg-background"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="businessWebsite">Website</Label>
                    <Input
                      id="businessWebsite"
                      type="url"
                      placeholder="https://yourbusiness.com"
                      value={businessWebsite}
                      onChange={(e) => setBusinessWebsite(e.target.value)}
                      className="bg-background"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="businessTagline">Tagline (optional)</Label>
                    <Input
                      id="businessTagline"
                      placeholder="Your business tagline"
                      value={businessTagline}
                      onChange={(e) => setBusinessTagline(e.target.value)}
                      className="bg-background"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {salesToolEnabled && !isEditing && (
            <p className="text-sm text-muted-foreground bg-background p-3 rounded-lg border border-border">
              Save this visualizer first to get your tool URL and configure contact details.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Submit */}
      <div className="flex gap-4">
        <Button type="submit" disabled={loading || !clientName}>
          {loading ? 'Saving...' : isEditing ? 'Update Visualizer' : 'Create Visualizer'}
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
