'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2, ArrowLeft, Send, Maximize2 } from 'lucide-react';
import { BeforeAfterSlider } from '@/components/preview/before-after-slider';
import type { Consultation } from '@/types';

export default function ConsultationViewPage() {
  const params = useParams();
  const router = useRouter();
  const visualizerId = params.visualizerId as string;
  const consultationId = params.consultationId as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [consultation, setConsultation] = useState<Consultation | null>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [brandColor, setBrandColor] = useState('#F59E0B');

  useEffect(() => {
    fetchConsultation();
  }, [visualizerId, consultationId]);

  const fetchConsultation = async () => {
    try {
      // Fetch consultation
      const res = await fetch(`/api/s/${visualizerId}/consultations/${consultationId}`);
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Consultation not found');
        setLoading(false);
        return;
      }
      const data = await res.json();
      setConsultation(data.consultation);

      // Fetch visualizer for brand color
      const visualizerRes = await fetch(`/api/s/${visualizerId}`);
      if (visualizerRes.ok) {
        const visualizerData = await visualizerRes.json();
        setBrandColor(visualizerData.widget.brand_color);
      }
    } catch {
      setError('Failed to load consultation');
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A]">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    );
  }

  if (error || !consultation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A] p-4">
        <Card className="p-8 text-center max-w-md bg-[#1A1A1A] border-[#2E2E2E]">
          <p className="text-gray-400">{error || 'Consultation not found'}</p>
          <Button
            onClick={() => router.push(`/s/${visualizerId}`)}
            className="mt-4"
            variant="outline"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Sales Tool
          </Button>
        </Card>
      </div>
    );
  }

  // Fullscreen mode
  if (fullscreen && consultation.original_image_url && consultation.transformed_image_url) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex flex-col">
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-4xl">
            <BeforeAfterSlider
              beforeImage={consultation.original_image_url}
              afterImage={consultation.transformed_image_url}
              beforeLabel="Current"
              afterLabel={consultation.style_label || 'After'}
              brandColor={brandColor}
            />
          </div>
        </div>
        <div className="p-4 flex justify-center">
          <Button
            variant="outline"
            onClick={() => setFullscreen(false)}
            className="border-white/20 text-white hover:bg-white/10"
          >
            Exit Fullscreen
          </Button>
        </div>
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] p-4 md:p-8">
      <div className="max-w-lg mx-auto space-y-6">
        <button
          onClick={() => router.push(`/s/${visualizerId}`)}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <div className="space-y-1">
          <h1 className="text-xl font-bold text-white">
            {consultation.client_name || 'Consultation'}
          </h1>
          <p className="text-gray-400 text-sm">
            {formatDate(consultation.created_at)}
          </p>
        </div>

        {/* Images */}
        {consultation.transformed_image_url ? (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-400 mb-2 text-center">Current</p>
                <div className="rounded-lg overflow-hidden border border-[#2E2E2E]">
                  <img
                    src={consultation.original_image_url}
                    alt="Before"
                    className="w-full h-auto"
                  />
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-2 text-center">
                  {consultation.style_label}
                </p>
                <div
                  className="rounded-lg overflow-hidden border-2"
                  style={{ borderColor: brandColor }}
                >
                  <img
                    src={consultation.transformed_image_url}
                    alt="After"
                    className="w-full h-auto"
                  />
                </div>
              </div>
            </div>

            <Button
              onClick={() => setFullscreen(true)}
              variant="outline"
              className="w-full border-[#2E2E2E] text-white hover:bg-[#1A1A1A]"
            >
              <Maximize2 className="mr-2 h-4 w-4" />
              Present Fullscreen
            </Button>
          </>
        ) : (
          <div className="rounded-lg overflow-hidden border border-[#2E2E2E]">
            <img
              src={consultation.original_image_url}
              alt="Original"
              className="w-full h-auto"
            />
          </div>
        )}

        {/* Status */}
        <div className="space-y-3">
          {consultation.sent_at ? (
            <div className="flex items-center gap-2 text-green-400">
              <Send className="h-4 w-4" />
              <span className="text-sm">
                Sent to {consultation.client_email} on {formatDate(consultation.sent_at)}
              </span>
            </div>
          ) : (
            <div className="text-gray-400 text-sm">Not yet sent to client</div>
          )}

          {consultation.quote_amount && (
            <div className="p-4 rounded-lg bg-[#1A1A1A] border border-[#2E2E2E]">
              <p className="text-gray-400 text-sm">Estimated Quote</p>
              <p className="text-2xl font-bold text-white">
                ${consultation.quote_amount.toLocaleString()}
              </p>
            </div>
          )}

          {consultation.preview_id && (
            <div className="p-4 rounded-lg bg-[#1A1A1A] border border-[#2E2E2E]">
              <p className="text-gray-400 text-sm mb-1">Preview Link</p>
              <p className="text-white text-sm break-all">
                {process.env.NEXT_PUBLIC_CLIENT_DOMAIN || 'renderlab.com'}/p/{consultation.preview_id}
              </p>
              <p className="text-gray-500 text-xs mt-2">
                {consultation.preview_views} view{consultation.preview_views !== 1 ? 's' : ''}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
