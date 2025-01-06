import React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';

interface TryOnDisplayProps {
  isProcessing: boolean;
  resultUrl: string | null;
  error: string | null;
  attemptCount: number;
  maxAttempts: number;
  onClear: () => void;
}

export function TryOnDisplay({
  isProcessing,
  resultUrl,
  error,
  attemptCount,
  maxAttempts,
  onClear
}: TryOnDisplayProps) {
  // Early return if no processing or result
  if (!isProcessing && !resultUrl && !error) {
    return null;
  }

  return (
    <div className="mt-8 space-y-4 rounded-lg border bg-background p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Virtual Try-On</h3>
        {resultUrl && (
          <Button
            variant="outline"
            size="sm"
            onClick={onClear}
          >
            Clear Result
          </Button>
        )}
      </div>

      {isProcessing && (
        <div className="flex items-center justify-center space-x-2 py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">
            Processing... Attempt {attemptCount} of {maxAttempts}
          </p>
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {resultUrl && (
        <div className="relative aspect-square w-full overflow-hidden rounded-lg">
          {/* Use next/image for optimal performance */}
          <Image
            src={resultUrl}
            alt="Virtual try-on result"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority
          />
        </div>
      )}
    </div>
  );
}