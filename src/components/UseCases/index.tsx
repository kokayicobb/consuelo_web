"use client";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";

export default function UseCases() {
  const [activeTab, setActiveTab] = useState("ecommerce");

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
          {/* E-commerce Use Case 1 */}
          <UseCaseItem
            href="/platform"
            imageSrc="/StablityFlowers2.png"
            altText="Marketing campaign orchestration"
            title="Create Klaviyo flows using natural language"
            description="Marketing | Revenue Lift"
            
          />

          {/* E-commerce Use Case 2 */}
          <UseCaseItem
            href="/platform"
            imageSrc="/StablityMountains1.png"
            altText="Customer acquisition optimization"
            title="Customer acquisition optimization"
            description="Growth | Customer Expansion"
          />
          
          {/* E-commerce Use Case 3 */}
          <UseCaseItem
            href="/use-cases/customer-lifetime-value-prediction"
            imageSrc="/StablitySky1.png"
            altText="Automatic product tagging for search"
            title="Automatic product tagging for search"
            description="Analytics | Strategic Planning"
          />

          {/* E-commerce Use Case 4 */}
          <UseCaseItem
            href="/platform"
            imageSrc="/StablityWater1.png"
            altText="Inventory management dashboard"
            title="CLV-Based product bundling"
            description="Retail | Brand Success"
          />

          {/* E-commerce Use Case 5 */}
          <UseCaseItem
            href="/platform"
            imageSrc="/StablityDesert1.png"
            altText="Pricing optimization dashboard"
            title="Real time pricing optimization"
            description="Strategy | Margin Improvement"
          />

          {/* E-commerce Use Case 6 */}
          <UseCaseItem
            href="/platform"
            imageSrc="/StablityPicasso1.png"
            altText="Unified performance dashboard"
            title="Single performance dashboards"
            description="Operations | Executive Insights"
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* Health/Fitness Use Case 1 */}
          <UseCaseItem
            href="/platform"
            imageSrc="/StablityFlowers2.png"
            altText="Intro journey optimization"
            title="Intro journey optimization & ranking"
            description="Acquisition | New Member Conversion"
          />

          {/* Health/Fitness Use Case 2 */}
          <UseCaseItem
            href="/platform"
            imageSrc="/StablityMountains1.png"
            altText="Member churn prediction"
            title="Early churn pattern detection"
            description="Retention | Membership Longevity"
          />
          
          {/* Health/Fitness Use Case 3 */}
          <UseCaseItem
            href="/platform"
            imageSrc="/StablitySky1.png"
            altText="Instructor performance analytics"
            title="Instructor performance analytics"
            description="Management | Team Development"
          />

          {/* Health/Fitness Use Case 4 */}
          <UseCaseItem
            href="/platform"
            imageSrc="/StablityWater1.png"
            altText="AI sales outreach"
            title="AI-assisted sales outreach"
            description="Sales | Membership Growth"
          />

          {/* Health/Fitness Use Case 5 */}
          <UseCaseItem
            href="/platform"
            imageSrc="/StablityDesert1.png"
            altText="Mindbody integration"
            title="Enhanced Mindbody integration"
            description="Technology | Operational Efficiency"
          />

          {/* Health/Fitness Use Case 6 */}
          <UseCaseItem
             href="/platform"
            imageSrc="/StablityPicasso1.png"
            altText="Class attendance prediction"
            title="Class attendance prediction"
            description="Planning | Resource Optimization"
          />
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