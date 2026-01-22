'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calculator, DollarSign, TrendingUp, Info } from 'lucide-react';
import { WIDGET_TEMPLATES, type WidgetTemplate } from '@/types';

// Industry benchmark data
const INDUSTRY_BENCHMARKS: Record<WidgetTemplate, {
  avgMonthlyPrice: number;
  avgTransformsPerMonth: number;
  conversionLift: string;
}> = {
  smile: {
    avgMonthlyPrice: 299,
    avgTransformsPerMonth: 150,
    conversionLift: '15-25%',
  },
  hair: {
    avgMonthlyPrice: 199,
    avgTransformsPerMonth: 200,
    conversionLift: '20-30%',
  },
  kitchen_remodel: {
    avgMonthlyPrice: 349,
    avgTransformsPerMonth: 80,
    conversionLift: '25-40%',
  },
  landscaping: {
    avgMonthlyPrice: 249,
    avgTransformsPerMonth: 100,
    conversionLift: '20-35%',
  },
};

// Usage type multipliers
const USAGE_MULTIPLIERS = {
  sales_tool: 1.0, // In-person sales demos
  website_embed: 1.3, // Higher volume on websites
  both: 1.5, // Combined usage
};

export default function CalculatorPage() {
  const [widgetType, setWidgetType] = useState<WidgetTemplate | ''>('');
  const [usageType, setUsageType] = useState<'sales_tool' | 'website_embed' | 'both' | ''>('');
  const [expectedVolume, setExpectedVolume] = useState<string>('');
  const [result, setResult] = useState<{
    recommendedPrice: number;
    minPrice: number;
    maxPrice: number;
    yourCost: number;
    margin: number;
    marginPercent: number;
  } | null>(null);

  const handleCalculate = () => {
    if (!widgetType || !usageType || !expectedVolume) return;

    const volume = parseInt(expectedVolume) || 0;
    const benchmark = INDUSTRY_BENCHMARKS[widgetType];
    const multiplier = USAGE_MULTIPLIERS[usageType];

    // Calculate your cost (based on Pro plan - $99/mo for 200 widget transforms)
    const costPerTransform = 0.50; // Approximate cost per transform on Pro plan
    const yourCost = Math.max(99, volume * costPerTransform); // Minimum $99

    // Calculate recommended pricing
    const basePrice = benchmark.avgMonthlyPrice;
    const volumeAdjustment = volume > benchmark.avgTransformsPerMonth ? 1.2 : 1.0;
    const recommendedPrice = Math.round(basePrice * multiplier * volumeAdjustment);

    // Calculate range
    const minPrice = Math.round(recommendedPrice * 0.7);
    const maxPrice = Math.round(recommendedPrice * 1.4);

    // Calculate margin
    const margin = recommendedPrice - yourCost;
    const marginPercent = Math.round((margin / recommendedPrice) * 100);

    setResult({
      recommendedPrice,
      minPrice,
      maxPrice,
      yourCost: Math.round(yourCost),
      margin: Math.round(margin),
      marginPercent,
    });
  };

  const selectedBenchmark = widgetType ? INDUSTRY_BENCHMARKS[widgetType] : null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Pricing Calculator</h1>
        <p className="text-muted-foreground mt-1">
          Calculate recommended pricing for your client widgets
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Calculator Form */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Calculate Pricing
            </CardTitle>
            <CardDescription>
              Enter details about the widget deployment to get pricing recommendations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Widget Type */}
            <div className="space-y-2">
              <Label>Widget Type</Label>
              <Select
                value={widgetType}
                onValueChange={(v) => setWidgetType(v as WidgetTemplate)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select widget type" />
                </SelectTrigger>
                <SelectContent>
                  {(Object.entries(WIDGET_TEMPLATES) as [WidgetTemplate, typeof WIDGET_TEMPLATES.smile][]).map(
                    ([key, template]) => (
                      <SelectItem key={key} value={key}>
                        {template.icon} {template.name}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Usage Type */}
            <div className="space-y-2">
              <Label>Usage Type</Label>
              <Select
                value={usageType}
                onValueChange={(v) => setUsageType(v as typeof usageType)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="How will the widget be used?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sales_tool">Sales Tool (in-person demos)</SelectItem>
                  <SelectItem value="website_embed">Website Embed (public facing)</SelectItem>
                  <SelectItem value="both">Both (sales + website)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Expected Volume */}
            <div className="space-y-2">
              <Label>Expected Monthly Transforms</Label>
              <Input
                type="number"
                placeholder="e.g., 100"
                value={expectedVolume}
                onChange={(e) => setExpectedVolume(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Estimate how many transformations per month
              </p>
            </div>

            <Button
              onClick={handleCalculate}
              className="w-full"
              disabled={!widgetType || !usageType || !expectedVolume}
            >
              Calculate Pricing
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="space-y-6">
          {/* Pricing Result */}
          {result ? (
            <Card className="bg-card border-border border-primary">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-primary" />
                  Recommended Pricing
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground">Charge your client</p>
                  <p className="text-5xl font-bold text-primary">
                    ${result.recommendedPrice}
                    <span className="text-lg font-normal text-muted-foreground">/mo</span>
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Range: ${result.minPrice} - ${result.maxPrice}/mo
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Your Cost</p>
                    <p className="text-xl font-semibold">${result.yourCost}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Your Margin</p>
                    <p className="text-xl font-semibold text-success">${result.margin}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Margin %</p>
                    <p className="text-xl font-semibold text-success">{result.marginPercent}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-card border-border border-dashed">
              <CardContent className="py-12 text-center">
                <Calculator className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Fill in the form to see pricing recommendations
                </p>
              </CardContent>
            </Card>
          )}

          {/* Industry Benchmarks */}
          {selectedBenchmark && (
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <TrendingUp className="h-4 w-4" />
                  Industry Benchmarks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Avg. Monthly Price</span>
                    <span className="font-medium">${selectedBenchmark.avgMonthlyPrice}/mo</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Avg. Transforms/Month</span>
                    <span className="font-medium">{selectedBenchmark.avgTransformsPerMonth}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Conversion Lift</span>
                    <span className="font-medium text-success">{selectedBenchmark.conversionLift}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tips */}
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="py-4">
              <div className="flex gap-3">
                <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium mb-1">Pricing Tips</p>
                  <ul className="text-muted-foreground space-y-1">
                    <li>• Website embeds justify higher pricing due to 24/7 availability</li>
                    <li>• Consider value-based pricing for high-ticket industries (dental, remodeling)</li>
                    <li>• Offer quarterly/annual discounts for longer commitments</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
