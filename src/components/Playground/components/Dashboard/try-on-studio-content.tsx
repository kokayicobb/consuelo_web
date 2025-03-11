"use client";

import type React from "react";
import { useState } from "react";
import { Upload, X, ImageIcon } from "lucide-react";

export default function TryOnStudioContent() {
  const [modelImage, setModelImage] = useState<string | null>(null);
  const [garmentImage, setGarmentImage] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleModelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setModelImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGarmentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setGarmentImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTryOn = async () => {
    if (!modelImage || !garmentImage) return;

    setIsLoading(true);

    // This is where you would implement the API call to the try-on service
    // For now, we'll just simulate a delay and set the result to the model image
    setTimeout(() => {
      setResultImage(modelImage);
      setIsLoading(false);
    }, 2000);

    // Actual implementation would look something like:
    /*
    try {
      const response = await fetch('/api/try-on', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          modelImage,
          garmentImage,
        }),
      })
      
      const data = await response.json()
      setResultImage(data.resultImage)
    } catch (error) {
      console.error('Error during try-on:', error)
    } finally {
      setIsLoading(false)
    }
    */
  };

  const resetImages = () => {
    setModelImage(null);
    setGarmentImage(null);
    setResultImage(null);
  };

  return (
    <div className="mx-auto max-w-5xl">
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="mb-6 text-lg font-medium">Virtual Try-On Studio</h2>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Model Upload */}
          <div className="rounded-lg border border-gray-200 p-4">
            <h3 className="mb-3 text-sm font-medium">1. Upload Model Image</h3>

            {!modelImage ? (
              <label className="flex h-64 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100">
                <div className="flex flex-col items-center justify-center pb-6 pt-5">
                  <Upload className="mb-2 h-10 w-10 text-gray-400" />
                  <p className="text-sm text-gray-500">
                    Click to upload model image
                  </p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  onChange={handleModelUpload}
                  accept="image/*"
                />
              </label>
            ) : (
              <div className="relative h-64">
                <img
                  src={modelImage || "/placeholder.svg"}
                  alt="Model"
                  className="h-full w-full rounded-lg object-cover"
                />
                <button
                  onClick={() => setModelImage(null)}
                  className="absolute right-2 top-2 rounded-full bg-white p-1 shadow-md"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          {/* Garment Upload */}
          <div className="rounded-lg border border-gray-200 p-4">
            <h3 className="mb-3 text-sm font-medium">
              2. Upload Garment Image
            </h3>

            {!garmentImage ? (
              <label className="flex h-64 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100">
                <div className="flex flex-col items-center justify-center pb-6 pt-5">
                  <ImageIcon className="mb-2 h-10 w-10 text-gray-400" />
                  <p className="text-sm text-gray-500">
                    Click to upload garment image
                  </p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  onChange={handleGarmentUpload}
                  accept="image/*"
                />
              </label>
            ) : (
              <div className="relative h-64">
                <img
                  src={garmentImage || "/placeholder.svg"}
                  alt="Garment"
                  className="h-full w-full rounded-lg object-cover"
                />
                <button
                  onClick={() => setGarmentImage(null)}
                  className="absolute right-2 top-2 rounded-full bg-white p-1 shadow-md"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          {/* Result */}
          <div className="rounded-lg border border-gray-200 p-4">
            <h3 className="mb-3 text-sm font-medium">3. Result</h3>

            <div className="flex h-64 items-center justify-center rounded-lg bg-gray-50">
              {isLoading ? (
                <div className="flex flex-col items-center">
                  <div className="mb-2 h-10 w-10 animate-spin rounded-full border-b-2 border-gray-900"></div>
                  <p className="text-sm text-gray-500">Processing...</p>
                </div>
              ) : resultImage ? (
                <img
                  src={resultImage || "/placeholder.svg"}
                  alt="Result"
                  className="h-full w-full rounded-lg object-cover"
                />
              ) : (
                <p className="text-sm text-gray-500">
                  Try-on result will appear here
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-center gap-4">
          <button
            onClick={handleTryOn}
            disabled={!modelImage || !garmentImage || isLoading}
            className={`rounded-lg px-6 py-2 font-medium ${
              !modelImage || !garmentImage || isLoading
                ? "cursor-not-allowed bg-gray-200 text-gray-500"
                : "bg-yellow-400 text-black hover:bg-yellow-500"
            }`}
          >
            Try On Garment
          </button>

          <button
            onClick={resetImages}
            className="rounded-lg border border-gray-200 bg-white px-6 py-2 font-medium hover:bg-gray-50"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
