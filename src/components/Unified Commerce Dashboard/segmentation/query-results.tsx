"use client";

import { useState } from "react";

import type { Config } from "@/types/otf";
import {
  Download,
  Table,
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

import ActionSuggestions, {
  ActionSuggestionsLoading,
  type SuggestedAction // <<--- 1. IMPORT SuggestedAction TYPE
} from "./action-suggestions";
import ContactModal from "./contact-modal";

interface QueryResultsProps {
  results: any[];
  columns: string[];
  viewMode: "table" | "actions" | "cards"| "chart";
  setViewMode: (mode: "table" | "actions") => void;
  chartConfig: Config | null;
  isLoadingChart: boolean;
  actionSuggestions: { actions: SuggestedAction[]; summary: string } | null; // <-- Use SuggestedAction[] here
  isLoadingActions: boolean;
  isCompactView?: boolean;
  onInitiateAction: (action: SuggestedAction) => void; // <<--- 2. ADD onInitiateAction TO PROPS INTERFACE
}

export default function QueryResults({
  results: initialResults,
  columns,
  viewMode,
  setViewMode,
  chartConfig,
  isLoadingChart,
  actionSuggestions,
  isLoadingActions,
  isCompactView = false,
  onInitiateAction, 
}: QueryResultsProps) {

  // Determine the actual list of client items for display and counting
  // This handles the case where results might be nested like [[...]]
  const displayableResults =
    initialResults &&
    initialResults.length > 0 &&
    Array.isArray(initialResults[0]) &&
    typeof initialResults[0] !== 'string' // Check if the first element is an array (and not just an array of strings)
      ? initialResults[0] // Use the inner array if nested
      : (initialResults || []); // Otherwise, use the initial results (or empty array)

  // Export the segmentation results as CSV
  const exportCSV = () => {
    if (!displayableResults.length) return; // Use displayableResults

    const csvContent = [
      columns.join(","), // Header row
      ...displayableResults.map((row) => // Use displayableResults for CSV export
        columns
          .map((col) => {
            const value = row[col];
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

  // Card View Component
  // Receives the already flattened 'data' prop (which is displayableResults)
  const CardView = ({ data, isCompactView: cardViewIsCompact }: { data: any[]; isCompactView: boolean }) => {
    const [visibleCards, setVisibleCards] = useState(20);
    const [expandedLogs, setExpandedLogs] = useState<Record<string, boolean>>({});
    const [showAddLogForm, setShowAddLogForm] = useState<string | null>(null);
    const [newLogData, setNewLogData] = useState({
      method: "Phone",
      logText: "",
      logType: "Follow-up",
      subType: "",
    });
    const [contactModal, setContactModal] = useState<{
      type: "email" | "phone";
      contact: string;
      clientName: string;
    } | null>(null);

    // 'data' is already the flattened displayableResults.
    // This check handles the case where data might be an array of strings,
    // ensuring normalizedData is an array of objects.
    const normalizedData = (Array.isArray(data) ? data : []).map((item) => {
      if (typeof item === "string") {
        try {
          return JSON.parse(item);
        } catch (e) {
          console.error("Failed to parse JSON string in CardView item:", item, e);
          return { value: item }; // Return object with value if parsing fails
        }
      }
      // Ensure it's an object, handle null/undefined items gracefully
      return item && typeof item === 'object' ? item : {};
    });


    const handleShowMore = () => {
      setVisibleCards((prev) => prev + 20);
    };

    const toggleContactLogs = (clientId: string) => {
      setExpandedLogs((prev) => ({
        ...prev,
        [clientId]: !prev[clientId],
      }));
    };

    const toggleAddLogForm = (clientId: string | null) => {
      setShowAddLogForm(clientId);
      if (clientId) {
        setExpandedLogs((prev) => ({
          ...prev,
          [clientId]: true,
        }));
      }
    };

    const handleAddLog = (clientId: string, clientName: string) => {
      console.log("Adding log for client:", clientId, clientName, newLogData);
      // Mock implementation: In a real app, call API here
      // After successful API call, you'd ideally update the data or refetch
      setShowAddLogForm(null);
      setNewLogData({
        method: "Phone",
        logText: "",
        logType: "Follow-up",
        subType: "",
      });
      // Provide user feedback
      alert(`Log added for ${clientName}`);
    };

    const getCardIcon = (key: string) => {
      const lowerKey = key?.toLowerCase() || ""; // Handle potential null/undefined key
      if (lowerKey.includes("client") || lowerKey.includes("name")) return <User className="h-4 w-4" />;
      if (lowerKey.includes("date") || lowerKey.includes("time")) return <Calendar className="h-4 w-4" />;
      if (lowerKey.includes("location") || lowerKey.includes("address")) return <MapPin className="h-4 w-4" />;
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
      if (lowerMethod.includes("text") || lowerMethod.includes("sms")) return <MessageSquare className="h-4 w-4" />;
      return <MessageSquare className="h-4 w-4" />;
    };

    const excludedFields = ["Client ID", "contact_logs"];
    const priorityFields = ["email", "phone", "date", "description", "Coach"];

    // Conditionally set grid layout classes based on compact view
    const gridLayoutClasses = cardViewIsCompact
      ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-2" // Max 2 cols for compact view on lg screens
      : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"; // Original 3 cols for expanded view on lg screens

    return (
      <div className="space-y-6">
        {/* Apply dynamic grid classes */}
        <div className={`grid ${gridLayoutClasses} gap-4`}>
          {normalizedData.slice(0, visibleCards).map((item, index) => {
             // Ensure item is an object before accessing properties
            const clientName = (item && typeof item === 'object' ? item["Client"] : undefined) || "Unnamed Client";
            const clientId = (item && typeof item === 'object' ? item["Client ID"] : undefined) || (item && typeof item === 'object' ? item.id : undefined) || index.toString(); // Prefer clientId or id if available

            const contactLogs = (item && typeof item === 'object' ? item.contact_logs : undefined) || [];
            const hasContactLogs = Array.isArray(contactLogs) && contactLogs.length > 0;

            const displayFields = item && typeof item === 'object'
                ? Object.entries(item)
                    .filter(([key]) => !excludedFields.includes(key))
                    .sort(([keyA], [keyB]) => {
                      const priorityA = priorityFields.indexOf(keyA);
                      const priorityB = priorityFields.indexOf(keyB);
                      if (priorityA !== -1 && priorityB !== -1) return priorityA - priorityB;
                      if (priorityA !== -1) return -1;
                      if (priorityB !== -1) return 1;
                      return 0;
                    })
                    .slice(0, 5)
                : []; // Empty array if item is not a valid object


            return (
              // Use a stable key based on clientId
              <div
                key={clientId}
                className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md"
              >
                <div
                  className="cursor-pointer border-b border-gray-100 bg-orange-50 p-4"
                  onClick={() => {
                    toggleContactLogs(clientId);
                  }}
                >
                  <div className="flex items-center justify-between">
                    {/* Use a title attribute for full name on hover */}
                    <h3 className="truncate font-medium text-gray-900" title={clientName}>
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
                              typeof key === 'string' && (key.toLowerCase().includes("email") || key.toLowerCase().includes("phone"))
                                ? "cursor-pointer text-blue-600 underline"
                                : ""
                            }`}
                            onClick={() => {
                              if (
                                typeof key === 'string' && (key.toLowerCase().includes("email") || key.toLowerCase().includes("phone"))
                              ) {
                                setContactModal({
                                  type: key.toLowerCase().includes("email") ? "email" : "phone",
                                  contact: String(value), // Ensure value is a string
                                  clientName,
                                });
                              }
                            }}
                          >
                            {/* Ensure value is displayable */}
                            {value !== null && value !== undefined ? String(value) : ''}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 border-t border-gray-100 pt-3">
                    <div
                      className="mb-2 flex cursor-pointer items-center justify-between"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent card click event from closing/expanding logs
                        toggleContactLogs(clientId);
                      }}
                    >
                      <h4 className="flex items-center gap-1 text-sm font-medium text-gray-700">
                        <MessageSquare className="h-4 w-4" />
                        Contact History ({hasContactLogs ? contactLogs.length : 0})
                      </h4>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleAddLogForm(clientId);
                          }}
                          className="rounded bg-orange-100 px-2 py-1 text-xs text-orange-700 hover:bg-orange-200"
                          title="Add Contact Log" // Add tooltip
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
                        {showAddLogForm === clientId && (
                          <div className="mb-3 rounded-md border border-orange-100 bg-orange-50 p-3">
                            <h5 className="mb-2 text-sm font-medium">Add Contact Log</h5>
                            <div className="space-y-2">
                              <div>
                                <label className="mb-1 block text-xs text-gray-500">Contact Method</label>
                                <select
                                  value={newLogData.method}
                                  onChange={(e) => setNewLogData({...newLogData, method: e.target.value})}
                                  className="w-full rounded border border-gray-300 p-1.5 text-sm"
                                >
                                  <option>Phone</option><option>Email</option><option>In Person</option><option>Text/SMS</option>
                                </select>
                              </div>
                              <div>
                                <label className="mb-1 block text-xs text-gray-500">Log Details</label>
                                <textarea
                                  value={newLogData.logText}
                                  onChange={(e) => setNewLogData({...newLogData, logText: e.target.value})}
                                  className="w-full rounded border border-gray-300 p-1.5 text-sm"
                                  rows={2}
                                ></textarea>
                              </div>
                              <div className="flex gap-2">
                                <div className="flex-1">
                                  <label className="mb-1 block text-xs text-gray-500">Log Type</label>
                                  <select
                                    value={newLogData.logType}
                                    onChange={(e) => setNewLogData({...newLogData, logType: e.target.value})}
                                    className="w-full rounded border border-gray-300 p-1.5 text-sm"
                                  >
                                    <option>Follow-up</option><option>Membership</option><option>Schedule</option><option>Billing</option>
                                  </select>
                                </div>
                                <div className="flex-1">
                                  <label className="mb-1 block text-xs text-gray-500">Sub Type</label>
                                  <input
                                    type="text"
                                    value={newLogData.subType}
                                    onChange={(e) => setNewLogData({...newLogData, subType: e.target.value})}
                                    className="w-full rounded border border-gray-300 p-1.5 text-sm"
                                  />
                                </div>
                              </div>
                              <div className="mt-2 flex justify-end gap-2">
                                <button
                                  onClick={(e) => { e.stopPropagation(); setShowAddLogForm(null); }}
                                  className="rounded px-3 py-1 text-sm text-gray-600 hover:bg-gray-100"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleAddLog(clientId, clientName); }}
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
                            <div key={logIndex} className="rounded-md bg-gray-50 p-2 text-sm">
                              <div className="mb-1 flex items-start justify-between">
                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                  <Clock className="h-3 w-3" />
                                  {/* Safely access Log Date */}
                                  {log && typeof log["Log Date"] === 'string'
                                    ? new Date(log["Log Date"]).toLocaleDateString("en-US", {month: "short", day: "numeric", year: "numeric"})
                                    : 'Invalid Date'}
                                </div>
                                <div className="flex items-center gap-1 text-xs">
                                  <div className="flex items-center gap-1 rounded-full bg-orange-100 px-1.5 py-0.5 text-orange-700">
                                    {getContactLogIcon(log && typeof log["Contact Method"] === 'string' ? log["Contact Method"] : '')}
                                    {/* Safely access Contact Method */}
                                    <span>{log && typeof log["Contact Method"] === 'string' ? log["Contact Method"] : 'Unknown Method'}</span>
                                  </div>
                                </div>
                              </div>
                              {/* Safely access Contact Log */}
                              <p className="mb-1 text-gray-700">{log && typeof log["Contact Log"] === 'string' ? log["Contact Log"] : 'No details'}</p>
                              <div className="flex items-center justify-between text-xs text-gray-500">
                                <div className="flex items-center gap-1">
                                  <Tag className="h-3 w-3" />
                                   {/* Safely access Log Type and Sub Type */}
                                  {log && typeof log["Log Type"] === 'string' ? log["Log Type"] : 'Unknown Type'}
                                  {log && typeof log["Sub Type"] === 'string' ? ` / ${log["Sub Type"]}` : ""}
                                </div>
                                <div className="flex items-center gap-1">
                                  <User className="h-3 w-3" />
                                  {/* Safely access Contact person */}
                                  {log && typeof log["Contact"] === 'string' ? log["Contact"] : 'Unknown Contact'}
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="py-3 text-center text-sm text-gray-500">No contact logs found for this client.</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
           {/* Show Empty State for Cards */}
          {normalizedData.length === 0 && (
             <div className="rounded-lg border border-gray-200 bg-white p-6 text-center shadow-sm md:col-span-2 lg:col-span-full"> {/* Make empty state span columns */}
                <p className="text-gray-500">No clients match these criteria.</p>
              </div>
          )}
        </div>

        {visibleCards < normalizedData.length && (
          <div className="mt-6 flex justify-center">
            <button
              onClick={handleShowMore}
              className="rounded-md bg-orange-100 px-4 py-2 font-medium text-orange-700 transition-colors hover:bg-orange-200"
            >
              Show More ({visibleCards} of {normalizedData.length})
            </button>
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
         {/* Render modal outside the grid loop */}
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
    );
  };


  return (
    <div>
      <div className="mb-4 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <h2 className="text-xl font-semibold">
          Results ({displayableResults.length}{" "} {/* Use displayableResults.length for the count */}
          {displayableResults.length === 1 ? "client" : "clients"}) {/* Use displayableResults.length for pluralization */}
        </h2>
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            onClick={exportCSV}
            className="flex items-center justify-center gap-1 rounded-md bg-green-100 px-3 py-1 text-sm text-green-700 hover:bg-green-200"
          >
            <Download size={14} /> Export CSV
          </button>
          <div className="flex rounded-md bg-gray-100 p-1">
            {/* Button for Cards View (using Table icon, setting mode 'table') */}
            <button
              onClick={() => setViewMode("table")}
               className={`flex items-center gap-1 rounded-md px-3 py-1 ${
                viewMode === "table" || viewMode === "cards" // Highlight if mode is 'table' or initial 'cards'
                   ? "bg-white shadow"
                   : "hover:bg-gray-200"
              }`}
            >
              <Table size={14} /> <span className="hidden sm:inline">Cards</span> {/* Label is now "Cards" */}
            </button>
            {/* Chart button removed */}
            {/* <button ... > <BarChart /> Chart </button> */}

            {/* Button for Actions View */}
            <button
              onClick={() => setViewMode("actions")}
              className={`flex items-center gap-1 rounded-md px-3 py-1 ${
                viewMode === "actions" ? "bg-white shadow" : "hover:bg-gray-200"
              }`}
              disabled={!actionSuggestions && !isLoadingActions}
            >
              <ListChecks size={14} /> <span className="hidden sm:inline">Actions</span>
            </button>
          </div>
        </div>
      </div>

      {/* Render Card View when mode is 'table' or 'cards' (to handle initial state) */}
      {(viewMode === "table" || viewMode === "cards") && <CardView data={displayableResults} isCompactView={isCompactView} />}

      {/* Chart View (commented out/removed completely) */}
      {/* {viewMode === "chart" && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
           {isLoadingChart ? (
             <ChartLoading />
           ) : chartConfig ? (
             <ChartVisualization config={chartConfig} data={results} />
           ) : (
             <ChartError message="Unable to generate a chart for this data" />
           )}
        </div>
      )} */}

      {/* Actions View */}
      {viewMode === "actions" && (
        <div>
          {isLoadingActions ? (
            <ActionSuggestionsLoading />
          ) : actionSuggestions ? (
            <ActionSuggestions
                actions={actionSuggestions.actions}
                summary={actionSuggestions.summary} onInitiateAction={onInitiateAction}          />
          ) : (
            <div className="rounded-lg border border-gray-200 bg-white p-6 text-center shadow-sm">
              <p className="text-gray-500">Unable to generate action suggestions for this data</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}