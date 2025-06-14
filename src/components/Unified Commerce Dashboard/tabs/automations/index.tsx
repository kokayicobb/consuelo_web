// src/components/Unified Commerce Dashboard/tabs/automations/index.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Plus,
  Search,
  Zap,
  Loader2,
  ChevronRight,
  Trash2,
  ArrowLeft,
  X,
  Check,
  ExternalLink,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Flow } from "../../lib/activepieces/types";
import AutomationEditor from "./automation-editor"; // We'll create this component

export default function AutomationsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [flows, setFlows] = useState<Flow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Parse URL params to determine current view
  const attemptId = searchParams.get("attempt_id");
  const flowId = searchParams.get("flow_id");
  const status = searchParams.get("status"); // 'draft' or 'published'
  const isEditing = Boolean(attemptId || flowId);

  // State for publish success modal
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [publishedFlow, setPublishedFlow] = useState<Flow | null>(null);

  // Fetch all flows
  useEffect(() => {
    if (!isEditing) {
      fetchFlows();
    }
  }, [isEditing]);

  const fetchFlows = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/automations/flows");
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const result = await response.json();
      if (result.success) {
        setFlows(result.data.data || []);
      } else {
        throw new Error(result.error?.message || "Failed to fetch flows");
      }
    } catch (err: any) {
      console.error("Error fetching flows:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle creating a new automation
  const handleCreateAutomation = () => {
    // Generate a temporary attempt ID for the new flow
    const newAttemptId = generateAttemptId();

    // Update URL without navigation
    const url = new URL(window.location.href);
    url.searchParams.set("attempt_id", newAttemptId);
    window.history.pushState({}, "", url.toString());
  };

  // Handle editing an existing automation
  const handleEditAutomation = (flow: Flow) => {
    const url = new URL(window.location.href);
    url.searchParams.set("flow_id", flow.id);
    url.searchParams.set(
      "status",
      flow.status === "ENABLED" ? "published" : "draft",
    );
    window.history.pushState({}, "", url.toString());
  };

  // Handle going back to list view
  const handleBackToList = () => {
    const url = new URL(window.location.href);
    url.searchParams.delete("attempt_id");
    url.searchParams.delete("flow_id");
    url.searchParams.delete("status");
    window.history.pushState({}, "", url.toString());

    // Refresh flows list
    fetchFlows();
  };

  // Handle flow published
  const handleFlowPublished = (flow: Flow) => {
    setPublishedFlow(flow);
    setShowPublishModal(true);

    // Update URL to reflect published state
    const url = new URL(window.location.href);
    url.searchParams.set("flow_id", flow.id);
    url.searchParams.set("status", "published");
    url.searchParams.delete("attempt_id");
    window.history.pushState({}, "", url.toString());
  };

  // Handle flow saved as draft
  const handleFlowDraftSaved = (flow: Flow) => {
    // Update URL to reflect draft state
    const url = new URL(window.location.href);
    url.searchParams.set("flow_id", flow.id);
    url.searchParams.set("status", "draft");
    url.searchParams.delete("attempt_id");
    window.history.pushState({}, "", url.toString());
  };

  // Delete an automation
  const handleDeleteAutomation = async (
    flowId: string,
    e?: React.MouseEvent,
  ) => {
    e?.stopPropagation();

    if (!confirm("Are you sure you want to delete this automation?")) return;

    try {
      const response = await fetch(`/api/automations/flows/${flowId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`Failed to delete. Status: ${response.status}`);
      }

      // Remove from local state
      setFlows(flows.filter((f) => f.id !== flowId));
    } catch (err: any) {
      console.error("Error deleting automation:", err);
      setError(err.message);
    }
  };

  // Generate a unique attempt ID
  const generateAttemptId = () => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  const filteredFlows = flows.filter((flow) =>
    flow.version.displayName.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Render the editor view
  if (isEditing) {
    return (
      <>
        <AutomationEditor
          attemptId={attemptId}
          flowId={flowId}
          onBack={handleBackToList}
          onPublish={handleFlowPublished}
          onSaveDraft={handleFlowDraftSaved}
        />

        {/* Publish Success Modal */}
        {showPublishModal && publishedFlow && (
          <PublishSuccessModal
            flow={publishedFlow}
            onClose={() => {
              setShowPublishModal(false);
              handleBackToList();
            }}
            onViewFlow={() => {
              setShowPublishModal(false);
              // Stay on the current page
            }}
          />
        )}
      </>
    );
  }

  // Render the list view
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-5xl p-4 sm:p-6 lg:p-8">
        {/* List View Header */}
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
              className="flex items-center gap-2 rounded-lg bg-gray-800 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
            >
              <Plus size={16} />
              New
            </button>
          </div>
        </div>

        {/* List View Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : error ? (
          <div className="py-20 text-center text-red-500">Error: {error}</div>
        ) : flows.length === 0 ? (
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
              className="mx-auto flex items-center gap-2 rounded-md bg-gray-800 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
            >
              <Plus size={16} />
              Create Automation
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredFlows.map((flow) => (
              <div
                key={flow.id}
                className="group flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3 transition-colors hover:bg-gray-50"
              >
                <div
                  className="flex flex-grow cursor-pointer items-center gap-4"
                  onClick={() => handleEditAutomation(flow)}
                >
                  <div
                    className={`h-2.5 w-2.5 rounded-full ${
                      flow.status === "ENABLED" ? "bg-green-500" : "bg-gray-400"
                    }`}
                  />
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
                    {flow.status === "ENABLED" ? "Published" : "Draft"}
                  </p>
                  <button
                    onClick={(e) => handleDeleteAutomation(flow.id, e)}
                    className="p-1 text-gray-400 opacity-0 transition-opacity hover:text-red-500 group-hover:opacity-100"
                    title="Delete Automation"
                  >
                    <Trash2 size={16} />
                  </button>
                  <button
                    onClick={() => handleEditAutomation(flow)}
                    className="p-1 text-gray-400 hover:text-gray-700"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Publish Success Modal Component
function PublishSuccessModal({
  flow,
  onClose,
  onViewFlow,
}: {
  flow: Flow;
  onClose: () => void;
  onViewFlow: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
        >
          <X size={20} />
        </button>

        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
          <Check className="h-6 w-6 text-green-600" />
        </div>

        <h3 className="mb-2 text-lg font-semibold text-gray-900">
          Automation Published!
        </h3>

        <p className="mb-6 text-gray-600">
          Your automation "{flow.version.displayName}" is now live and ready to
          run.
        </p>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
          >
            Back to Automations
          </button>
          <button
            onClick={onViewFlow}
            className="flex-1 rounded-lg bg-gray-800 px-4 py-2 text-white hover:bg-gray-700"
          >
            Continue Editing
          </button>
        </div>

        {flow.version.trigger.type === "WEBHOOK" && (
          <div className="mt-4 rounded-lg bg-gray-50 p-3">
            <p className="mb-1 text-sm font-medium text-gray-700">
              Webhook URL:
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 rounded bg-gray-200 px-2 py-1 text-xs text-gray-800">
                {`${window.location.origin}/webhook/${flow.id}`}
              </code>
              <button className="text-gray-600 hover:text-gray-800">
                <ExternalLink size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
