"use client";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import { urlFor } from "@/sanity/lib/image";

interface UseCase {
  _id: string;
  title: string;
  description: string;
  category: "insurance" | "b2b";
  slug: { current: string };
  loomVideoUrl: string;
  altText: string;
  order: number;
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

  const getLoomThumbnailUrl = (loomUrl: string) => {
    const match = loomUrl.match(/loom\.com\/share\/([a-zA-Z0-9]+)/);
    if (match) {
      // Use Loom's embed thumbnail API
      return `https://cdn.loom.com/sessions/thumbnails/${match[1]}-with-play.gif`;
    }
    return "/placeholder-video.jpg"; // fallback to a local placeholder
  };

  return (
    <div className="mx-auto max-w-7xl px-8 py-64">
      <div className="mb-12 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Use Cases</h2>
        <Link href="/platform" className="text-sm hover:underline">
          Learn More
        </Link>
      </div>

      <div className="mb-8 flex justify-center">
        <div className="inline-flex rounded-lg border p-1">
          <button
            onClick={() => setActiveTab("insurance")}
            className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium ${
              activeTab === "insurance"
                ? "bg-primary text-primary-foreground"
                : "bg-transparent hover:bg-muted"
            }`}
          >
            <span>Insurance</span>
          </button>
          <button
            onClick={() => setActiveTab("b2b")}
            className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium ${
              activeTab === "b2b"
                ? "bg-primary text-primary-foreground"
                : "bg-transparent hover:bg-muted"
            }`}
          >
            <span>B2B</span>
          </button>
        </div>
      </div>

      {activeTab === "insurance" ? (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {insuranceUseCases.map((useCase) => (
            <UseCaseItem
              key={useCase._id}
              href={`/${useCase.slug.current}`}
              imageSrc={getLoomThumbnailUrl(useCase.loomVideoUrl)}
              altText={useCase.altText}
              title={useCase.title}
              description={useCase.description}
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {b2bUseCases.map((useCase) => (
            <UseCaseItem
              key={useCase._id}
              href={`/${useCase.slug.current}`}
              imageSrc={getLoomThumbnailUrl(useCase.loomVideoUrl)}
              altText={useCase.altText}
              title={useCase.title}
              description={useCase.description}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function UseCaseItem({ href, imageSrc, altText, title, description, }) {
  return (
    <div className="flex flex-col gap-8 md:flex-row">
      <div className="relative w-full max-w-[200px] shrink-0">
        <Link href={href}>
          <div className="relative aspect-square w-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-lg flex items-center justify-center">
            {/* Video Icon */}
            <svg
              className="w-12 h-12 text-gray-400"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/20 opacity-0 transition-opacity hover:opacity-100">
              <span className="px-2 py-1 text-center font-medium text-white">
                Watch Demo
              </span>
            </div>
          </div>
        </Link>
      </div>
      <div className="flex flex-col justify-center">
        <Link href={href} className="group">
          <h3 className="mb-1 text-lg font-medium group-hover:underline">
            {title}
          </h3>
        </Link>
        <div className="flex items-center text-sm text-gray-600">
          <span>{description}</span>
        </div>
      </div>
    </div>
  );
}