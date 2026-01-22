'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Upload, Camera, Loader2, RefreshCw, Download, Sparkles } from 'lucide-react';

interface WidgetOption {
  key: string;
  label: string;
  description: string;
  category?: string;
}

interface WidgetConfig {
  id: string;
  template: string;
  client_name: string;
  brand_color: string;
  cta_text: string;
  logo_url: string | null;
  options: WidgetOption[];
}

// Hair categories configuration
const HAIR_CATEGORIES = {
  color: { label: 'Color', icon: '🎨' },
  cut: { label: 'Cut', icon: '✂️' },
  texture: { label: 'Texture', icon: '💫' },
};

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
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [lastTransformedOption, setLastTransformedOption] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Check if this is a hair widget (has categories)
  const isHairWidget = config?.template === 'hair';

  // Get available categories for hair widget
  const availableCategories = isHairWidget
    ? [...new Set(config?.options.map(o => o.category).filter((c): c is string => !!c))]
    : [];

  // Get options for selected category (hair widget) or all options (other widgets)
  const displayOptions = isHairWidget
    ? config?.options.filter(o => o.category === selectedCategory) || []
    : config?.options || [];

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

      // For hair widgets, don't set a default option until category is selected
      // For other widgets, set default to first option
      if (data.template !== 'hair' && data.options && data.options.length > 0) {
        setSelectedOption(data.options[0].key);
      }
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
        setLastTransformedOption(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    // Reset option when changing category
    setSelectedOption(null);
  };

  const handleTransform = async () => {
    if (!originalImage || !selectedOption) return;

    setTransforming(true);
    setError(null);
    try {
      const res = await fetch(`/api/w/${widgetId}/transform`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: originalImage, option: selectedOption }),
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
      setLastTransformedOption(selectedOption);
    } catch {
      setError('Transformation failed. Please try again.');
    }
    setTransforming(false);
  };

  const handleTryAnotherStyle = () => {
    // Keep the original image but clear the transformation
    setTransformedImage(null);
    setShowComparison(false);
    setError(null);
    // For hair widgets, also reset category selection
    if (isHairWidget) {
      setSelectedCategory(null);
      setSelectedOption(null);
    }
  };

  const handleReset = () => {
    setOriginalImage(null);
    setTransformedImage(null);
    setShowComparison(false);
    setLastTransformedOption(null);
    setSelectedCategory(null);
    setSelectedOption(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (cameraInputRef.current) {
      cameraInputRef.current.value = '';
    }
  };

  const handleDownload = () => {
    if (!transformedImage) return;
    const link = document.createElement('a');
    link.href = transformedImage;
    link.download = 'transformation.png';
    link.click();
  };

  // Check if the selected option has changed from last transformation
  const canTransformNewStyle = showComparison && selectedOption !== lastTransformedOption;

  // Get the label for the current selected option
  const selectedOptionLabel = config?.options.find(o => o.key === selectedOption)?.label;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A]">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    );
  }

  if (error && !config) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A] p-4">
        <Card className="p-8 text-center max-w-md bg-[#1A1A1A] border-[#2E2E2E]">
          <p className="text-gray-400">{error}</p>
        </Card>
      </div>
    );
  }

  if (!config) return null;

  return (
    <div className="min-h-screen p-4 md:p-8 bg-[#0A0A0A]">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header with Logo */}
        {config.logo_url && (
          <div className="flex justify-center">
            <img
              src={config.logo_url}
              alt="Logo"
              className="h-12 object-contain"
            />
          </div>
        )}

        {/* Title for hair widgets */}
        {isHairWidget && !showComparison && (
          <h1 className="text-2xl font-bold text-center text-white">
            See Your New Look
          </h1>
        )}

        {/* Error Alert */}
        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        {/* Upload Area */}
        {!originalImage && (
          <Card className="p-8 border-2 border-dashed bg-[#1A1A1A]" style={{ borderColor: config.brand_color }}>
            {/* Hidden file inputs */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/*"
              className="hidden"
            />
            <input
              type="file"
              ref={cameraInputRef}
              onChange={handleFileSelect}
              accept="image/*"
              capture="user"
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
                  {isHairWidget ? 'Take a selfie or upload a photo' : 'Choose from your gallery or take a new photo'}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  style={{ backgroundColor: config.brand_color }}
                  className="text-black font-medium"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Photo
                </Button>
                <Button
                  onClick={() => cameraInputRef.current?.click()}
                  variant="outline"
                  className="border-[#2E2E2E] text-white hover:bg-[#1A1A1A]"
                >
                  <Camera className="mr-2 h-4 w-4" />
                  {isHairWidget ? 'Take Selfie' : 'Take Photo'}
                </Button>
              </div>
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
                  <div className="rounded-lg overflow-hidden border border-[#2E2E2E]">
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
              <div className="rounded-lg overflow-hidden border border-[#2E2E2E] max-w-md mx-auto">
                <img
                  src={originalImage}
                  alt="Preview"
                  className="w-full h-auto"
                />
              </div>
            )}

            {/* Results message for hair widget */}
            {showComparison && isHairWidget && selectedOptionLabel && (
              <p className="text-center text-white">
                Love your <span style={{ color: config.brand_color }}>{selectedOptionLabel}</span> look?
              </p>
            )}

            {/* Category Selector for Hair Widgets */}
            {isHairWidget && !showComparison && availableCategories.length > 0 && (
              <div className="space-y-3">
                <p className="text-center text-sm text-gray-400">
                  What do you want to change?
                </p>
                <div className="flex justify-center gap-3">
                  {availableCategories.map((category) => {
                    const catInfo = HAIR_CATEGORIES[category as keyof typeof HAIR_CATEGORIES];
                    if (!catInfo) return null;
                    return (
                      <button
                        key={category}
                        onClick={() => handleCategorySelect(category)}
                        disabled={transforming}
                        className={`px-6 py-4 rounded-xl text-center transition-all disabled:opacity-50 ${
                          selectedCategory === category
                            ? 'text-black'
                            : 'bg-[#1A1A1A] text-white hover:bg-[#252525] border border-[#2E2E2E]'
                        }`}
                        style={
                          selectedCategory === category
                            ? { backgroundColor: config.brand_color }
                            : {}
                        }
                      >
                        <span className="text-2xl block mb-1">{catInfo.icon}</span>
                        <span className="text-sm font-medium">{catInfo.label}</span>
                        {selectedCategory === category && (
                          <span className="block text-xs mt-1">✓</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Sub-options for selected category (Hair) or all options (Other) */}
            {!showComparison && (isHairWidget ? selectedCategory : true) && displayOptions.length > 0 && (
              <div className="flex flex-wrap justify-center gap-2">
                {displayOptions.map((option) => (
                  <button
                    key={option.key}
                    onClick={() => setSelectedOption(option.key)}
                    disabled={transforming}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all disabled:opacity-50 ${
                      selectedOption === option.key
                        ? 'text-black'
                        : 'bg-[#1A1A1A] text-gray-300 hover:bg-[#252525] border border-[#2E2E2E]'
                    }`}
                    style={
                      selectedOption === option.key
                        ? { backgroundColor: config.brand_color }
                        : {}
                    }
                    title={option.description}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}

            {/* Hint when user can try a new style */}
            {canTransformNewStyle && (
              <p className="text-center text-sm text-gray-400">
                New style selected! Click &quot;Try This Style&quot; to transform.
              </p>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 justify-center">
              {/* Transform button - show when no comparison yet, OR when user selected a new style */}
              {(!showComparison || canTransformNewStyle) && (
                <Button
                  onClick={handleTransform}
                  disabled={transforming || !selectedOption}
                  style={{ backgroundColor: config.brand_color }}
                  className="text-black font-medium"
                >
                  {transforming ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Transforming...
                    </>
                  ) : canTransformNewStyle ? (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Try This Style
                    </>
                  ) : isHairWidget ? (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Show Me
                    </>
                  ) : (
                    config.cta_text
                  )}
                </Button>
              )}

              {showComparison && (
                <>
                  <Button
                    onClick={handleDownload}
                    style={{ backgroundColor: config.brand_color }}
                    className="text-black font-medium"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>

                  {/* Try Another Style button */}
                  <Button
                    variant="outline"
                    onClick={handleTryAnotherStyle}
                    className="border-[#2E2E2E] text-white hover:bg-[#1A1A1A]"
                  >
                    <Sparkles className="mr-2 h-4 w-4" />
                    Try Different Style
                  </Button>
                </>
              )}

              <Button
                variant="outline"
                onClick={handleReset}
                className="border-[#2E2E2E] text-white hover:bg-[#1A1A1A]"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                New Photo
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
