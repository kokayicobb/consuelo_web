// src/components/Unified Commerce Dashboard/tabs/automations/index.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, Zap, Loader2, ChevronRight, Trash2, ArrowLeft } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Flow } from "../../lib/automations/types";

export default function AutomationsPage() {
  const router = useRouter();
  const [flows, setFlows] = useState<Flow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  // State for the two-step form
  const [currentView, setCurrentView] = useState<"list" | "create">("list");
  const [step, setStep] = useState<"basics" | "trigger">("basics");
  const [automationName, setAutomationName] = useState("Untitled Automation");
  const [description, setDescription] = useState("");
  const [selectedTrigger, setSelectedTrigger] = useState<string | null>(null);
  const [triggerSearchTerm, setTriggerSearchTerm] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  // Trigger types available
  const triggerTypes = [
    {
      id: "webhook",
      name: "Webhook",
      description: "Trigger when data is received via HTTP webhook",
      icon: <Zap className="h-5 w-5 text-yellow-500" />,
    },
    {
      id: "schedule",
      name: "Schedule",
      description: "Run on a regular schedule (hourly, daily, weekly)",
      icon: <Loader2 className="h-5 w-5 text-purple-500" />,
    },
    {
      id: "form",
      name: "Form Submission",
      description: "Trigger when a form is submitted on your website",
      icon: <ChevronRight className="h-5 w-5 text-indigo-500" />,
    },
    {
      id: "email",
      name: "Email Received",
      description: "Trigger when an email is received in a mailbox",
      icon: <Trash2 className="h-5 w-5 text-red-500" />,
    },
    {
      id: "sms",
      name: "SMS Received",
      description: "Trigger when an SMS is received on your number",
      icon: <Search className="h-5 w-5 text-lime-600" />,
    },
  ];

  // Filter triggers based on search term
  const filteredTriggers = triggerSearchTerm
    ? triggerTypes.filter(
        (trigger) =>
          trigger.name.toLowerCase().includes(triggerSearchTerm.toLowerCase()) ||
          trigger.description.toLowerCase().includes(triggerSearchTerm.toLowerCase())
      )
    : triggerTypes;

  // Check for hash in URL on mount and when hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      // Check if we have a subtab after the main #automations hash
      if (hash.includes("#automations#create")) {
        setCurrentView("create");
      } else {
        setCurrentView("list");
        // Reset form state when going back to list view
        resetFormState();
      }
    };

    // Initial check
    handleHashChange();

    // Listen for hash changes
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  // Reset form state
  const resetFormState = () => {
    setStep("basics");
    setAutomationName("Untitled Automation");
    setDescription("");
    setSelectedTrigger(null);
    setTriggerSearchTerm("");
    setValidationError(null);
  };

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

  // Go to create view
  const handleCreateAutomation = () => {
    // Update the URL hash to show the create view
    window.location.hash = "#automations#create";
    setCurrentView("create");
    resetFormState();
  };

  // Go back to list view
  const handleBackToList = () => {
    window.location.hash = "#automations";
    setCurrentView("list");
    resetFormState();
  };

  // Handle form submission
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    
    // Step 1: Check basic info
    if (step === "basics") {
      if (!automationName.trim()) {
        setValidationError("Please enter a name for your automation");
        return;
      }
      setStep("trigger");
      return;
    }

    // Step 2: Validate trigger selection
    if (!selectedTrigger) {
      setValidationError("Please select a trigger for your automation");
      return;
    }

    // Start creating the automation
    setIsCreating(true);
    setError(null);
    
    try {
      console.log("Creating new automation");
      const response = await fetch("/api/automations/flows", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          displayName: automationName,
          description,
          triggerType: selectedTrigger
        }),
      });

      console.log("Create response status:", response.status);

      if (!response.ok) {
        let errorMessage = `Failed to create automation. Status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error?.message || errorMessage;
        } catch (parseError) {
          console.error("Failed to parse error response:", parseError);
        }
        throw new Error(errorMessage);
      }

      const responseText = await response.text();
      console.log("Create raw response text:", responseText);

      // Only try to parse if there's actual content
      if (responseText.trim()) {
        try {
          const result = JSON.parse(responseText);

          // Check for both HTTP and application-level errors
          if (!result.success) {
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
      setValidationError(err.message);
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

  // Render list view content
  const renderListContent = () => {
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
            className="mx-auto flex items-center gap-2 rounded-md bg-gray-800 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
          >
            <Plus size={16} />
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

  // Render creation form
  const renderCreationForm = () => {
    return (
      <form onSubmit={handleFormSubmit}>
        {/* Validation error */}
        {validationError && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-red-600">
            {validationError}
          </div>
        )}
        
        {/* Step 1: Basic Info */}
        {step === "basics" && (
          <div className="space-y-6">
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-gray-800">
                Basic Information
              </h2>
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="name"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    Automation Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={automationName}
                    onChange={(e) => setAutomationName(e.target.value)}
                    placeholder="e.g., New Lead Follow-up"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
                  />
                </div>
                
                <div>
                  <label
                    htmlFor="description"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    Description (optional)
                  </label>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="What does this automation do?"
                    rows={3}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                className="rounded-lg bg-gray-800 px-4 py-2 text-white hover:bg-gray-700"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Select Trigger */}
        {step === "trigger" && (
          <div className="space-y-6">
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-gray-800">
                Select a Trigger
              </h2>
              <p className="mb-4 text-gray-600">
                Choose what will start your automation.
              </p>
              
              {/* Search bar */}
              <div className="mb-6 relative">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 transform text-gray-400"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Search triggers..."
                  value={triggerSearchTerm}
                  onChange={(e) => setTriggerSearchTerm(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 pl-10 pr-4 py-2 focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
                />
              </div>
              
              {/* Trigger list */}
              <div className="grid gap-3 md:grid-cols-2">
                {filteredTriggers.map((trigger) => (
                  <div
                    key={trigger.id}
                    className={`cursor-pointer rounded-lg border p-4 transition-colors ${
                      selectedTrigger === trigger.id
                        ? "border-gray-800 bg-gray-50"
                        : "border-gray-200 hover:border-gray-400"
                    }`}
                    onClick={() => setSelectedTrigger(trigger.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md">
                        {trigger.icon}
                      </div>
                      <div>
                        <div className="font-medium text-gray-800">
                          {trigger.name}
                        </div>
                        <p className="mt-1 text-sm text-gray-500">
                          {trigger.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {filteredTriggers.length === 0 && (
                <div className="py-8 text-center text-gray-500">
                  No triggers match your search.
                </div>
              )}
            </div>
            
            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => setStep("basics")}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={!selectedTrigger || isCreating}
                className="rounded-lg bg-gray-800 px-4 py-2 text-white hover:bg-gray-700 disabled:opacity-50"
              >
                {isCreating ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating...
                  </div>
                ) : (
                  "Create Automation"
                )}
              </button>
            </div>
          </div>
        )}

        {/* Progress indicator */}
        <div className="mt-8 flex justify-center">
          <div className="flex items-center gap-2">
            <div
              className={`h-2.5 w-2.5 rounded-full ${
                step === "basics" ? "bg-gray-800" : "bg-gray-300"
              }`}
            ></div>
            <div
              className={`h-2.5 w-2.5 rounded-full ${
                step === "trigger" ? "bg-gray-800" : "bg-gray-300"
              }`}
            ></div>
          </div>
        </div>
      </form>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-5xl p-4 sm:p-6 lg:p-8">
        {currentView === "list" ? (
          <>
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

            {/* List View Content */}
            {renderListContent()}
          </>
        ) : (
          <>
            {/* Create View */}
            <div className="mb-6 flex items-center gap-3">
              <button
                onClick={handleBackToList}
                className="flex h-8 w-8 items-center justify-center rounded-full text-gray-500 hover:bg-gray-200"
              >
                <ArrowLeft size={20} />
              </button>
              <h1 className="text-2xl font-bold text-gray-900">
                Create New Automation
              </h1>
            </div>

            {/* Create View Content */}
            {renderCreationForm()}
          </>
        )}
      </div>
    </div>
  );
}