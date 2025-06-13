// src/components/Unified Commerce Dashboard/tabs/automations/index.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, Zap, Loader2, ChevronRight, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Flow } from "../../lib/automations/types";

export default function AutomationsPage() {
  const router = useRouter();
  const [flows, setFlows] = useState<Flow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch all flows
  useEffect(() => {
    const fetchFlows = async () => {
      try {
        setIsLoading(true);
        setError(null);

        console.log("Fetching flows from /api/automations/flows");
        const response = await fetch("/api/automations/flows");

        // Log the raw response for debugging
        console.log("Response status:", response.status);

        // Check for HTTP errors
        if (!response.ok) {
          let errorMessage = `HTTP Error: ${response.status}`;
          try {
            const errorData = await response.json();
            errorMessage = errorData.error?.message || errorMessage;
          } catch (parseError) {
            console.error("Failed to parse error response:", parseError);
          }
          throw new Error(errorMessage);
        }

        const responseText = await response.text();
        console.log("Raw response text:", responseText);

        // Parse the JSON response
        let result;
        try {
          result = JSON.parse(responseText);
        } catch (parseError) {
          console.error("Failed to parse response as JSON:", parseError);
          throw new Error("Received invalid JSON from server");
        }

        // Check for application-level errors
        if (result.success) {
          console.log("Successfully retrieved flows:", result.data);
          setFlows(result.data.data || []);
        } else {
          throw new Error(
            result.error?.message || "An unknown error occurred.",
          );
        }
      } catch (err: any) {
        console.error("Error fetching flows:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFlows();
  }, []);

  // Create a new automation
  const handleCreateAutomation = async () => {
    setIsCreating(true);
    setError(null);
    try {
      console.log("Creating new automation");
      const response = await fetch("/api/automations/flows", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ displayName: "Untitled Automation" }),
      });

      console.log("Create response status:", response.status);

      const responseText = await response.text();
      console.log("Create raw response text:", responseText);

      // Only try to parse if there's actual content
      if (responseText.trim()) {
        try {
          const result = JSON.parse(responseText);

          // Check for both HTTP and application-level errors
          if (!response.ok || !result.success) {
            throw new Error(
              result.error?.message ||
                `Failed to create automation. Status: ${response.status}`,
            );
          }

          console.log("Successfully created new automation:", result.data);
          router.push(`/automations/${result.data.id}`);
        } catch (parseError) {
          console.error("Failed to parse create response as JSON:", parseError);
          throw new Error("Received invalid JSON from server");
        }
      } else {
        throw new Error(
          `Failed to create automation. Empty response with status: ${response.status}`,
        );
      }
    } catch (err: any) {
      console.error("Error creating automation:", err);
      setError(err.message);
    } finally {
      setIsCreating(false);
    }
  };

  // Delete an automation
  const handleDeleteAutomation = async (flowId: string) => {
    if (!confirm("Are you sure you want to delete this automation?")) return;
    if (!flowId) {
      setError("Invalid flow ID");
      return;
    }

    console.log(`Deleting automation with ID: ${flowId}`);
    const originalFlows = [...flows];
    setFlows(flows.filter((f) => f.id !== flowId));

    try {
      const response = await fetch(`/api/automations/${flowId}`, {
        method: "DELETE",
      });

      console.log("Delete response status:", response.status);

      // Try to parse the response, but don't fail if it can't be parsed
      let result;
      try {
        const responseText = await response.text();
        console.log("Delete raw response text:", responseText);
        if (responseText.trim()) {
          result = JSON.parse(responseText);
        }
      } catch (parseError) {
        console.error("Failed to parse delete response:", parseError);
      }

      if (!response.ok) {
        throw new Error(
          result?.error?.message ||
            `Failed to delete. Status: ${response.status}`,
        );
      }

      console.log("Successfully deleted automation");
    } catch (err: any) {
      console.error("Error deleting automation:", err);
      setError(err.message);
      setFlows(originalFlows); // Revert on failure
    }
  };

  const filteredFlows = flows.filter((flow) =>
    flow.version.displayName.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      );
    }

    if (error) {
      return (
        <div className="py-20 text-center text-red-500">Error: {error}</div>
      );
    }

    if (flows.length === 0) {
      return (
        <div className="py-20 text-center">
          <Zap size={40} className="mx-auto mb-3 text-gray-300" />
          <h3 className="mb-1 font-semibold text-gray-700">
            No Automations Found
          </h3>
          <p className="mb-4 text-sm text-gray-500">
            Get started by creating your first workflow.
          </p>
          <button
            onClick={handleCreateAutomation}
            disabled={isCreating}
            className="mx-auto flex items-center gap-2 rounded-md bg-gray-800 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
          >
            {isCreating ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <Plus size={16} />
            )}
            Create Automation
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {filteredFlows.map((flow) => (
          <div
            key={flow.id}
            className="group flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3 transition-colors hover:bg-gray-50"
          >
            <div
              className="flex flex-grow items-center gap-4"
              onClick={() => router.push(`/automations/${flow.id}`)}
              style={{ cursor: "pointer" }}
            >
              <div
                className={`h-2.5 w-2.5 rounded-full ${flow.status === "ENABLED" ? "bg-green-500" : "bg-gray-400"}`}
              ></div>
              <div className="flex-grow">
                <p className="font-medium text-gray-800">
                  {flow.version.displayName}
                </p>
                <p className="text-sm text-gray-500">
                  Updated{" "}
                  {formatDistanceToNow(new Date(flow.updated), {
                    addSuffix: true,
                  })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <p className="hidden text-sm text-gray-400 md:block">
                {flow.version?.trigger?.type
                  ? `Trigger: ${flow.version.trigger.type}`
                  : "No Trigger"}
              </p>
              <button
                onClick={() => handleDeleteAutomation(flow.id)}
                className="p-1 text-gray-400 opacity-0 transition-opacity hover:text-red-500 group-hover:opacity-100"
                title="Delete Automation"
              >
                <Trash2 size={16} />
              </button>
              <button
                onClick={() => router.push(`/automations/${flow.id}`)}
                className="p-1 text-gray-400 hover:text-gray-700"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-5xl p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Automations</h1>
            <p className="mt-1 text-gray-600">
              Manage and create automated workflows.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative flex-grow sm:flex-grow-0">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 transform text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search automations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:outline-none focus:ring-1 focus:ring-gray-800 sm:w-64"
              />
            </div>
            <button
              onClick={handleCreateAutomation}
              disabled={isCreating}
              className="flex items-center gap-2 rounded-lg bg-gray-800 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
            >
              {isCreating ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                <Plus size={16} />
              )}
              New
            </button>
          </div>
        </div>

        {/* Content */}
        {renderContent()}
      </div>
    </div>
  );
}
