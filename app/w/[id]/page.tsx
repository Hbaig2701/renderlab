'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Upload, Camera, Loader2, RefreshCw, Download } from 'lucide-react';

interface WidgetConfig {
  id: string;
  template: string;
  client_name: string;
  brand_color: string;
  cta_text: string;
  logo_url: string | null;
}

export default function WidgetRuntimePage() {
  const params = useParams();
  const widgetId = params.id as string;

  const [config, setConfig] = useState<WidgetConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [transformedImage, setTransformedImage] = useState<string | null>(null);
  const [transforming, setTransforming] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchWidgetConfig();
  }, [widgetId]);

  const fetchWidgetConfig = async () => {
    try {
      const res = await fetch(`/api/w/${widgetId}`);
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Widget not found');
        setLoading(false);
        return;
      }
      const data = await res.json();
      setConfig(data);
    } catch {
      setError('Failed to load widget');
    }
    setLoading(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setOriginalImage(e.target?.result as string);
        setTransformedImage(null);
        setShowComparison(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTransform = async () => {
    if (!originalImage) return;

    setTransforming(true);
    try {
      const res = await fetch(`/api/w/${widgetId}/transform`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: originalImage }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Transformation failed');
        setTransforming(false);
        return;
      }

      const data = await res.json();
      setTransformedImage(data.transformedImage);
      setShowComparison(true);
    } catch {
      setError('Transformation failed. Please try again.');
    }
    setTransforming(false);
  };

  const handleReset = () => {
    setOriginalImage(null);
    setTransformedImage(null);
    setShowComparison(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDownload = () => {
    if (!transformedImage) return;
    const link = document.createElement('a');
    link.href = transformedImage;
    link.download = 'transformation.png';
    link.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !config) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="p-8 text-center max-w-md">
          <p className="text-muted-foreground">{error || 'Widget not available'}</p>
        </Card>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen p-4 md:p-8"
      style={{ backgroundColor: '#0A0A0A' }}
    >
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        {config.logo_url && (
          <div className="flex justify-center">
            <img
              src={config.logo_url}
              alt="Logo"
              className="h-12 object-contain"
            />
          </div>
        )}

        {/* Upload Area */}
        {!originalImage && (
          <Card
            className="p-8 border-2 border-dashed cursor-pointer hover:border-opacity-70 transition-colors"
            style={{ borderColor: config.brand_color }}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/*"
              className="hidden"
            />
            <div className="text-center space-y-4">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto"
                style={{ backgroundColor: config.brand_color + '20' }}
              >
                <Upload className="h-8 w-8" style={{ color: config.brand_color }} />
              </div>
              <div>
                <p className="text-lg font-medium text-white">
                  Upload your photo
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  Click or drag an image to get started
                </p>
              </div>
              <Button
                style={{ backgroundColor: config.brand_color }}
                className="text-black font-medium"
              >
                <Camera className="mr-2 h-4 w-4" />
                Choose Photo
              </Button>
            </div>
          </Card>
        )}

        {/* Image Preview / Comparison */}
        {originalImage && (
          <div className="space-y-4">
            {showComparison && transformedImage ? (
              // Before/After Comparison
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-400 mb-2 text-center">Before</p>
                  <div className="rounded-lg overflow-hidden border border-gray-800">
                    <img
                      src={originalImage}
                      alt="Before"
                      className="w-full h-auto"
                    />
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-2 text-center">After</p>
                  <div
                    className="rounded-lg overflow-hidden border-2"
                    style={{ borderColor: config.brand_color }}
                  >
                    <img
                      src={transformedImage}
                      alt="After"
                      className="w-full h-auto"
                    />
                  </div>
                </div>
              </div>
            ) : (
              // Original image only
              <div className="rounded-lg overflow-hidden border border-gray-800">
                <img
                  src={originalImage}
                  alt="Preview"
                  className="w-full h-auto"
                />
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 justify-center">
              {!showComparison && (
                <Button
                  onClick={handleTransform}
                  disabled={transforming}
                  style={{ backgroundColor: config.brand_color }}
                  className="text-black font-medium"
                >
                  {transforming ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Transforming...
                    </>
                  ) : (
                    config.cta_text
                  )}
                </Button>
              )}

              {showComparison && (
                <Button
                  onClick={handleDownload}
                  style={{ backgroundColor: config.brand_color }}
                  className="text-black font-medium"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Result
                </Button>
              )}

              <Button
                variant="outline"
                onClick={handleReset}
                className="border-gray-700 text-white hover:bg-gray-800"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Another
              </Button>
            </div>
          </div>
        )}

        {/* Powered by */}
        <p className="text-center text-xs text-gray-500 pt-4">
          Powered by RenderLab
        </p>
      </div>
    </div>
  );
}
