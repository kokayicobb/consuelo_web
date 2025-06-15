"use client";

import type React from "react";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { Search, User, Users } from "lucide-react";

interface Contact {
  id: string;
  name: string;
  type: "contact" | "cohort";
  company?: string;
  email?: string;
  lastInteraction?: string;
  description?: string;
  icon: React.ReactNode;
}

const mockData: Contact[] = [
  {
    id: "1",
    name: "Sarah Chen",
    type: "contact",
    company: "TechFlow Inc",
    email: "sarah@techflow.com",
    lastInteraction: "Today",
    icon: <User className="h-4 w-4 text-amber-600" />,
  },
  {
    id: "2",
    name: "Enterprise Prospects Q4",
    type: "cohort",
    description: "45 contacts • High-value enterprise leads",
    lastInteraction: "Today",
    icon: <Users className="h-4 w-4 text-teal-600" />,
  },
  {
    id: "3",
    name: "Marcus Johnson",
    type: "contact",
    company: "StartupHub",
    email: "marcus@startuphub.io",
    lastInteraction: "Yesterday",
    icon: <User className="h-4 w-4 text-amber-600" />,
  },
  {
    id: "4",
    name: "SaaS Startup Founders",
    type: "cohort",
    description: "23 contacts • Early-stage SaaS founders",
    lastInteraction: "Yesterday",
    icon: <Users className="h-4 w-4 text-teal-600" />,
  },
  {
    id: "5",
    name: "Elena Rodriguez",
    type: "contact",
    company: "Design Co",
    email: "elena@designco.com",
    lastInteraction: "3 days ago",
    icon: <User className="h-4 w-4 text-amber-600" />,
  },
  {
    id: "6",
    name: "David Park",
    type: "contact",
    company: "AI Ventures",
    email: "david@aiventures.com",
    lastInteraction: "4 days ago",
    icon: <User className="h-4 w-4 text-amber-600" />,
  },
  {
    id: "7",
    name: "Design Agency Partners",
    type: "cohort",
    description: "12 contacts • Creative agency partnerships",
    lastInteraction: "5 days ago",
    icon: <Users className="h-4 w-4 text-teal-600" />,
  },
  {
    id: "8",
    name: "Lisa Thompson",
    type: "contact",
    company: "CloudSync",
    email: "lisa@cloudsync.io",
    lastInteraction: "6 days ago",
    icon: <User className="h-4 w-4 text-amber-600" />,
  },
  {
    id: "9",
    name: "Alex Kim",
    type: "contact",
    company: "DataFlow",
    email: "alex@dataflow.com",
    lastInteraction: "1 week ago",
    icon: <User className="h-4 w-4 text-amber-600" />,
  },
  {
    id: "10",
    name: "AI/ML Tech Leaders",
    type: "cohort",
    description: "31 contacts • AI technology decision makers",
    lastInteraction: "1 week ago",
    icon: <Users className="h-4 w-4 text-teal-600" />,
  },
  {
    id: "11",
    name: "Rachel Green",
    type: "contact",
    company: "FinTech Pro",
    email: "rachel@fintechpro.com",
    lastInteraction: "2 weeks ago",
    icon: <User className="h-4 w-4 text-amber-600" />,
  },
  {
    id: "12",
    name: "James Wilson",
    type: "contact",
    company: "SaaS Solutions",
    email: "james@saassolutions.co",
    lastInteraction: "3 weeks ago",
    icon: <User className="h-4 w-4 text-amber-600" />,
  },
  {
    id: "13",
    name: "Maria Santos",
    type: "contact",
    company: "Growth Labs",
    email: "maria@growthlabs.io",
    lastInteraction: "4 weeks ago",
    icon: <User className="h-4 w-4 text-amber-600" />,
  },
  {
    id: "14",
    name: "West Coast Investors",
    type: "cohort",
    description: "18 contacts • VC and angel investors",
    lastInteraction: "4 weeks ago",
    icon: <Users className="h-4 w-4 text-teal-600" />,
  },
  {
    id: "15",
    name: "Robert Taylor",
    type: "contact",
    company: "Innovation Inc",
    email: "robert@innovation.com",
    lastInteraction: "5 weeks ago",
    icon: <User className="h-4 w-4 text-amber-600" />,
  },
];

