'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Maximize2, Minimize2, RotateCcw } from 'lucide-react';

interface LiveBrowserPlayerProps {
  liveViewUrl: string;
  sessionId?: string;
  onClose?: () => void;
}

export default function LiveBrowserPlayer({ 
  liveViewUrl, 
  sessionId, 
  onClose 
}: LiveBrowserPlayerProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Handle different URL formats from Browserbase
  const getEmbeddableUrl = (url: string) => {
    // If it's already a debugger URL, use it directly
    if (url.includes('debugger') || url.includes('sessions.browserbase.com')) {
      return url;
    }
    
    // If it's a regular session URL, try to convert it
    if (url.includes('browserbase.com/sessions/')) {
      const sessionIdMatch = url.match(/sessions\/([^/?]+)/);
      if (sessionIdMatch) {
        return `${url}/debugger`;
      }
    }
    
    return url;
  };

  const embedUrl = getEmbeddableUrl(liveViewUrl);

  const handleIframeLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const refreshPlayer = () => {
    setIsLoading(true);
    setHasError(false);
    // Force iframe reload
    const iframe = document.getElementById('live-browser-iframe') as HTMLIFrameElement;
    if (iframe) {
      const currentSrc = iframe.src;
      iframe.src = '';
      setTimeout(() => {
        iframe.src = currentSrc;
      }, 100);
    }
  };

  return (
    <Card className={`overflow-hidden transition-all duration-300 ${
      isFullscreen 
        ? 'fixed inset-4 z-50 shadow-2xl' 
        : 'w-full max-w-4xl mx-auto'
    }`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <CardTitle className="text-lg">Live Browser Session</CardTitle>
            </div>
            {sessionId && (
              <Badge variant="outline" className="text-xs">
                {sessionId.slice(0, 12)}...
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={refreshPlayer}
              className="p-2"
              title="Refresh player"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={toggleFullscreen}
              className="p-2"
              title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            >
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </Button>
            
            {onClose && (
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
                className="p-2"
                title="Close player"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
        
        <CardDescription className="text-sm">
          Watch the AI scrape in real-time. You can interact with the browser directly!
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="relative">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-sm text-gray-600">Loading browser session...</p>
              </div>
            </div>
          )}
          
          {hasError && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
              <div className="text-center max-w-md p-4">
                <p className="text-sm text-red-600 mb-2">Unable to load live browser view</p>
                <p className="text-xs text-gray-500 mb-3">
                  This might be due to authentication restrictions or the session may have ended.
                </p>
                <div className="flex gap-2 justify-center">
                  <Button onClick={refreshPlayer} size="sm" variant="outline">
                    Try Again
                  </Button>
                  <a 
                    href={liveViewUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <Button size="sm">
                      Open in New Tab
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          )}
          
          <iframe
            id="live-browser-iframe"
            src={embedUrl}
            className={`w-full border-0 ${
              isFullscreen ? 'h-[calc(100vh-8rem)]' : 'h-[600px]'
            }`}
            onLoad={handleIframeLoad}
            onError={handleIframeError}
            allow="camera; microphone; geolocation; clipboard-read; clipboard-write"
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
            title="Live Browser Session"
          />
        </div>
        
        <div className="p-4 bg-gray-50 border-t">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>🔴 Live session active</span>
            <a 
              href={liveViewUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Open in new tab →
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}