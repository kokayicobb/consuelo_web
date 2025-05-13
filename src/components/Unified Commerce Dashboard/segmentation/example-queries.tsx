"use client"

import { useState, useEffect } from 'react';
import { TagIcon, UsersIcon, CalendarDaysIcon, ChartBarIcon, AdjustmentsHorizontalIcon, SparklesIcon } from '@heroicons/react/24/outline';

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
  "🚀 Member Engagement & Retention": { icon: UsersIcon, shortName: "Engagement" },
  "🎯 Lead Management & New Member Onboarding": { icon: TagIcon, shortName: "Leads" },
  "💳 Membership & Package Insights": { icon: CalendarDaysIcon, shortName: "Memberships" },
  "📊 Class & Instructor Performance": { icon: ChartBarIcon, shortName: "Performance" },
  "💡 Operational & Communication Segments": { icon: AdjustmentsHorizontalIcon, shortName: "Operational" },
};

export default function ExampleQueries({ categorizedQueries, onSelectQuery }: ExampleQueriesProps) {
  const [activeCategoryName, setActiveCategoryName] = useState<string | null>(null);

  useEffect(() => {
    if (categorizedQueries && categorizedQueries.length > 0 && !activeCategoryName) {
      setActiveCategoryName(categorizedQueries[0].name);
    }
  }, [categorizedQueries, activeCategoryName]);

  const activeCategory = categorizedQueries.find(
    (category) => category.name === activeCategoryName
  );

  return (
    <div className="w-full pt-6 pb-2">
      <div className="mb-5 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 text-center sm:text-left">
          Search Examples
        </h2>
        <p className="text-gray-500 mt-1 text-sm text-center sm:text-left">
          Select a category, then click an example to auto-fill and run.
        </p>
      </div>

      {categorizedQueries && categorizedQueries.length > 0 && (
        <div className="mb-6 sm:mb-8 flex flex-wrap justify-center sm:justify-start gap-2 sm:gap-3">
          {categorizedQueries.map((category) => {
            const displayInfo = categoryDisplayInfo[category.name] || { icon: SparklesIcon, shortName: "Examples" };
            return (
              <button
                key={category.name}
                onClick={() => setActiveCategoryName(category.name)}
                className={`
                  flex items-center justify-center px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium rounded-lg transition-all duration-150 ease-in-out
                  border focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-sky-400
                  ${activeCategoryName === category.name
                    ? 'bg-sky-600 text-white border-sky-600 shadow-sm'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100 hover:border-gray-400'
                  }
                `}
              >
                <displayInfo.icon className="w-4 h-4 mr-1.5 sm:mr-2 flex-shrink-0" /> 
                {displayInfo.shortName}
              </button>
            );
          })}
        </div>
      )}

      {activeCategory && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {activeCategory.queries.map((queryItem, queryIndex) => (
            <button
              key={queryIndex}
              onClick={() => onSelectQuery(queryItem.text)}
              className="
                flex flex-col justify-between w-full text-left p-3 sm:p-4 bg-white border border-gray-200 rounded-lg 
                hover:shadow-md hover:border-sky-400 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-sky-500
                transition-all duration-150 ease-in-out h-full min-h-[80px] sm:min-h-[100px] group
              "
            >
              <p className="text-sm text-gray-700 group-hover:text-sky-700">
                {queryItem.text}
              </p>
              {/* You can add a subtle "Try it →" or similar at the bottom if desired */}
            </button>
          ))}
        </div>
      )}
       {!activeCategory && categorizedQueries && categorizedQueries.length > 0 && (
          <p className="text-center text-gray-500 mt-8 text-sm">Select a category above to see example queries.</p>
      )}
    </div>
  );
}