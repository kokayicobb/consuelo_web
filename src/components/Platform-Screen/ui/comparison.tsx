'use client'
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Cpu, Sparkles, ShoppingCart, Heart } from "lucide-react"
import Link from "next/link"

// E-commerce vertical data
const ecommerceData = [
  {
    feature: "Data Integration",
    traditional: "Basic integrations requiring manual setup",
    muse: "Deep native integrations with Shopify, Klaviyo, and social selling channels",
    highlight: true,
  },
  {
    feature: "Inventory Intelligence",
    traditional: "Basic inventory reporting",
    muse: "Predictive stock recommendations and seasonal trend analysis",
    highlight: true,
  },
  {
    feature: "Customer Journey",
    traditional: "Basic tracking of customer interactions",
    muse: "Cross-channel attribution and personalized engagement recommendations",
    highlight: true,
  },
  {
    feature: "Marketing Campaigns",
    traditional: "Template-based campaigns",
    muse: "AI-assisted email campaign creation through Klaviyo integration",
    highlight: true,
  },
  {
    feature: "Data Analysis",
    traditional: "Standard reports and dashboards",
    muse: "Natural language data queries and automated insight generation",
    highlight: true,
  },
  {
    feature: "Search Capability",
    traditional: "Basic keyword search",
    muse: "Natural language search across all CRM data with contextual understanding",
    highlight: true,
  },
  {
    feature: "Content Generation",
    traditional: "Templates and manual creation",
    muse: "AI-generated content aligned with brand voice and engagement patterns",
    highlight: true,
  },
]

// Health/Fitness vertical data
const fitnessData = [
  {
    feature: "Member Management",
    traditional: "Basic member profiles and history",
    muse: "Attendance pattern analysis with personalized engagement strategies",
    highlight: true,
  },
  {
    feature: "Schedule Optimization",
    traditional: "Manual scheduling tools",
    muse: "Class popularity prediction and instructor performance analysis",
    highlight: true,
  },
  {
    feature: "Retention Tools",
    traditional: "Basic retention reporting",
    muse: "Churn prediction model specific to fitness industry patterns",
    highlight: true,
  },
  {
    feature: "Community Building",
    traditional: "Standard communication tools",
    muse: "Member community engagement recommendations and event suggestions",
    highlight: true,
  },
  {
    feature: "Mindbody Integration",
    traditional: "Basic or limited integration",
    muse: "Deep native integration with specialized fitness metrics",
    highlight: true,
  },
  {
    feature: "Reporting",
    traditional: "Standard reporting templates",
    muse: "AI-powered insights on class performance and member engagement",
    highlight: true,
  },
  {
    feature: "Client Communication",
    traditional: "Template messages",
    muse: "Personalized communication based on attendance and preferences",
    highlight: true,
  },
]

export default function MuseCRMComparator() {
  const [activeTab, setActiveTab] = useState("ecommerce")
  const currentData = activeTab === "ecommerce" ? ecommerceData : fitnessData

  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-5xl px-6">
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
              <ShoppingCart className="size-4" />
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
              <Heart className="size-4" />
              <span>Health & Fitness</span>
            </button>
          </div>
        </div>

        <div className="w-full overflow-auto lg:overflow-visible">
          <table className="w-full border-separate border-spacing-x-3 dark:[--color-muted:var(--color-zinc-900)]">
            <thead className="bg-background sticky top-0">
              <tr className="*:py-4 *:text-left *:font-medium text-lg">
                <th className="lg:w-2/5"></th>
                <th className="bg-muted rounded-t-(--radius) space-y-3 px-4">
                  <span className="block font-bold text-xl">Muse AI-Powered CRM</span>
                  <Button asChild size="sm">
                    <Link href="#">Get Started</Link>
                  </Button>
                </th>
                <th className="space-y-3">
                  <span className="block text-xl">Traditional CRM</span>
                  <Button asChild variant="outline" size="sm">
                    <Link href="#">Learn More</Link>
                  </Button>
                </th>
              </tr>
            </thead>
            <tbody className="text-base">
              <tr className="*:py-3">
                <td className="flex items-center gap-2 font-medium">
                  <Cpu className="size-5" />
                  <span className="text-lg">{activeTab === "ecommerce" ? "E-commerce Features" : "Health & Fitness Features"}</span>
                </td>
                <td className="bg-muted border-none px-4"></td>
                <td></td>
              </tr>
              {currentData.map((row, index) => (
                <tr key={index} className="*:border-b *:py-3">
                  <td className="text-muted-foreground font-medium text-lg">{row.feature}</td>
                  <td className="bg-muted border-none px-4">
                    <div className="-mb-3 border-b py-3 font-medium">
                      {row.highlight ? (
                        <div className="flex items-start gap-2">
                          <div className="mt-1 flex-shrink-0">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                              className="size-5 text-primary"
                            >
                              <path
                                fillRule="evenodd"
                                d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                          <div className="text-base">{row.muse}</div>
                        </div>
                      ) : (
                        row.muse
                      )}
                    </div>
                  </td>
                  <td className="text-base">
                    {row.traditional}
                  </td>
                </tr>
              ))}
              <tr className="*:py-3">
                <td className="flex items-center gap-2 font-medium pt-6">
                  <Sparkles className="size-5" />
                  <span className="text-lg">AI Capabilities</span>
                </td>
                <td className="bg-muted border-none px-4"></td>
                <td></td>
              </tr>
              <tr className="*:border-b *:py-3">
                <td className="text-muted-foreground font-medium text-lg">Predictive Analytics</td>
                <td className="bg-muted border-none px-4">
                  <div className="-mb-3 border-b py-3 font-medium">
                    <div className="flex items-start gap-2">
                      <div className="mt-1 flex-shrink-0">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="size-5 text-primary"
                        >
                          <path
                            fillRule="evenodd"
                            d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div className="text-base">Industry-specific prediction models with high accuracy</div>
                    </div>
                  </div>
                </td>
                <td className="text-base">
                  Basic forecasting
                </td>
              </tr>
              <tr className="*:border-b *:py-3">
                <td className="text-muted-foreground font-medium text-lg">Natural Search Interface</td>
                <td className="bg-muted border-none px-4">
                  <div className="-mb-3 border-b py-3 font-medium">
                    <div className="flex items-start gap-2">
                      <div className="mt-1 flex-shrink-0">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="size-5 text-primary"
                        >
                          <path
                            fillRule="evenodd"
                            d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div className="text-base">Full natural language search and query capabilities with industry-specific terminology</div>
                    </div>
                  </div>
                </td>
                <td className="text-base">
                  Limited or none
                </td>
              </tr>
              <tr className="*:border-b *:py-3">
                <td className="text-muted-foreground font-medium text-lg">Guided Action Framework</td>
                <td className="bg-muted border-none px-4">
                  <div className="-mb-3 border-b py-3 font-medium">
                    <div className="flex items-start gap-2">
                      <div className="mt-1 flex-shrink-0">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="size-5 text-primary"
                        >
                          <path
                            fillRule="evenodd"
                            d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div className="text-base">Pre-filled action forms based on AI recommendations with human approval</div>
                    </div>
                  </div>
                </td>
                <td className="text-base">
                  Not available
                </td>
              </tr>
              <tr className="*:py-6">
                <td></td>
                <td className="bg-muted rounded-b-(--radius) border-none px-4">
                  <Button asChild size="sm" className="mt-4">
                    <Link href="#">Get Started Today</Link>
                  </Button>
                </td>
                <td>
                  <Button asChild variant="outline" size="sm" className="mt-4">
                    <Link href="#">Compare Features</Link>
                  </Button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}