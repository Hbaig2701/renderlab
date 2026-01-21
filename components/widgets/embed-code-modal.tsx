'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface EmbedCodeDisplayProps {
  widgetId: string;
  appUrl: string;
}

export function EmbedCodeDisplay({ widgetId, appUrl }: EmbedCodeDisplayProps) {
  const [copiedTab, setCopiedTab] = useState<string | null>(null);

  const iframeCode = `<iframe
  src="${appUrl}/w/${widgetId}"
  width="100%"
  height="600"
  frameborder="0"
  allow="camera">
</iframe>`;

  const directLink = `${appUrl}/w/${widgetId}`;

  const copyToClipboard = (text: string, tab: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTab(tab);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopiedTab(null), 2000);
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle>Embed Code</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="iframe">
          <TabsList className="mb-4">
            <TabsTrigger value="iframe">iFrame Embed</TabsTrigger>
            <TabsTrigger value="link">Direct Link</TabsTrigger>
          </TabsList>

          <TabsContent value="iframe">
            <div className="relative">
              <pre className="p-4 rounded-lg bg-background border border-border overflow-x-auto text-sm">
                <code>{iframeCode}</code>
              </pre>
              <Button
                size="sm"
                variant="secondary"
                className="absolute top-2 right-2"
                onClick={() => copyToClipboard(iframeCode, 'iframe')}
              >
                {copiedTab === 'iframe' ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Paste this code into your client&apos;s website HTML where you want the widget to appear.
            </p>
          </TabsContent>

          <TabsContent value="link">
            <div className="relative">
              <pre className="p-4 rounded-lg bg-background border border-border overflow-x-auto text-sm">
                <code>{directLink}</code>
              </pre>
              <Button
                size="sm"
                variant="secondary"
                className="absolute top-2 right-2"
                onClick={() => copyToClipboard(directLink, 'link')}
              >
                {copiedTab === 'link' ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Share this link directly with your clients for standalone access to the widget.
            </p>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
