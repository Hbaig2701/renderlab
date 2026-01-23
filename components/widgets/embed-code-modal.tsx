'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Copy, ExternalLink, Check } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface EmbedCodeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  widgetId: string;
  appUrl: string;
}

export function EmbedCodeModal({ open, onOpenChange, widgetId, appUrl }: EmbedCodeModalProps) {
  const [copied, setCopied] = useState(false);
  const widgetUrl = `${appUrl}/w/${widgetId}`;

  const embedCode = `<iframe
  src="${widgetUrl}"
  width="100%"
  height="600"
  frameborder="0"
  allow="camera">
</iframe>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Embed Code</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Add this widget to any website by pasting this code:
          </p>

          {/* Code snippet */}
          <div className="relative">
            <pre className="p-4 rounded-lg bg-secondary text-sm font-mono overflow-x-auto whitespace-pre-wrap break-all">
              {embedCode}
            </pre>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleCopy} variant="default">
              {copied ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Code
                </>
              )}
            </Button>
          </div>

          {/* Divider */}
          <div className="border-t border-border" />

          {/* Preview section */}
          <div className="space-y-3">
            <p className="text-sm font-medium">Preview:</p>
            <div className="rounded-lg border border-border overflow-hidden bg-background h-[200px]">
              <iframe
                src={widgetUrl}
                className="w-full h-full"
                title="Widget Preview"
              />
            </div>
            <div className="flex justify-end">
              <Button variant="outline" size="sm" asChild>
                <a href={widgetUrl} target="_blank" rel="noopener noreferrer">
                  Open Full Preview
                  <ExternalLink className="ml-2 h-3 w-3" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Static display version for widget detail page
interface EmbedCodeDisplayProps {
  widgetId: string;
  appUrl: string;
}

export function EmbedCodeDisplay({ widgetId, appUrl }: EmbedCodeDisplayProps) {
  const [copied, setCopied] = useState(false);
  const widgetUrl = `${appUrl}/w/${widgetId}`;

  const embedCode = `<iframe
  src="${widgetUrl}"
  width="100%"
  height="600"
  frameborder="0"
  allow="camera">
</iframe>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle>Embed Code</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Add this widget to any website by pasting this code:
        </p>
        <div className="relative">
          <pre className="p-4 rounded-lg bg-secondary text-sm font-mono overflow-x-auto whitespace-pre-wrap break-all">
            {embedCode}
          </pre>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleCopy} variant="default">
            {copied ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Copied
              </>
            ) : (
              <>
                <Copy className="mr-2 h-4 w-4" />
                Copy Code
              </>
            )}
          </Button>
          <Button variant="outline" asChild>
            <a href={widgetUrl} target="_blank" rel="noopener noreferrer">
              Open Preview
              <ExternalLink className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
