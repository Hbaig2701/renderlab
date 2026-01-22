'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, Loader2, Download, RefreshCw, Sparkles, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import {
  enhancementCategories,
  type EnhancementCategory,
} from '@/lib/gemini/enhance';

export default function EnhancePage() {
  const [selectedCategory, setSelectedCategory] = useState<EnhancementCategory | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [enhancedImage, setEnhancedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentCategory = selectedCategory ? enhancementCategories[selectedCategory] : null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Image must be less than 10MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setOriginalImage(e.target?.result as string);
        setEnhancedImage(null);
        setShowResult(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEnhance = async () => {
    if (!originalImage || !selectedCategory) return;

    // Check if option is required but not selected
    if (currentCategory?.hasOptions && !selectedOption) {
      toast.error('Please select a style option');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/enhance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: originalImage,
          category: selectedCategory,
          option: selectedOption,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || 'Enhancement failed');
        setLoading(false);
        return;
      }

      const data = await res.json();
      setEnhancedImage(data.enhancedImage);
      setShowResult(true);
      toast.success('Enhancement complete!');
    } catch {
      toast.error('Enhancement failed. Please try again.');
    }
    setLoading(false);
  };

  const handleBack = () => {
    setSelectedCategory(null);
    setSelectedOption(null);
    setOriginalImage(null);
    setEnhancedImage(null);
    setShowResult(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleEnhanceAnother = () => {
    setOriginalImage(null);
    setEnhancedImage(null);
    setShowResult(false);
    setSelectedOption(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDownload = (imageUrl: string, type: 'original' | 'enhanced') => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `${type}-${selectedCategory}-${Date.now()}.png`;
    link.click();
  };

  // Category Selection View
  if (!selectedCategory) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Enhancement Tools</h1>
          <p className="text-muted-foreground mt-1">
            Transform photos into professional-quality images for your clients
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {(Object.entries(enhancementCategories) as [EnhancementCategory, typeof enhancementCategories[EnhancementCategory]][]).map(
            ([key, category]) => (
              <Card
                key={key}
                onClick={() => setSelectedCategory(key)}
                className="bg-card border-border cursor-pointer hover:border-primary transition-colors"
              >
                <CardContent className="p-8 text-center">
                  <span className="text-5xl block mb-4">{category.icon}</span>
                  <h3 className="text-xl font-semibold mb-2">{category.label}</h3>
                  <p className="text-sm text-muted-foreground">
                    {category.description}
                  </p>
                </CardContent>
              </Card>
            )
          )}
        </div>
      </div>
    );
  }

  // Enhancement View
  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={handleBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{currentCategory?.label}</h1>
          <p className="text-muted-foreground text-sm">
            {currentCategory?.description}
          </p>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/*"
        className="hidden"
      />

      {/* Result View */}
      {showResult && enhancedImage ? (
        <Card className="bg-card border-border">
          <CardContent className="p-6 space-y-6">
            <h2 className="text-lg font-semibold text-center">Result</h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-2 text-center">Before</p>
                <div className="rounded-lg overflow-hidden border border-border">
                  <img
                    src={originalImage!}
                    alt="Original"
                    className="w-full h-auto"
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-2"
                  onClick={() => handleDownload(originalImage!, 'original')}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Original
                </Button>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2 text-center">After</p>
                <div className="rounded-lg overflow-hidden border-2 border-primary">
                  <img
                    src={enhancedImage}
                    alt="Enhanced"
                    className="w-full h-auto"
                  />
                </div>
                <Button
                  size="sm"
                  className="w-full mt-2"
                  onClick={() => handleDownload(enhancedImage, 'enhanced')}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Enhanced
                </Button>
              </div>
            </div>

            <div className="flex justify-center">
              <Button variant="outline" onClick={handleEnhanceAnother}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Enhance Another
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-card border-border">
          <CardContent className="p-6 space-y-6">
            {/* Upload Area */}
            {!originalImage ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-border rounded-lg p-12 text-center cursor-pointer hover:border-primary transition-colors"
              >
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Upload className="h-8 w-8 text-primary" />
                </div>
                <p className="text-lg font-medium">Drop image here</p>
                <p className="text-sm text-muted-foreground mt-1">or</p>
                <Button variant="outline" className="mt-3">
                  Browse files
                </Button>
                <p className="text-xs text-muted-foreground mt-4">
                  PNG, JPG up to 10MB
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="max-w-lg mx-auto">
                  <div className="rounded-lg overflow-hidden border border-border">
                    <img
                      src={originalImage}
                      alt="Preview"
                      className="w-full h-auto"
                    />
                  </div>
                </div>

                {/* Style Options (for product and staging) */}
                {currentCategory?.hasOptions && currentCategory.options && (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground text-center">
                      Choose a style:
                    </p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {currentCategory.options.map((option) => (
                        <button
                          key={option.key}
                          onClick={() => setSelectedOption(option.key)}
                          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                            selectedOption === option.key
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 justify-center pt-4">
                  <Button
                    onClick={handleEnhance}
                    disabled={loading || (currentCategory?.hasOptions && !selectedOption)}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Enhancing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        {selectedCategory === 'staging' ? 'Stage Room' : 'Enhance Photo'}
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setOriginalImage(null);
                      setSelectedOption(null);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                      }
                    }}
                  >
                    Choose Different Image
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
