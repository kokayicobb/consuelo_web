"use client";

import { useState, useEffect } from "react";
import {
  TagIcon,
  UsersIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  AdjustmentsHorizontalIcon,
  SparklesIcon,
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
}

// Helper to map category names to icons and short names
const categoryDisplayInfo: {
  [key: string]: { icon: React.ElementType; shortName: string };
} = {
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
      <div className="mb-5 sm:mb-6">
        <h2 className="text-center text-xl font-semibold text-gray-800 sm:text-left sm:text-2xl">
          Search Examples
        </h2>
        <p className="mt-1 text-center text-sm text-gray-500 sm:text-left">
          Select a category, then click an example to auto-fill and run.
        </p>
      </div>

      {categorizedQueries && categorizedQueries.length > 0 && (
        <div className="mb-6 flex flex-wrap justify-center gap-2 sm:mb-8 sm:justify-start sm:gap-3">
          {categorizedQueries.map((category) => {
            const displayInfo = categoryDisplayInfo[category.name] || {
              icon: SparklesIcon,
              shortName: "Examples",
            };
            return (
              <button
                key={category.name}
                onClick={() => setActiveCategoryName(category.name)}
                className={`
                  flex items-center justify-center rounded-lg border px-3 py-1.5 text-xs font-medium transition-all duration-150 ease-in-out focus:outline-none focus:ring-2
                  focus:ring-orange-400 focus:ring-offset-1 sm:px-4 sm:py-2 sm:text-sm
                  ${
                    activeCategoryName === category.name
                      ? "border-orange-500 bg-orange-500 text-white shadow-sm"
                      : "border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-100"
                  }
                `}
              >
                <displayInfo.icon className="mr-1.5 h-4 w-4 flex-shrink-0 sm:mr-2" />
                {displayInfo.shortName}
              </button>
            );
          })}
        </div>
      )}

      {activeCategory && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
          {activeCategory.queries.map((queryItem, queryIndex) => (
            <button
              key={queryIndex}
              onClick={() => onSelectQuery(queryItem.text)}
              className="
  group flex h-full min-h-[80px] w-full flex-col justify-between rounded-lg border border-gray-200 bg-white 
  p-3 text-left transition-all duration-150 ease-in-out hover:border-orange-500
  hover:shadow-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-1 sm:min-h-[100px] sm:p-4
"
            >
              <p className="text-sm text-gray-700 group-hover:text-black-600">
                {queryItem.text}
              </p>
              {/* You can add a subtle "Try it →" or similar at the bottom if desired */}
            </button>
          ))}
        </div>
      )}
      {!activeCategory &&
        categorizedQueries &&
        categorizedQueries.length > 0 && (
          <p className="mt-8 text-center text-sm text-gray-500">
            Select a category above to see example queries.
          </p>
        )}
    </div>
  );
}
