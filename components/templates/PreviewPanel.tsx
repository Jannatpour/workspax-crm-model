import React from 'react';
import { cn } from '@/lib/utils';
import { EmailComponent } from '../types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Laptop, Tablet, Smartphone, Download, FileDown, Share2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { generateTemplateHtml } from '@/utils/templateUtils';

interface PreviewPanelProps {
  editorContent: EmailComponent[];
  previewMode: 'desktop' | 'mobile' | 'tablet';
  previewIframeRef: React.RefObject<HTMLIFrameElement>;
}

export function PreviewPanel({ editorContent, previewMode, previewIframeRef }: PreviewPanelProps) {
  // Handle download button click
  const handleDownload = () => {
    try {
      // Generate HTML from components
      const html = generateTemplateHtml(editorContent);

      // Create a blob with the HTML content
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);

      // Create a temporary link to download the file
      const link = document.createElement('a');
      link.href = url;
      link.download = `email-template-${Date.now()}.html`;
      document.body.appendChild(link);
      link.click();

      // Clean up
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting template:', error);
    }
  };

  return (
    <div className="w-full">
      <Card className="overflow-hidden h-full">
        <CardHeader className="pb-3 flex-row justify-between items-center space-y-0">
          <CardTitle className="text-lg">Email Preview</CardTitle>

          <div className="flex items-center gap-2">
            {/* Device selector */}
            <div className="flex items-center border rounded-md mr-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={previewMode === 'desktop' ? 'secondary' : 'ghost'}
                      size="icon"
                      className="h-9 w-9 rounded-r-none"
                      aria-label="Desktop preview"
                    >
                      <Laptop className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Desktop</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={previewMode === 'tablet' ? 'secondary' : 'ghost'}
                      size="icon"
                      className="h-9 w-9 rounded-l-none rounded-r-none"
                      aria-label="Tablet preview"
                    >
                      <Tablet className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Tablet</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={previewMode === 'mobile' ? 'secondary' : 'ghost'}
                      size="icon"
                      className="h-9 w-9 rounded-l-none"
                      aria-label="Mobile preview"
                    >
                      <Smartphone className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Mobile</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {/* Actions */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9"
                    onClick={handleDownload}
                  >
                    <FileDown className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Download HTML</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" className="h-9 w-9">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Share Preview</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div
            className={cn(
              'border-t flex items-center justify-center bg-slate-50 p-4 h-[700px]',
              previewMode === 'desktop' ? 'px-4' : previewMode === 'tablet' ? 'px-10' : 'px-16'
            )}
          >
            <div
              className={cn(
                'border shadow-sm bg-white h-full overflow-auto transition-all',
                previewMode === 'desktop'
                  ? 'w-full'
                  : previewMode === 'tablet'
                  ? 'w-[768px]'
                  : 'w-[375px]'
              )}
            >
              <iframe
                ref={previewIframeRef}
                className="w-full h-full"
                title="Email Preview"
                frameBorder="0"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
