"use client";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import { urlFor } from "@/sanity/lib/image";

interface UseCase {
  _id: string;
  title: string;
  description: string;
  category: "ecommerce" | "fitness";
  image?: any;
  imagePath?: string;
  href: string;
  altText: string;
  order: number;
}

interface UseCasesProps {
  useCases: UseCase[];
}

export default function UseCases({ useCases }: UseCasesProps) {
  const [activeTab, setActiveTab] = useState("ecommerce");
  
  // Filter and sort use cases by category
  const ecommerceUseCases = useCases
    .filter(useCase => useCase.category === "ecommerce")
    .sort((a, b) => a.order - b.order);
    
  const fitnessUseCases = useCases
    .filter(useCase => useCase.category === "fitness")
    .sort((a, b) => a.order - b.order);

  const getImageUrl = (useCase: UseCase) => {
    if (useCase.image) {
      return urlFor(useCase.image).url();
    }
    return useCase.imagePath || "";
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
            onClick={() => setActiveTab("ecommerce")}
            className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium ${
              activeTab === "ecommerce"
                ? "bg-primary text-primary-foreground"
                : "bg-transparent hover:bg-muted"
            }`}
          >
            <span>E-commerce</span>
          </button>
          <button
            onClick={() => setActiveTab("fitness")}
            className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium ${
              activeTab === "fitness"
                ? "bg-primary text-primary-foreground"
                : "bg-transparent hover:bg-muted"
            }`}
          >
            <span>Health & Fitness</span>
          </button>
        </div>
      </div>

      {activeTab === "ecommerce" ? (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {ecommerceUseCases.map((useCase) => (
            <UseCaseItem
              key={useCase._id}
              href={useCase.href}
              imageSrc={getImageUrl(useCase)}
              altText={useCase.altText}
              title={useCase.title}
              description={useCase.description}
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {fitnessUseCases.map((useCase) => (
            <UseCaseItem
              key={useCase._id}
              href={useCase.href}
              imageSrc={getImageUrl(useCase)}
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
          <div className="relative aspect-square w-full">
            <Image
              src={imageSrc}
              alt={altText}
              fill
              className="rounded-lg object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/20 opacity-0 transition-opacity hover:opacity-100">
              <span className="px-2 py-1 text-center font-medium text-white">
                View Case Study
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