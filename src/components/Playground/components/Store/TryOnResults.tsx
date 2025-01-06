"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

interface TryOnResultProps {
  resultUrl: string | null;
  onClear: () => void;
}

export function TryOnResult({ resultUrl, onClear }: TryOnResultProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Log the resultUrl to the console when it changes
  useEffect(() => {
    if (resultUrl) {
      console.log("TryOnResult received URL:", resultUrl);
    } else {
      console.log("No result URL provided");
    }
  }, [resultUrl]);

  if (!resultUrl) return null;

  return (
    <div className="mb-8 mt-16">
      <h2 className="mb-4 text-2xl font-bold">Virtual Try-On Result</h2>
      <div className="relative mx-auto aspect-square w-full max-w-2xl overflow-hidden rounded-lg border bg-gray-50">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100/80 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-2">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
              <p className="text-sm text-gray-600">Loading result...</p>
            </div>
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-red-50">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
        <img
          src={resultUrl}
          alt="Virtual Try-On Result"
          className="h-full w-full object-contain"
          onLoad={() => {
            console.log("Try-on image loaded successfully:", resultUrl);
            setIsLoading(false);
          }}
          onError={(e) => {
            console.error("Error loading try-on image:", e);
            setError("Failed to load result image");
            setIsLoading(false);
          }}
        />
        <Button
          variant="outline"
          className="absolute right-4 top-4 z-10 bg-white/80 backdrop-blur-sm hover:bg-white"
          onClick={onClear}
        >
          Clear Try-On
        </Button>
      </div>
    </div>
  );
}
