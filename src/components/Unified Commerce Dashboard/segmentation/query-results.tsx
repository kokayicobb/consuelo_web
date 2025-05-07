"use client";

import { useState } from "react";
import type { Config } from "@/types/otf";
import {
  Download,
  Table,
  BarChart,
  ListChecks,
  ChevronRight,
  User,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Info,
  MessageSquare,
  Clock,
  Tag,
} from "lucide-react";
import ChartVisualization, {
  ChartLoading,
  ChartError,
} from "./chart-visualization";
import ActionSuggestions, {
  ActionSuggestionsLoading,
} from "./action-suggestions";
import ContactModal from "./contact-modal";

interface QueryResultsProps {
  results: any[];
  columns: string[];
  viewMode: "table" | "chart" | "actions";
  setViewMode: (mode: "table" | "chart" | "actions") => void;
  chartConfig: Config | null;
  isLoadingChart: boolean;
  actionSuggestions: any | null;
  isLoadingActions: boolean;
}

export default function QueryResults({
  results,
  columns,
  viewMode,
  setViewMode,
  chartConfig,
  isLoadingChart,
  actionSuggestions,
  isLoadingActions,
}: QueryResultsProps) {
  // Export the segmentation results as CSV
  const exportCSV = () => {
    if (!results.length) return;
    // Create CSV content
    const csvContent = [
      columns.join(","), // Header row
      ...results.map((row) =>
        columns
          .map((col) => {
            const value = row[col];
            // Handle values that might need escaping
            if (value === null || value === undefined) return "";
            if (
              typeof value === "string" &&
              (value.includes(",") ||
                value.includes('"') ||
                value.includes("\n"))
            ) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
          })
          .join(","),
      ),
    ].join("\n");

    // Create a blob and download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `client-segment-${new Date().toISOString().slice(0, 10)}.csv`,
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Update the CardView component in query-results.tsx

  // Card View Component
  // Update the CardView component in query-results.tsx

  // Card View Component
  const CardView = ({ data }: { data: any[] }) => {
    const [visibleCards, setVisibleCards] = useState(20);
    const [expandedLogs, setExpandedLogs] = useState<Record<string, boolean>>(
      {},
    );
    const [showAddLogForm, setShowAddLogForm] = useState<string | null>(null);
    const [newLogData, setNewLogData] = useState({
      method: "Phone",
      logText: "",
      logType: "Follow-up",
      subType: "",
    });

    // Process the data to ensure we have an array of client objects
    const processedData = Array.isArray(data[0]) ? data[0] : data;

    // Normalize each item to ensure it's an object
    const normalizedData = processedData.map((item) => {
      if (typeof item === "string") {
        try {
          return JSON.parse(item);
        } catch (e) {
          return { value: item };
        }
      }
      return item;
    });

    const handleShowMore = () => {
      setVisibleCards((prev) => prev + 20);
    };
    const [contactModal, setContactModal] = useState<{
      type: "email" | "phone";
      contact: string;
      clientName: string;
    } | null>(null);
    // Toggle contact logs visibility for a specific client
    const toggleContactLogs = (clientId: string) => {
      console.log("Toggling logs for client:", clientId);
      setExpandedLogs((prev) => ({
        ...prev,
        [clientId]: !prev[clientId],
      }));
    };

    // Toggle add log form
    const toggleAddLogForm = (clientId: string | null) => {
      setShowAddLogForm(clientId);
      if (clientId) {
        // Expand logs when showing form
        setExpandedLogs((prev) => ({
          ...prev,
          [clientId]: true,
        }));
      }
    };

    // Handle adding a new log (mock implementation)
    const handleAddLog = (clientId: string, clientName: string) => {
      console.log("Adding log for client:", clientId, clientName, newLogData);
      // In a real implementation, you would call an API to save the log
      // For now, we'll just close the form
      setShowAddLogForm(null);
      setNewLogData({
        method: "Phone",
        logText: "",
        logType: "Follow-up",
        subType: "",
      });
      // Show a success message
      alert(`Log added for ${clientName}`);
    };

    const getCardIcon = (key: string) => {
      const lowerKey = key.toLowerCase();
      if (lowerKey.includes("client") || lowerKey.includes("name"))
        return <User className="h-4 w-4" />;
      if (lowerKey.includes("date") || lowerKey.includes("time"))
        return <Calendar className="h-4 w-4" />;
      if (lowerKey.includes("location") || lowerKey.includes("address"))
        return <MapPin className="h-4 w-4" />;
      if (lowerKey.includes("phone")) return <Phone className="h-4 w-4" />;
      if (lowerKey.includes("email")) return <Mail className="h-4 w-4" />;
      if (lowerKey.includes("coach")) return <User className="h-4 w-4" />;
      return <Info className="h-4 w-4" />;
    };

    const getContactLogIcon = (method: string) => {
      const lowerMethod = method?.toLowerCase() || "";
      if (lowerMethod.includes("phone")) return <Phone className="h-4 w-4" />;
      if (lowerMethod.includes("email")) return <Mail className="h-4 w-4" />;
      if (lowerMethod.includes("person")) return <User className="h-4 w-4" />;
      if (lowerMethod.includes("text") || lowerMethod.includes("sms"))
        return <MessageSquare className="h-4 w-4" />;
      return <MessageSquare className="h-4 w-4" />;
    };

    // Fields to exclude from the main card display
    const excludedFields = ["Client ID", "contact_logs"];

    // Fields to prioritize in the card display
    const priorityFields = ["email", "phone", "date", "description", "Coach"];

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {normalizedData.slice(0, visibleCards).map((item, index) => {
            // Use Client as the primary identifier
            const clientName = item["Client"] || "Unnamed Client";
            const clientId = item["Client ID"] || index.toString();

            // Get contact logs if available
            const contactLogs = item.contact_logs || [];
            const hasContactLogs =
              Array.isArray(contactLogs) && contactLogs.length > 0;

            // Get fields to display (prioritized and filtered)
            const displayFields = Object.entries(item)
              .filter(([key]) => !excludedFields.includes(key))
              // Sort to put priority fields first
              .sort(([keyA], [keyB]) => {
                const priorityA = priorityFields.indexOf(keyA);
                const priorityB = priorityFields.indexOf(keyB);
                if (priorityA !== -1 && priorityB !== -1)
                  return priorityA - priorityB;
                if (priorityA !== -1) return -1;
                if (priorityB !== -1) return 1;
                return 0;
              })
              .slice(0, 5); // Show up to 5 fields

            return (
              <div
                key={index}
                className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md"
              >
                <div
                  className="cursor-pointer border-b border-gray-100 bg-orange-50 p-4"
                  onClick={() => {
                    console.log("Card clicked:", item);
                    // Automatically toggle contact logs when card is clicked
                    toggleContactLogs(clientId);
                  }}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="truncate font-medium text-gray-900">
                      {clientName}
                    </h3>
                    <ChevronRight
                      className={`h-4 w-4 text-gray-400 transition-transform ${
                        expandedLogs[clientId] ? "rotate-90" : ""
                      }`}
                    />
                  </div>
                </div>
                <div className="space-y-3 p-4">
                  {/* Main client information */}
                  <div className="space-y-2">
                    {displayFields.map(([key, value]) => (
                      <div key={key} className="flex items-start gap-2">
                        <div className="mt-0.5 text-orange-500">
                          {getCardIcon(key)}
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">{key}</p>
                          <p
                            className={`break-words text-sm text-gray-700 ${
                              key.toLowerCase().includes("email") ||
                              key.toLowerCase().includes("phone")
                                ? "cursor-pointer text-blue-600 underline"
                                : ""
                            }`}
                            onClick={() => {
                              if (
                                key.toLowerCase().includes("email") ||
                                key.toLowerCase().includes("phone")
                              ) {
                                setContactModal({
                                  type: key.toLowerCase().includes("email")
                                    ? "email"
                                    : "phone",
                                  contact: String(value),
                                  clientName,
                                });
                              }
                            }}
                          >
                            {String(value)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Contact logs section - always show this section */}
                  <div className="mt-4 border-t border-gray-100 pt-3">
                    <div
                      className="mb-2 flex cursor-pointer items-center justify-between"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent card click event
                        toggleContactLogs(clientId);
                      }}
                    >
                      <h4 className="flex items-center gap-1 text-sm font-medium text-gray-700">
                        <MessageSquare className="h-4 w-4" />
                        Contact History (
                        {hasContactLogs ? contactLogs.length : 0})
                      </h4>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleAddLogForm(clientId);
                          }}
                          className="rounded bg-orange-100 px-2 py-1 text-xs text-orange-700 hover:bg-orange-200"
                        >
                          Add Log
                        </button>
                        <ChevronRight
                          className={`h-4 w-4 text-gray-400 transition-transform ${
                            expandedLogs[clientId] ? "rotate-90" : ""
                          }`}
                        />
                      </div>
                    </div>

                    {expandedLogs[clientId] && (
                      <div className="mt-2 space-y-3 pl-1">
                        {/* Add log form */}
                        {showAddLogForm === clientId && (
                          <div className="mb-3 rounded-md border border-orange-100 bg-orange-50 p-3">
                            <h5 className="mb-2 text-sm font-medium">
                              Add Contact Log
                            </h5>
                            <div className="space-y-2">
                              <div>
                                <label className="mb-1 block text-xs text-gray-500">
                                  Contact Method
                                </label>
                                <select
                                  value={newLogData.method}
                                  onChange={(e) =>
                                    setNewLogData({
                                      ...newLogData,
                                      method: e.target.value,
                                    })
                                  }
                                  className="w-full rounded border border-gray-300 p-1.5 text-sm"
                                >
                                  <option>Phone</option>
                                  <option>Email</option>
                                  <option>In Person</option>
                                  <option>Text/SMS</option>
                                </select>
                              </div>
                              <div>
                                <label className="mb-1 block text-xs text-gray-500">
                                  Log Details
                                </label>
                                <textarea
                                  value={newLogData.logText}
                                  onChange={(e) =>
                                    setNewLogData({
                                      ...newLogData,
                                      logText: e.target.value,
                                    })
                                  }
                                  className="w-full rounded border border-gray-300 p-1.5 text-sm"
                                  rows={2}
                                ></textarea>
                              </div>
                              <div className="flex gap-2">
                                <div className="flex-1">
                                  <label className="mb-1 block text-xs text-gray-500">
                                    Log Type
                                  </label>
                                  <select
                                    value={newLogData.logType}
                                    onChange={(e) =>
                                      setNewLogData({
                                        ...newLogData,
                                        logType: e.target.value,
                                      })
                                    }
                                    className="w-full rounded border border-gray-300 p-1.5 text-sm"
                                  >
                                    <option>Follow-up</option>
                                    <option>Membership</option>
                                    <option>Schedule</option>
                                    <option>Billing</option>
                                  </select>
                                </div>
                                <div className="flex-1">
                                  <label className="mb-1 block text-xs text-gray-500">
                                    Sub Type
                                  </label>
                                  <input
                                    type="text"
                                    value={newLogData.subType}
                                    onChange={(e) =>
                                      setNewLogData({
                                        ...newLogData,
                                        subType: e.target.value,
                                      })
                                    }
                                    className="w-full rounded border border-gray-300 p-1.5 text-sm"
                                  />
                                </div>
                              </div>
                              <div className="mt-2 flex justify-end gap-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setShowAddLogForm(null);
                                  }}
                                  className="rounded px-3 py-1 text-sm text-gray-600 hover:bg-gray-100"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAddLog(clientId, clientName);
                                  }}
                                  className="rounded bg-orange-500 px-3 py-1 text-sm text-white hover:bg-orange-600"
                                >
                                  Save Log
                                </button>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Display existing logs */}
                        {hasContactLogs ? (
                          contactLogs.map((log: any, logIndex: number) => (
                            <div
                              key={logIndex}
                              className="rounded-md bg-gray-50 p-2 text-sm"
                            >
                              <div className="mb-1 flex items-start justify-between">
                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                  <Clock className="h-3 w-3" />
                                  {new Date(log["Log Date"]).toLocaleDateString(
                                    "en-US",
                                    {
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric",
                                    },
                                  )}
                                </div>
                                <div className="flex items-center gap-1 text-xs">
                                  <div className="flex items-center gap-1 rounded-full bg-orange-100 px-1.5 py-0.5 text-orange-700">
                                    {getContactLogIcon(log["Contact Method"])}
                                    <span>{log["Contact Method"]}</span>
                                  </div>
                                </div>
                              </div>
                              <p className="mb-1 text-gray-700">
                                {log["Contact Log"]}
                              </p>
                              <div className="flex items-center justify-between text-xs text-gray-500">
                                <div className="flex items-center gap-1">
                                  <Tag className="h-3 w-3" />
                                  {log["Log Type"]}
                                  {log["Sub Type"]
                                    ? ` / ${log["Sub Type"]}`
                                    : ""}
                                </div>
                                <div className="flex items-center gap-1">
                                  <User className="h-3 w-3" />
                                  {log["Contact"]}
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="py-3 text-center text-sm text-gray-500">
                            No contact logs found for this client.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {visibleCards < normalizedData.length && (
          <div className="mt-6 flex justify-center">
            <button
              onClick={handleShowMore}
              className="rounded-md bg-orange-100 px-4 py-2 font-medium text-orange-700 transition-colors hover:bg-orange-200"
            >
              Show More ({visibleCards} of {normalizedData.length})
            </button>{" "}
            {contactModal && (
              <ContactModal
                isOpen={!!contactModal}
                onClose={() => setContactModal(null)}
                type={contactModal.type}
                contact={contactModal.contact}
                clientName={contactModal.clientName}
              />
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      <div className="mb-4 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <h2 className="text-xl font-semibold">
          Results ({results.length}{" "}
          {results.length === 1 ? "client" : "clients"})
        </h2>
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            onClick={exportCSV}
            className="flex items-center justify-center gap-1 rounded-md bg-green-100 px-3 py-1 text-sm text-green-700 hover:bg-green-200"
          >
            <Download size={14} />
            Export CSV
          </button>
          <div className="flex rounded-md bg-gray-100 p-1">
            <button
              onClick={() => setViewMode("table")}
              className={`flex items-center gap-1 rounded-md px-3 py-1 ${
                viewMode === "table" ? "bg-white shadow" : "hover:bg-gray-200"
              }`}
            >
              <Table size={14} />
              <span className="hidden sm:inline">Cards</span>
            </button>
            <button
              onClick={() => setViewMode("chart")}
              className={`flex items-center gap-1 rounded-md px-3 py-1 ${
                viewMode === "chart" ? "bg-white shadow" : "hover:bg-gray-200"
              }`}
              disabled={!chartConfig && !isLoadingChart}
            >
              <BarChart size={14} />
              <span className="hidden sm:inline">Chart</span>
            </button>
            <button
              onClick={() => setViewMode("actions")}
              className={`flex items-center gap-1 rounded-md px-3 py-1 ${
                viewMode === "actions" ? "bg-white shadow" : "hover:bg-gray-200"
              }`}
              disabled={!actionSuggestions && !isLoadingActions}
            >
              <ListChecks size={14} />
              <span className="hidden sm:inline">Actions</span>
            </button>
          </div>
        </div>
      </div>

      {/* Card View (renamed from Table View) */}
      {viewMode === "table" && <CardView data={results} />}

      {/* Chart View */}
      {viewMode === "chart" && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          {isLoadingChart ? (
            <ChartLoading />
          ) : chartConfig ? (
            <ChartVisualization config={chartConfig} data={results} />
          ) : (
            <ChartError message="Unable to generate a chart for this data" />
          )}
        </div>
      )}

      {/* Actions View */}
      {viewMode === "actions" && (
        <div>
          {isLoadingActions ? (
            <ActionSuggestionsLoading />
          ) : actionSuggestions ? (
            <ActionSuggestions
              actions={actionSuggestions.actions}
              summary={actionSuggestions.summary}
            />
          ) : (
            <div className="rounded-lg border border-gray-200 bg-white p-6 text-center shadow-sm">
              <p className="text-gray-500">
                Unable to generate action suggestions for this data
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
