// File: src/components/Unified Commerce Dashboard/tabs/automations/create.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Loader2,
  Zap,
  Webhook,
  Clock,
  FileText,
  Mail,
  MessageSquare,
  Search,
} from "lucide-react";

export default function CreateAutomationPage() {
  const router = useRouter();
  const [step, setStep] = useState<"basics" | "trigger">("basics");
  const [automationName, setAutomationName] = useState("Untitled Automation");
  const [description, setDescription] = useState("");
  const [selectedTrigger, setSelectedTrigger] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Trigger types available
  const triggerTypes = [
    {
      id: "webhook",
      name: "Webhook",
      description: "Trigger when data is received via HTTP webhook",
      icon: <Webhook className="h-5 w-5 text-yellow-500" />,
    },
    {
      id: "schedule",
      name: "Schedule",
      description: "Run on a regular schedule (hourly, daily, weekly)",
      icon: <Clock className="h-5 w-5 text-purple-500" />,
    },
    {
      id: "form",
      name: "Form Submission",
      description: "Trigger when a form is submitted on your website",
      icon: <FileText className="h-5 w-5 text-indigo-500" />,
    },
    {
      id: "email",
      name: "Email Received",
      description: "Trigger when an email is received in a mailbox",
      icon: <Mail className="h-5 w-5 text-red-500" />,
    },
    {
      id: "sms",
      name: "SMS Received",
      description: "Trigger when an SMS is received on your number",
      icon: <MessageSquare className="h-5 w-5 text-lime-600" />,
    },
  ];

  // Filter triggers based on search term
  const filteredTriggers = searchTerm
    ? triggerTypes.filter(
        (trigger) =>
          trigger.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          trigger.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : triggerTypes;

  // Handle the back button
  const handleBack = () => {
    if (step === "trigger") {
      setStep("basics");
    } else {
      router.push("/automations");
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (step === "basics") {
      setStep("trigger");
      return;
    }

    if (!selectedTrigger) {
      setError("Please select a trigger for your automation");
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      // Create the automation with basic details
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

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error?.message || "Failed to create automation");
      }

      // Redirect to the editor with the new automation ID
      router.push(`/automations/${result.data.id}`);
    } catch (err: any) {
      console.error("Error creating automation:", err);
      setError(err.message);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <button
            onClick={handleBack}
            className="flex h-8 w-8 items-center justify-center rounded-full text-gray-500 hover:bg-gray-200"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            Create New Automation
          </h1>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
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
                      required
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
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
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
                  onClick={handleBack}
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
        </form>

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
      </div>
    </div>
  );
}