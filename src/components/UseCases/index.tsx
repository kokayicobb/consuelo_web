"use client";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import { urlFor } from "@/sanity/lib/image";
import { useOptimizedLoomVideo } from "@/hooks/use-cached-video";
import { useIntersectionObserver } from "@/hooks/use-intersection-observer";

interface UseCase {
  _id: string;
  title: string;
  description: string;
  category: "insurance" | "b2b";
  slug: { current: string };
  loomVideoUrl: string;
  altText: string;
  order: number;
  productName?: "Zara" | "Mercury";
}

interface UseCasesProps {
  useCases: UseCase[];
}

export default function UseCases({ useCases }: UseCasesProps) {
  const [activeTab, setActiveTab] = useState("insurance");
  
  // Filter and sort use cases by category
  const insuranceUseCases = useCases
    .filter(useCase => useCase.category === "insurance")
    .sort((a, b) => a.order - b.order);
    
  const b2bUseCases = useCases
    .filter(useCase => useCase.category === "b2b")
    .sort((a, b) => a.order - b.order);

  // Preload all video URLs immediately when component mounts
  React.useEffect(() => {
    const allUseCases = [...insuranceUseCases, ...b2bUseCases];
    allUseCases.forEach((useCase) => {
      if (useCase.loomVideoUrl) {
        // Preload iframe by creating a hidden link element
        const iframe = document.createElement('iframe');
        iframe.src = `https://www.loom.com/embed/${useCase.loomVideoUrl.match(/loom\.com\/share\/([a-zA-Z0-9]+)/)?.[1]}?hide_owner=true&hide_share=true&hide_title=true&hideEmbedTopBar=true&autoplay=false&hide_controls=true&hide_speed=true&hide_transcript=true&hide_sidebar=true`;
        iframe.style.display = 'none';
        iframe.style.position = 'absolute';
        iframe.style.left = '-9999px';
        iframe.loading = 'lazy';
        document.body.appendChild(iframe);
        
        // Remove after a delay to clean up
        setTimeout(() => {
          if (iframe.parentNode) {
            iframe.parentNode.removeChild(iframe);
          }
        }, 5000);
      }
    });
  }, [insuranceUseCases, b2bUseCases]);

  return (
    <div className="mx-auto max-w-7xl px-8 py-24">
      <div className="mb-12 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Use Cases</h2>
        <Link href="/use-cases" className="text-sm hover:underline">
          View All
        </Link>
      </div>

      <div className="mb-8 flex justify-center">
        <div className="inline-flex rounded-lg border p-1">
          <button
            onClick={() => setActiveTab("insurance")}
            className={`flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium flex-1 min-w-[80px] ${
              activeTab === "insurance"
                ? "bg-primary text-primary-foreground"
                : "bg-transparent hover:bg-muted"
            }`}
          >
            <span>Insurance</span>
          </button>
          <button
            onClick={() => setActiveTab("b2b")}
            className={`flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium flex-1 min-w-[80px] ${
              activeTab === "b2b"
                ? "bg-primary text-primary-foreground"
                : "bg-transparent hover:bg-muted"
            }`}
          >
            <span>B2B</span>
          </button>
        </div>
      </div>

      {/* Tab Content Container */}
      <div className="relative">
        {/* Insurance Use Cases */}
        <div 
          className={`grid grid-cols-1 gap-8 md:grid-cols-2 transition-opacity duration-300 ${
            activeTab === "insurance" ? "opacity-100" : "opacity-0 absolute inset-0 pointer-events-none"
          }`}
        >
          {insuranceUseCases.map((useCase) => (
            <UseCaseItem
              key={useCase._id}
              href={`/${useCase.slug.current}`}
              loomVideoUrl={useCase.loomVideoUrl}
              altText={useCase.altText}
              title={useCase.title}
              description={useCase.description}
              productName={useCase.productName}
            />
          ))}
        </div>

        {/* B2B Use Cases */}
        <div 
          className={`grid grid-cols-1 gap-8 md:grid-cols-2 transition-opacity duration-300 ${
            activeTab === "b2b" ? "opacity-100" : "opacity-0 absolute inset-0 pointer-events-none"
          }`}
        >
          {b2bUseCases.map((useCase) => (
            <UseCaseItem
              key={useCase._id}
              href={`/${useCase.slug.current}`}
              loomVideoUrl={useCase.loomVideoUrl}
              altText={useCase.altText}
              title={useCase.title}
              description={useCase.description}
              productName={useCase.productName}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

interface UseCaseItemProps {
  href: string;
  loomVideoUrl: string;
  altText: string;
  title: string;
  description: string;
  productName?: "Zara" | "Mercury";
}

function UseCaseItem({ href, loomVideoUrl, altText, title, description, productName }: UseCaseItemProps) {
  // Use intersection observer for lazy loading with aggressive preloading (400px margin)
  const { elementRef, shouldLoad } = useIntersectionObserver({
    rootMargin: '400px', // Start loading 400px before the element enters viewport
    threshold: 0.1,
    triggerOnce: true
  });

  // Use cached Loom video hook with lazy loading
  const { thumbnailUrl, embedUrl, isLoading, error } = useOptimizedLoomVideo(loomVideoUrl, 'preview', shouldLoad);
  
  // Extract Loom video ID from URL as fallback
  const getLoomVideoId = (url: string) => {
    if (!url) return null;
    const match = url.match(/loom\.com\/share\/([a-zA-Z0-9]+)/);
    return match ? match[1] : null;
  };
  
  const loomVideoId = getLoomVideoId(loomVideoUrl);
  
  return (
    <div ref={elementRef} className="flex flex-row gap-4 md:flex-row md:gap-8">
      <div className="relative w-[160px] md:w-full md:max-w-[200px] shrink-0">
        {productName && (
          <div className="text-xs md:text-sm font-medium text-accent text-center mb-2">
            {productName}
          </div>
        )}
        <Link href={href}>
          <div className="relative aspect-square w-full overflow-hidden rounded-lg">
            {embedUrl && !isLoading ? (
              // Use iframe with cached Loom embed URL
              <>
                <iframe
                  src={embedUrl}
                  className="absolute inset-0 w-full h-full scale-150"
                  frameBorder="0"
                  allowFullScreen
                  style={{ pointerEvents: 'none' }}
                  loading="lazy"
                />
                <div className="absolute inset-0 z-10" /> {/* Overlay to prevent iframe interaction */}
              </>
            ) : isLoading ? (
              <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600"></div>
              </div>
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center">
                <svg
                  className="w-6 h-6 md:w-12 md:h-12 text-gray-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                </svg>
              </div>
            )}
            <div className="absolute inset-0 z-20 flex items-center justify-center rounded-lg bg-black/20 opacity-0 transition-opacity hover:opacity-100">
              <div className="w-8 h-8 md:w-12 md:h-12 bg-white/90 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 md:w-4 md:h-4 text-black ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                </svg>
              </div>
            </div>
          </div>
        </Link>
      </div>
      <div className="flex flex-col justify-center flex-1">
        <Link href={href} className="group">
          <h3 className="text-base md:text-lg font-medium group-hover:underline">
            {title}
          </h3>
        </Link>
      </div>
    </div>
  );
}