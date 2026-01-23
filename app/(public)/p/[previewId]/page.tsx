'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { BeforeAfterSlider } from '@/components/preview/before-after-slider';

interface PreviewData {
  before_url: string;
  after_url: string;
  style_label: string;
  quote_amount: number | null;
  business: {
    name: string;
    logo_url: string | null;
    brand_color: string;
    phone: string | null;
    email: string | null;
    website: string | null;
    tagline: string | null;
  };
}

export default function ShareablePreviewPage() {
  const params = useParams();
  const previewId = params.previewId as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<PreviewData | null>(null);

  useEffect(() => {
    fetchPreview();
  }, [previewId]);

  const fetchPreview = async () => {
    try {
      const res = await fetch(`/api/p/${previewId}`);
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Preview not found');
        setLoading(false);
        return;
      }
      const data = await res.json();
      setPreview(data);
    } catch {
      setError('Failed to load preview');
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error || !preview) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-4">
        <Card className="p-8 text-center max-w-md">
          <p className="text-gray-600">{error || 'Preview not found'}</p>
          <p className="text-gray-400 text-sm mt-2">
            This preview may have expired or been removed.
          </p>
        </Card>
      </div>
    );
  }

  const { business } = preview;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="text-center">
          {business.logo_url ? (
            <img
              src={business.logo_url}
              alt={business.name}
              className="h-16 object-contain mx-auto"
            />
          ) : (
            <h1 className="text-2xl font-bold text-gray-900">{business.name}</h1>
          )}
        </div>

        {/* Title */}
        <h2 className="text-xl font-medium text-center text-gray-800">
          Your Transformation Preview
        </h2>

        {/* Before/After Slider */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <BeforeAfterSlider
            beforeImage={preview.before_url}
            afterImage={preview.after_url}
            beforeLabel="Current"
            afterLabel={preview.style_label}
            brandColor={business.brand_color}
          />
        </div>

        {/* Quote */}
        {preview.quote_amount && (
          <Card className="p-6 bg-white">
            <p className="text-gray-500 text-sm">Estimated Quote</p>
            <p className="text-3xl font-bold text-gray-900">
              ${preview.quote_amount.toLocaleString()}
            </p>
          </Card>
        )}

        {/* CTA */}
        <div className="bg-white rounded-xl shadow-lg p-6 space-y-4">
          <h3 className="text-lg font-semibold text-center text-gray-900">
            Ready to get started?
          </h3>

          <div className="space-y-3">
            {business.phone && (
              <a
                href={`tel:${business.phone}`}
                className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <span className="text-xl">📞</span>
                <span className="text-gray-800 font-medium">Call: {business.phone}</span>
              </a>
            )}

            {business.email && (
              <a
                href={`mailto:${business.email}`}
                className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <span className="text-xl">📧</span>
                <span className="text-gray-800 font-medium">Email: {business.email}</span>
              </a>
            )}

            {business.website && (
              <a
                href={business.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <span className="text-xl">🌐</span>
                <span className="text-gray-800 font-medium">
                  {business.website.replace(/^https?:\/\//, '')}
                </span>
              </a>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center space-y-1 py-4">
          <p className="font-semibold text-gray-900">{business.name}</p>
          {business.tagline && (
            <p className="text-gray-500 text-sm">{business.tagline}</p>
          )}
        </div>
      </div>
    </div>
  );
}