const categorizeByDate = (items: Contact[]) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
  const pastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const past30Days = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

  return {
    today: items.filter((item) => {
      const itemDate = parseLastInteraction(item.lastInteraction);
      return itemDate >= today;
    }),
    yesterday: items.filter((item) => {
      const itemDate = parseLastInteraction(item.lastInteraction);
      return itemDate >= yesterday && itemDate < today;
    }),
    pastWeek: items.filter((item) => {
      const itemDate = parseLastInteraction(item.lastInteraction);
      return itemDate >= pastWeek && itemDate < yesterday;
    }),
    past30Days: items.filter((item) => {
      const itemDate = parseLastInteraction(item.lastInteraction);
      return itemDate >= past30Days && itemDate < pastWeek;
    }),
  };
};

const parseLastInteraction = (interaction: string): Date => {
  const now = new Date();
  if (interaction.includes("Today") || interaction.includes("today")) {
    return now;
  } else if (
    interaction.includes("Yesterday") ||
    interaction.includes("yesterday")
  ) {
    return new Date(now.getTime() - 24 * 60 * 60 * 1000);
  } else if (interaction.includes("day ago")) {
    const days = Number.parseInt(interaction.match(/(\\d+) day/)?.[1] || "1");
    return new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  } else if (interaction.includes("week ago")) {
    const weeks = Number.parseInt(interaction.match(/(\\d+) week/)?.[1] || "1");
    return new Date(now.getTime() - weeks * 7 * 24 * 60 * 60 * 1000);
  }
  return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // default to a week ago
};

