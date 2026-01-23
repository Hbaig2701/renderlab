'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Camera, Upload, ArrowLeft, Send, Maximize2, Sparkles, ChevronRight } from 'lucide-react';
import { BeforeAfterSlider } from '@/components/preview/before-after-slider';

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
  business_phone: string | null;
  business_email: string | null;
  business_website: string | null;
  business_tagline: string | null;
}

interface ConsultationListItem {
  id: string;
  client_name: string | null;
  created_at: string;
  style_label: string | null;
  sent_at: string | null;
}

type Screen = 'launch' | 'new' | 'style' | 'loading' | 'results' | 'send' | 'sent' | 'fullscreen';

const HAIR_CATEGORIES = {
  color: { label: 'Color', icon: '🎨' },
  cut: { label: 'Cut', icon: '✂️' },
  texture: { label: 'Texture', icon: '💫' },
};

export default function SalesToolPage() {
  const params = useParams();
  const router = useRouter();
  const widgetId = params.widgetId as string;

  // State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [widget, setWidget] = useState<WidgetConfig | null>(null);
  const [tier, setTier] = useState<string>('starter');
  const [hasFullFeatures, setHasFullFeatures] = useState(false);
  const [consultations, setConsultations] = useState<ConsultationListItem[]>([]);

  // Consultation flow state
  const [screen, setScreen] = useState<Screen>('launch');
  const [clientName, setClientName] = useState('');
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [transformedImage, setTransformedImage] = useState<string | null>(null);
  const [consultationId, setConsultationId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [styleLabel, setStyleLabel] = useState<string | null>(null);
  const [transforming, setTransforming] = useState(false);

  // Send flow state
  const [sendEmail, setSendEmail] = useState('');
  const [includeQuote, setIncludeQuote] = useState(false);
  const [quoteAmount, setQuoteAmount] = useState('');
  const [personalMessage, setPersonalMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sentTo, setSentTo] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const isHairWidget = widget?.template === 'hair';
  const availableCategories = isHairWidget
    ? [...new Set(widget?.options.map(o => o.category).filter((c): c is string => !!c))]
    : [];
  const displayOptions = isHairWidget
    ? widget?.options.filter(o => o.category === selectedCategory) || []
    : widget?.options || [];

  useEffect(() => {
    fetchWidgetData();
  }, [widgetId]);

  const fetchWidgetData = async () => {
    try {
      const res = await fetch(`/api/s/${widgetId}`);
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Widget not found');
        setLoading(false);
        return;
      }
      const data = await res.json();
      setWidget(data.widget);
      setTier(data.tier);
      setHasFullFeatures(data.hasFullFeatures);
      setConsultations(data.consultations || []);
    } catch {
      setError('Failed to load sales tool');
    }
    setLoading(false);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const imageData = e.target?.result as string;
      setOriginalImage(imageData);

      // Create consultation
      try {
        const res = await fetch(`/api/s/${widgetId}/consultations`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            client_name: clientName || null,
            original_image: imageData,
          }),
        });

        if (!res.ok) {
          const data = await res.json();
          setError(data.error || 'Failed to create consultation');
          return;
        }

        const data = await res.json();
        setConsultationId(data.consultation_id);
        setScreen('style');
      } catch {
        setError('Failed to create consultation');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleTransform = async () => {
    if (!consultationId || !selectedOption) return;

    setScreen('loading');
    setTransforming(true);
    setError(null);

    try {
      const res = await fetch(`/api/s/${widgetId}/consultations/${consultationId}/transform`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ style_key: selectedOption }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Transformation failed');
        setScreen('style');
        setTransforming(false);
        return;
      }

      const data = await res.json();
      setTransformedImage(data.transformed_image_url);
      setStyleLabel(data.style_label);
      setScreen('results');
    } catch {
      setError('Transformation failed');
      setScreen('style');
    }
    setTransforming(false);
  };

  const handleSend = async () => {
    if (!consultationId || !sendEmail) return;

    setSending(true);
    setError(null);

    try {
      const res = await fetch(`/api/s/${widgetId}/consultations/${consultationId}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: sendEmail,
          include_quote: includeQuote,
          quote_amount: includeQuote ? quoteAmount : null,
          personal_message: personalMessage || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to send');
        setSending(false);
        return;
      }

      setSentTo(sendEmail);
      setScreen('sent');
    } catch {
      setError('Failed to send preview');
    }
    setSending(false);
  };

  const resetFlow = () => {
    setScreen('launch');
    setClientName('');
    setOriginalImage(null);
    setTransformedImage(null);
    setConsultationId(null);
    setSelectedCategory(null);
    setSelectedOption(null);
    setStyleLabel(null);
    setSendEmail('');
    setIncludeQuote(false);
    setQuoteAmount('');
    setPersonalMessage('');
    setSentTo('');
    setError(null);
    fetchWidgetData();
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A]">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    );
  }

  if (error && !widget) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A] p-4">
        <Card className="p-8 text-center max-w-md bg-[#1A1A1A] border-[#2E2E2E]">
          <p className="text-gray-400">{error}</p>
        </Card>
      </div>
    );
  }

  if (!widget) return null;

  // Fullscreen mode
  if (screen === 'fullscreen' && originalImage && transformedImage) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex flex-col">
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-4xl">
            <BeforeAfterSlider
              beforeImage={originalImage}
              afterImage={transformedImage}
              beforeLabel="Current"
              afterLabel={styleLabel || 'After'}
              brandColor={widget.brand_color}
            />
          </div>
        </div>
        <div className="p-4 flex justify-center">
          <Button
            variant="outline"
            onClick={() => setScreen('results')}
            className="border-white/20 text-white hover:bg-white/10"
          >
            Exit Fullscreen
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] p-4 md:p-8">
      <div className="max-w-lg mx-auto space-y-6">
        {/* Header with Logo */}
        {widget.logo_url && (
          <div className="flex justify-center">
            <img src={widget.logo_url} alt="Logo" className="h-12 object-contain" />
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
            {error}
          </div>
        )}

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
          capture="environment"
          className="hidden"
        />

        {/* LAUNCH SCREEN */}
        {screen === 'launch' && (
          <>
            <h1 className="text-2xl font-bold text-center text-white">
              {widget.cta_text}
            </h1>

            <Button
              onClick={() => setScreen('new')}
              className="w-full py-6 text-lg font-medium text-black"
              style={{ backgroundColor: widget.brand_color }}
            >
              New Consultation
            </Button>

            {/* Recent Consultations (Pro/Agency only) */}
            {hasFullFeatures && consultations.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-400">Recent</h3>
                <div className="space-y-2">
                  {consultations.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => router.push(`/s/${widgetId}/c/${c.id}`)}
                      className="w-full flex items-center justify-between p-4 rounded-lg bg-[#1A1A1A] border border-[#2E2E2E] hover:bg-[#252525] transition-colors"
                    >
                      <div className="text-left">
                        <p className="text-white font-medium">
                          {c.client_name || 'Unnamed consultation'}
                        </p>
                        <p className="text-sm text-gray-400">
                          {formatDate(c.created_at)}
                          {c.style_label && ` · ${c.style_label}`}
                        </p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-500" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* NEW CONSULTATION SCREEN */}
        {screen === 'new' && (
          <>
            <button
              onClick={() => setScreen('launch')}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>

            <h2 className="text-xl font-bold text-center text-white">
              New Consultation
            </h2>

            <div className="space-y-2">
              <Label htmlFor="clientName" className="text-gray-400">
                Client Name (optional)
              </Label>
              <Input
                id="clientName"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="e.g., Johnson Residence"
                className="bg-[#1A1A1A] border-[#2E2E2E] text-white"
              />
            </div>

            <Card className="p-8 border-2 border-dashed bg-[#1A1A1A]" style={{ borderColor: widget.brand_color }}>
              <div className="text-center space-y-4">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mx-auto"
                  style={{ backgroundColor: widget.brand_color + '20' }}
                >
                  <Camera className="h-8 w-8" style={{ color: widget.brand_color }} />
                </div>
                <div>
                  <p className="text-lg font-medium text-white">Capture the current state</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Take a photo or upload from gallery
                  </p>
                </div>
                <div className="flex flex-col gap-3">
                  <Button
                    onClick={() => cameraInputRef.current?.click()}
                    style={{ backgroundColor: widget.brand_color }}
                    className="text-black font-medium"
                  >
                    <Camera className="mr-2 h-4 w-4" />
                    Take Photo
                  </Button>
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                    className="border-[#2E2E2E] text-white hover:bg-[#1A1A1A]"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Upload from Gallery
                  </Button>
                </div>
              </div>
            </Card>
          </>
        )}

        {/* STYLE SELECTION SCREEN */}
        {screen === 'style' && originalImage && (
          <>
            <div className="flex items-center justify-between">
              <button
                onClick={() => setScreen('new')}
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
              {clientName && <span className="text-gray-400 text-sm">{clientName}</span>}
            </div>

            <div className="rounded-lg overflow-hidden border border-[#2E2E2E]">
              <img src={originalImage} alt="Captured" className="w-full h-auto" />
            </div>

            <p className="text-center text-white font-medium">
              What would you like to show them?
            </p>

            {/* Category selector for hair widgets */}
            {isHairWidget && availableCategories.length > 0 && (
              <div className="flex justify-center gap-3">
                {availableCategories.map((category) => {
                  const catInfo = HAIR_CATEGORIES[category as keyof typeof HAIR_CATEGORIES];
                  if (!catInfo) return null;
                  return (
                    <button
                      key={category}
                      onClick={() => {
                        setSelectedCategory(category);
                        setSelectedOption(null);
                      }}
                      className={`px-6 py-4 rounded-xl text-center transition-all ${
                        selectedCategory === category
                          ? 'text-black'
                          : 'bg-[#1A1A1A] text-white hover:bg-[#252525] border border-[#2E2E2E]'
                      }`}
                      style={selectedCategory === category ? { backgroundColor: widget.brand_color } : {}}
                    >
                      <span className="text-2xl block mb-1">{catInfo.icon}</span>
                      <span className="text-sm font-medium">{catInfo.label}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Options */}
            {(isHairWidget ? selectedCategory : true) && displayOptions.length > 0 && (
              <div className="grid grid-cols-2 gap-3">
                {displayOptions.map((option) => (
                  <button
                    key={option.key}
                    onClick={() => setSelectedOption(option.key)}
                    className={`p-4 rounded-lg text-left transition-all ${
                      selectedOption === option.key
                        ? 'text-black'
                        : 'bg-[#1A1A1A] text-white hover:bg-[#252525] border border-[#2E2E2E]'
                    }`}
                    style={selectedOption === option.key ? { backgroundColor: widget.brand_color } : {}}
                  >
                    <p className="font-medium">{option.label}</p>
                    <p className={`text-xs mt-1 ${selectedOption === option.key ? 'text-black/70' : 'text-gray-400'}`}>
                      {option.description}
                    </p>
                  </button>
                ))}
              </div>
            )}

            <Button
              onClick={handleTransform}
              disabled={!selectedOption}
              className="w-full py-6 text-lg font-medium text-black"
              style={{ backgroundColor: widget.brand_color }}
            >
              <Sparkles className="mr-2 h-5 w-5" />
              Generate Preview
            </Button>
          </>
        )}

        {/* LOADING SCREEN */}
        {screen === 'loading' && (
          <div className="flex flex-col items-center justify-center py-20 space-y-6">
            <Loader2 className="h-12 w-12 animate-spin" style={{ color: widget.brand_color }} />
            <div className="text-center">
              <p className="text-xl text-white font-medium">Creating your preview...</p>
              <p className="text-gray-400 mt-2">This takes about 10 seconds</p>
            </div>
          </div>
        )}

        {/* RESULTS SCREEN */}
        {screen === 'results' && originalImage && transformedImage && (
          <>
            <div className="flex items-center justify-between">
              <button
                onClick={() => setScreen('style')}
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
              {clientName && <span className="text-gray-400 text-sm">{clientName}</span>}
            </div>

            {/* Side by side comparison */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-400 mb-2 text-center">Current</p>
                <div className="rounded-lg overflow-hidden border border-[#2E2E2E]">
                  <img src={originalImage} alt="Before" className="w-full h-auto" />
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-2 text-center">{styleLabel}</p>
                <div
                  className="rounded-lg overflow-hidden border-2"
                  style={{ borderColor: widget.brand_color }}
                >
                  <img src={transformedImage} alt="After" className="w-full h-auto" />
                </div>
              </div>
            </div>

            {/* Actions */}
            <Button
              onClick={() => setScreen('fullscreen')}
              variant="outline"
              className="w-full border-[#2E2E2E] text-white hover:bg-[#1A1A1A]"
            >
              <Maximize2 className="mr-2 h-4 w-4" />
              Present Fullscreen
            </Button>

            <div className="flex gap-3">
              <Button
                onClick={() => {
                  setTransformedImage(null);
                  setSelectedOption(null);
                  setSelectedCategory(null);
                  setScreen('style');
                }}
                variant="outline"
                className="flex-1 border-[#2E2E2E] text-white hover:bg-[#1A1A1A]"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Try Different Style
              </Button>

              {hasFullFeatures && (
                <Button
                  onClick={() => {
                    setPersonalMessage('Thanks for meeting today! Here\'s the preview we discussed. Let me know if you have any questions.');
                    setScreen('send');
                  }}
                  className="flex-1 text-black font-medium"
                  style={{ backgroundColor: widget.brand_color }}
                >
                  <Send className="mr-2 h-4 w-4" />
                  Send to Client
                </Button>
              )}
            </div>
          </>
        )}

        {/* SEND SCREEN */}
        {screen === 'send' && (
          <>
            <button
              onClick={() => setScreen('results')}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>

            <h2 className="text-xl font-bold text-center text-white">
              Send to Client
            </h2>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-400">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={sendEmail}
                  onChange={(e) => setSendEmail(e.target.value)}
                  placeholder="client@email.com"
                  className="bg-[#1A1A1A] border-[#2E2E2E] text-white"
                  required
                />
              </div>

              <div className="space-y-3">
                <p className="text-sm text-gray-400">Include:</p>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked disabled className="rounded" />
                  <span className="text-white">Before & After images</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked disabled className="rounded" />
                  <span className="text-white">Your contact information</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeQuote}
                    onChange={(e) => setIncludeQuote(e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-white">Estimated quote</span>
                  {includeQuote && (
                    <Input
                      type="number"
                      value={quoteAmount}
                      onChange={(e) => setQuoteAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-32 bg-[#1A1A1A] border-[#2E2E2E] text-white"
                    />
                  )}
                </label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message" className="text-gray-400">Personal message</Label>
                <textarea
                  id="message"
                  value={personalMessage}
                  onChange={(e) => setPersonalMessage(e.target.value)}
                  rows={4}
                  className="w-full rounded-md bg-[#1A1A1A] border border-[#2E2E2E] text-white p-3"
                />
              </div>
            </div>

            <Button
              onClick={handleSend}
              disabled={!sendEmail || sending}
              className="w-full py-6 text-lg font-medium text-black"
              style={{ backgroundColor: widget.brand_color }}
            >
              {sending ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-5 w-5" />
                  Send Preview
                </>
              )}
            </Button>
          </>
        )}

        {/* SENT CONFIRMATION SCREEN */}
        {screen === 'sent' && (
          <div className="flex flex-col items-center justify-center py-12 space-y-6">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{ backgroundColor: widget.brand_color }}
            >
              <svg className="w-10 h-10 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <div className="text-center">
              <h2 className="text-2xl font-bold text-white">Preview Sent!</h2>
              <p className="text-gray-400 mt-2">Sent to: {sentTo}</p>
            </div>

            <div className="flex flex-col gap-3 w-full">
              <Button
                onClick={resetFlow}
                className="w-full text-black font-medium"
                style={{ backgroundColor: widget.brand_color }}
              >
                Start New Consultation
              </Button>
              <Button
                onClick={() => {
                  resetFlow();
                  setScreen('launch');
                }}
                variant="outline"
                className="w-full border-[#2E2E2E] text-white hover:bg-[#1A1A1A]"
              >
                Back to Home
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
