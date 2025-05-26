"use client";

import type React from "react";
import { useState, useEffect } from "react";
import {
  TagIcon,
  UsersIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  AdjustmentsHorizontalIcon,
  SparklesIcon, // Default icon
} from "@heroicons/react/24/outline";

interface QueryItem {
  text: string;
}

interface QueryCategory {
  name: string;
  description?: string;
  queries: QueryItem[];
}

interface ExampleQueriesProps {
  categorizedQueries: QueryCategory[];
  onSelectQuery: (query: string) => void;
  onSeeAll?: () => void; // Optional callback for "See all" button
}

// Helper to map category names to icons and short names
type CategoryDisplayInfo = { icon: React.ElementType; shortName: string };

const categoryDisplayInfo: { [key: string]: CategoryDisplayInfo } = {
  "🚀 Member Engagement & Retention": {
    icon: UsersIcon,
    shortName: "Engagement",
  },
  "🎯 Lead Management & New Member Onboarding": {
    icon: TagIcon,
    shortName: "Leads",
  },
  "💳 Membership & Package Insights": {
    icon: CalendarDaysIcon,
    shortName: "Memberships",
  },
  "📊 Class & Instructor Performance": {
    icon: ChartBarIcon,
    shortName: "Performance",
  },
  "💡 Operational & Communication Segments": {
    icon: AdjustmentsHorizontalIcon,
    shortName: "Operational",
  },
};

export default function ExampleQueries({
  categorizedQueries,
  onSelectQuery,
  onSeeAll,
}: ExampleQueriesProps) {
  const [activeCategoryName, setActiveCategoryName] = useState<string | null>(
    null,
  );

  useEffect(() => {
    if (
      categorizedQueries &&
      categorizedQueries.length > 0 &&
      !activeCategoryName
    ) {
      setActiveCategoryName(categorizedQueries[0].name);
    }
  }, [categorizedQueries, activeCategoryName]);

  const activeCategory = categorizedQueries.find(
    (category) => category.name === activeCategoryName,
  );

  return (
    <div className="w-full pb-2 pt-6">
      <div className="mb-5 flex items-center justify-between sm:mb-6">
        <div>
          <h2 className="text-center text-xl font-semibold text-gray-800 sm:text-left sm:text-2xl">
            Search Examples
          </h2>
          <p className="mt-1 text-center text-sm text-gray-500 sm:text-left">
            Select a category, then click an example to auto-fill.
          </p>
        </div>
        
        
      </div>

      {categorizedQueries && categorizedQueries.length > 0 && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-2 sm:mb-8 sm:gap-3">
          <div className="flex flex-wrap justify-center gap-2 sm:justify-start sm:gap-3">
            {categorizedQueries.map((category) => {
              const displayInfo = categoryDisplayInfo[category.name] || {
                icon: SparklesIcon, // Default icon if category name not found
                shortName: "Examples",
              };
              return (
                <button
                  key={category.name}
                  onClick={() => setActiveCategoryName(category.name)}
                  className={`
                    flex items-center justify-center rounded-lg border px-3 py-1.5 text-xs font-medium transition-all duration-150 ease-in-out
                    focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-1 sm:px-4 sm:py-2 sm:text-sm
                    ${
                      activeCategoryName === category.name
                        ? "border-sky-600 bg-sky-600 text-white shadow-md" // Active: blue border, blue background
                        : "border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50" // Inactive: gray styles
                    }
                  `}
                >
                  <displayInfo.icon
                    className="mr-1.5 h-4 w-4 flex-shrink-0 sm:mr-2"
                    aria-hidden="true"
                  />
                  {displayInfo.shortName}
                </button>
              );
            })}
          </div>

          {onSeeAll && ( // "See all" link below categories
            <button
              onClick={onSeeAll}
              className="
                text-sm font-medium text-sky-600 underline-offset-2 hover:text-sky-700 hover:underline
                focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-1
              " // Blue link, blue focus
            >
              See all examples
            </button>
          )}
        </div>
      )}

      {activeCategory && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
          {activeCategory.queries.map((queryItem, queryIndex) => (
            <button
              key={`${activeCategory.name}-query-${queryIndex}`} // More specific key
              onClick={() => onSelectQuery(queryItem.text)}
              className="
                group flex h-full min-h-[100px] w-full flex-col justify-start rounded-lg border border-gray-200 bg-white 
                p-4 text-left align-top transition-all duration-150 ease-in-out 
                hover:border-sky-500 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-1 
                sm:min-h-[120px] sm:p-5
              " // Blue border on hover/focus, subtle shadow increase
            >
              <p className="text-sm text-gray-700 group-hover:text-gray-900">
                {queryItem.text}
              </p>
              {/* You could add a subtle arrow or "Try it" text here that appears on hover if desired */}
              {/* Example:
              <span className="mt-auto self-end text-xs text-sky-500 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                Try it →
              </span>
              */}
            </button>
          ))}
        </div>
      )}
      {!activeCategory && categorizedQueries && categorizedQueries.length > 0 && (
        <p className="mt-8 text-center text-sm text-gray-500">
          Select a category above to see example queries.
        </p>
      )}
    </div>
  );
}