export default function NotionStyleCRMSearch() {
  const [query, setQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filteredData, setFilteredData] = useState<Contact[]>([]);
  const modalInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isModalOpen) {
      modalInputRef.current?.focus();
    }
  }, [isModalOpen]);

  useEffect(() => {
    if (!isModalOpen) {
      setFilteredData([]);
      return;
    }

    if (!query.trim()) {
      setFilteredData(mockData);
      return;
    }

    const normalizedQuery = query.toLowerCase().trim();
    const filtered = mockData.filter((item) => {
      const searchableText =
        `${item.name} ${item.company || ""} ${item.email || ""} ${item.description || ""}`.toLowerCase();
      return searchableText.includes(normalizedQuery);
    });

    setFilteredData(filtered);
  }, [query, isModalOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsModalOpen(false);
        setQuery("");
      }
    };

    const handleCmdK = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsModalOpen(true);
        setQuery("");
      }
    };

    document.addEventListener("keydown", handleEscape);
    document.addEventListener("keydown", handleCmdK);

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.removeEventListener("keydown", handleCmdK);
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const groupedData = filteredData.reduce(
    (acc, item) => {
      if (item.type === "contact") {
        if (!acc.contacts) acc.contacts = [];
        acc.contacts.push(item);
      } else {
        if (!acc.cohorts) acc.cohorts = [];
        acc.cohorts.push(item);
      }
      return acc;
    },
    {} as { contacts?: Contact[]; cohorts?: Contact[] },
  );

  return (
    <>
      {/* Main search trigger - adjusted spacing */}
      <div
        className="flex cursor-pointer items-center rounded-md px-2 py-1.5 text-sm text-gray-700 transition-colors duration-150 hover:bg-gray-50"
        onClick={() => {
          setIsModalOpen(true);
          setQuery("");
        }}
      >
        <Search size={20} className="mr-2 text-gray-600" />
        <span className="text-gray-700">Search</span>
        <div className="ml-auto flex items-center">
          <kbd className="rounded border bg-gray-100 px-1.5 py-0.5 text-[11px] font-sans font-medium text-gray-500">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Modal - styled like Notion */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-start justify-center pt-24"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
            onClick={() => {
              setIsModalOpen(false);
              setQuery("");
            }}
          >
            <motion.div
              className="relative max-h-[70vh] w-full max-w-2xl rounded-lg border border-gray-200 bg-neutral-50 shadow-2xl dark:border-gray-700 dark:bg-gray-800"
              initial={{ y: -20, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -20, opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Search input */}
              <div className="p-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    ref={modalInputRef}
                    type="text"
                    placeholder="Search contacts and cohorts..."
                    value={query}
                    onChange={handleInputChange}
                    className="border-0 bg-transparent py-3 pl-10 pr-4 text-base focus-visible:ring-0 focus-visible:ring-offset-0"
                    disableHover={true}
                  />
                </div>
              </div>

              {/* Results */}
              <div className="max-h-96 overflow-y-auto">
                {filteredData.length === 0 ? (
                  <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                    <Search className="mx-auto mb-3 h-8 w-8 opacity-50" />
                    <p className="text-sm">
                      {query ? "No results found" : "Start typing to search..."}
                    </p>
                  </div>
                ) : (
                  <div className="py-2">
                    {!query && (
                      <>
                        {(() => {
                          const categorized = categorizeByDate(filteredData);
                          return (
                            <>
                              {categorized.today.length > 0 && (
                                <>
                                  <div className="px-4 py-1">
                                    <h3 className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                      Today
                                    </h3>
                                  </div>
                                  {categorized.today.map((item) => (
                                    <motion.div
                                      key={item.id}
                                      className={`cursor-pointer border-l-2 border-transparent px-4 py-2 transition-all hover:bg-gray-50 dark:hover:bg-gray-700/50 ${item.type === "contact" ? "hover:border-amber-500" : "hover:border-teal-500"}`}
                                      initial={{ opacity: 0, y: 10 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      transition={{ duration: 0.1 }}
                                    >
                                      <div className="flex items-center gap-3">
                                        <div className="flex-shrink-0">
                                          {item.icon}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                          <div className="flex items-center gap-2">
                                            <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                                              {item.name}
                                            </p>
                                            {item.company && (
                                              <>
                                                <span className="text-gray-300 dark:text-gray-600">
                                                  •
                                                </span>
                                                <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                                                  {item.company}
                                                </p>
                                              </>
                                            )}
                                          </div>
                                          {(item.email || item.description) && (
                                            <p className="truncate text-xs text-gray-400 dark:text-gray-500">
                                              {item.email || item.description}
                                            </p>
                                          )}
                                        </div>
                                        <div className="text-xs text-gray-400 dark:text-gray-500">
                                          {item.lastInteraction}
                                        </div>
                                      </div>
                                    </motion.div>
                                  ))}
                                </>
                              )}

                              {categorized.yesterday.length > 0 && (
                                <>
                                  <div className="mt-4 px-4 py-1">
                                    <h3 className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                      Yesterday
                                    </h3>
                                  </div>
                                  {categorized.yesterday.map((item) => (
                                    <motion.div
                                      key={item.id}
                                      className={`cursor-pointer border-l-2 border-transparent px-4 py-2 transition-all hover:bg-gray-50 dark:hover:bg-gray-700/50 ${item.type === "contact" ? "hover:border-amber-500" : "hover:border-teal-500"}`}
                                      initial={{ opacity: 0, y: 10 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      transition={{ duration: 0.1 }}
                                    >
                                      <div className="flex items-center gap-3">
                                        <div className="flex-shrink-0">
                                          {item.icon}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                          <div className="flex items-center gap-2">
                                            <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                                              {item.name}
                                            </p>
                                            {item.company && (
                                              <>
                                                <span className="text-gray-300 dark:text-gray-600">
                                                  •
                                                </span>
                                                <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                                                  {item.company}
                                                </p>
                                              </>
                                            )}
                                          </div>
                                          {(item.email || item.description) && (
                                            <p className="truncate text-xs text-gray-400 dark:text-gray-500">
                                              {item.email || item.description}
                                            </p>
                                          )}
                                        </div>
                                        <div className="text-xs text-gray-400 dark:text-gray-500">
                                          {item.lastInteraction}
                                        </div>
                                      </div>
                                    </motion.div>
                                  ))}
                                </>
                              )}

                              {categorized.pastWeek.length > 0 && (
                                <>
                                  <div className="mt-4 px-4 py-1">
                                    <h3 className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                      Past week
                                    </h3>
                                  </div>
                                  {categorized.pastWeek.map((item) => {
                                    const itemDate = parseLastInteraction(
                                      item.lastInteraction,
                                    );
                                    const dateString =
                                      itemDate.toLocaleDateString();

                                    return (
                                      <motion.div
                                        key={item.id}
                                        className={`cursor-pointer border-l-2 border-transparent px-4 py-2 transition-all hover:bg-gray-50 dark:hover:bg-gray-700/50 ${item.type === "contact" ? "hover:border-amber-500" : "hover:border-teal-500"}`}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.1 }}
                                      >
                                        <div className="flex items-center gap-3">
                                          <div className="flex-shrink-0">
                                            {item.icon}
                                          </div>
                                          <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2">
                                              <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                                                {item.name}
                                              </p>
                                              {item.company && (
                                                <>
                                                  <span className="text-gray-300 dark:text-gray-600">
                                                    •
                                                  </span>
                                                  <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                                                    {item.company}
                                                  </p>
                                                </>
                                              )}
                                            </div>
                                            {(item.email ||
                                              item.description) && (
                                              <p className="truncate text-xs text-gray-400 dark:text-gray-500">
                                                {item.email || item.description}
                                              </p>
                                            )}
                                          </div>
                                          <div className="text-xs text-gray-400 dark:text-gray-500">
                                            {dateString}
                                          </div>
                                        </div>
                                      </motion.div>
                                    );
                                  })}
                                </>
                              )}

                              {categorized.past30Days.length > 0 && (
                                <>
                                  <div className="mt-4 px-4 py-1">
                                    <h3 className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                      Past 30 days
                                    </h3>
                                  </div>
                                  {categorized.past30Days.map((item) => {
                                    const itemDate = parseLastInteraction(
                                      item.lastInteraction,
                                    );
                                    const dateString =
                                      itemDate.toLocaleDateString();

                                    return (
                                      <motion.div
                                        key={item.id}
                                        className={`cursor-pointer border-l-2 border-transparent px-4 py-2 transition-all hover:bg-gray-50 dark:hover:bg-gray-700/50 ${item.type === "contact" ? "hover:border-amber-500" : "hover:border-teal-500"}`}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.1 }}
                                      >
                                        <div className="flex items-center gap-3">
                                          <div className="flex-shrink-0">
                                            {item.icon}
                                          </div>
                                          <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2">
                                              <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                                                {item.name}
                                              </p>
                                              {item.company && (
                                                <>
                                                  <span className="text-gray-300 dark:text-gray-600">
                                                    •
                                                  </span>
                                                  <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                                                    {item.company}
                                                  </p>
                                                </>
                                              )}
                                            </div>
                                            {(item.email ||
                                              item.description) && (
                                              <p className="truncate text-xs text-gray-400 dark:text-gray-500">
                                                {item.email || item.description}
                                              </p>
                                            )}
                                          </div>
                                          <div className="text-xs text-gray-400 dark:text-gray-500">
                                            {dateString}
                                          </div>
                                        </div>
                                      </motion.div>
                                    );
                                  })}
                                </>
                              )}
                            </>
                          );
                        })()}
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="rounded-b-lg bg-neutral-50 px-4 py-3 dark:bg-gray-800">
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-4">
                    <span>↑↓ to navigate</span>
                    <span>↵ to select</span>
                  </div>
                  <span>ESC to cancel</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
