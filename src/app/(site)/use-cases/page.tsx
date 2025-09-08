// src/app/(site)/use-cases/page.tsx
import { Metadata } from "next";
import { client } from "@/sanity/lib/client";
import UseCasesGrid from "./UseCasesGrid";

// Type definitions
interface UseCase {
  _id: string
  title: string
  description: string
  slug: { current: string }
  category: string
  loomVideoUrl: string
  altText: string
  order: number
  productName?: string
}

export const metadata: Metadata = {
  title: 'Use Cases - Consuelo',
  description: 'Explore all our customer use cases and success stories.',
};

// GROQ query for fetching use cases
const USECASES_QUERY = `*[_type == "useCase"] | order(order asc) {
  _id,
  title,
  description,
  slug,
  category,
  loomVideoUrl,
  altText,
  order,
  productName
}`;

const options = { next: { revalidate: process.env.NODE_ENV === 'development' ? 0 : 30 } };

export default async function UseCasesPage() {
  // Fetch all use cases from Sanity
  const useCases = await client.fetch<UseCase[]>(USECASES_QUERY, {}, options);

  return (
    <main className="min-h-screen bg-white dark:bg-transparent">
      <div className="mx-auto max-w-7xl px-8 py-24">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold text-gray-900 dark:text-white">
            Use Cases
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Discover how our customers are transforming their businesses with Consuelo
          </p>
        </div>
        
        <UseCasesGrid useCases={useCases} />
      </div>
    </main>
  );
}