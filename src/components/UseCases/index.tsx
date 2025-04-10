"use client";
import Image from "next/image";
import Link from "next/link";
import React from "react";

export default function UseCases() {
  return (
    <div className="mx-auto max-w-7xl px-8 py-64">
      <div className="mb-12 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Use Cases</h2>
        <Link href="/use-cases" className="text-sm hover:underline">
          View all
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Use Case 1 */}
        <UseCaseItem
          href="/use-cases/ai-driven-campaign-orchestration"
          imageSrc="/squareBento.jpeg"
          altText="Marketing campaign orchestration"
          title="Create Klaviyo flows using natural language"
          description="Marketing | Revenue Lift"
        />

 {/* Use Case 2 */}
 <UseCaseItem
          href="/use-cases/tiktok-to-sales-pipeline"
          imageSrc="/squareBento.jpeg"
          altText="Inventory aware marketing automation"
          title="Inventory aware marketing automation"
          description="Growth | ROI Enhancement"
        />
         <UseCaseItem
          href="/use-cases/customer-lifetime-value-prediction"
          imageSrc="/squareBento.jpeg"
          altText="Automatic product tagging for search"
          title="Automatic product tagging for search"
          description="Analytics | Strategic Planning"
        />

        <UseCaseItem
          href="/use-cases/multi-channel-inventory-optimization"
          imageSrc="/squareBento.jpeg"
          altText="Inventory management dashboard"
          title="CLV-Based product bundling"
          description="Retail | Brand Success"
        />

       

     
        
        {/* Use Case 4 */}
        <UseCaseItem
          href="/use-cases/real-time-pricing-optimization"
           imageSrc="/squareBento.jpeg"
          altText="Pricing optimization dashboard"
          title="Real time pricing optimization"
          description="Strategy | Margin Improvement"
        />

        {/* Use Case 5 */}
       

        {/* Use Case 6 */}
        <UseCaseItem
          href="/use-cases/unified-performance-dashboards"
          imageSrc="/squareBento.jpeg"
          altText="Unified performance dashboard"
          title="Single performance dashboards"
          description="Operations | Executive Insights"
        />
      </div>
    </div>
  );
}

function UseCaseItem({ href, imageSrc, altText, title, description }) {
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