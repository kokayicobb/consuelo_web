// src/components/Unified Commerce Dashboard/tabs/automations/AutomationEditor.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ArrowLeft,
  Loader2,
  Zap,
  Plus,
  Settings,
  Play,
  Save,
  ChevronDown,
  MoreVertical,
  Webhook,
  Clock,
  FileText,
  Mail,
  MessageSquare,
  Search,
  X,
  Check,
  AlertCircle,
  Copy,
  ExternalLink,
} from "lucide-react";
import {
  Flow,
  CreateFlowData,
  UpdateFlowData,
} from "../../lib/automations/types";

interface AutomationEditorProps {
  attemptId?: string | null;
  flowId?: string | null;
  onBack: () => void;
  onPublish: (flow: Flow) => void;
  onSaveDraft: (flow: Flow) => void;
}

interface WorkflowStep {
  id: string;
  type: "trigger" | "action";
  name: string;
  displayName: string;
  description?: string;
  icon: React.ReactNode;
  config: Record<string, any>;
  isValid: boolean;
  isExpanded: boolean;
}

// Available trigger types
const TRIGGER_TYPES = [
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

// Available action types
const ACTION_TYPES = [
  {
    id: "webhook",
    name: "Send Webhook",
    description: "Send data to another service via HTTP",
    icon: <Webhook className="h-5 w-5 text-blue-500" />,
  },
  {
    id: "email",
    name: "Send Email",
    description: "Send an email to specified recipients",
    icon: <Mail className="h-5 w-5 text-red-500" />,
  },
  {
    id: "sms",
    name: "Send SMS",
    description: "Send an SMS message",
    icon: <MessageSquare className="h-5 w-5 text-green-500" />,
  },
  {
    id: "delay",
    name: "Delay",
    description: "Wait for a specified amount of time",
    icon: <Clock className="h-5 w-5 text-orange-500" />,
  },
  {
    id: "branch",
    name: "Conditional Branch",
    description: "Split the workflow based on conditions",
    icon: <Zap className="h-5 w-5 text-purple-500" />,
  },
];

export default function AutomationEditor({
  attemptId,
  flowId,
  onBack,
  onPublish,
  onSaveDraft,
}: AutomationEditorProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [flow, setFlow] = useState<Flow | null>(null);

  // Workflow state
  const [automationName, setAutomationName] = useState("Untitled Automation");
  const [description, setDescription] = useState("");
  const [steps, setSteps] = useState<WorkflowStep[]>([]);
  const [isDirty, setIsDirty] = useState(false);

  // UI state
  const [showTriggerPicker, setShowTriggerPicker] = useState(false);
  const [showActionPicker, setShowActionPicker] = useState(false);
  const [addActionAfterStepId, setAddActionAfterStepId] = useState<
    string | null
  >(null);
  const [triggerSearchTerm, setTriggerSearchTerm] = useState("");
  const [actionSearchTerm, setActionSearchTerm] = useState("");
  const [testResult, setTestResult] = useState<any>(null);
  const [showTestResult, setShowTestResult] = useState(false);

  // Load existing flow if flowId is provided
  useEffect(() => {
    if (flowId) {
      loadFlow(flowId);
    } else if (attemptId) {
      // New flow - show trigger picker immediately
      setShowTriggerPicker(true);
    }
  }, [flowId, attemptId]);

  // Track changes
  useEffect(() => {
    setIsDirty(true);
  }, [automationName, description, steps]);

  // Load existing flow
  const loadFlow = async (id: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/automations/flows/${id}`);
      if (!response.ok) throw new Error("Failed to load flow");

      const result = await response.json();
      if (result.success) {
        setFlow(result.data);
        setAutomationName(result.data.version.displayName);
        setDescription(result.data.metadata?.description || "");

        // Convert flow structure to steps
        const loadedSteps = convertFlowToSteps(result.data);
        setSteps(loadedSteps);
        setIsDirty(false);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Convert flow structure to editable steps
  const convertFlowToSteps = (flow: Flow): WorkflowStep[] => {
    const steps: WorkflowStep[] = [];

    // Add trigger
    const trigger = flow.version.trigger;
    const triggerType = TRIGGER_TYPES.find(
      (t) => t.id === trigger.settings.triggerName,
    );

    steps.push({
      id: generateStepId(),
      type: "trigger",
      name: trigger.settings.triggerName || "webhook",
      displayName: trigger.displayName,
      description: triggerType?.description,
      icon: triggerType?.icon || <Zap className="h-5 w-5" />,
      config: trigger.settings.input || {},
      isValid: trigger.valid,
      isExpanded: false,
    });

    // Add actions
    let currentAction = trigger.nextAction;
    while (currentAction) {
      const actionType = ACTION_TYPES.find(
        (a) => a.id === currentAction.settings.actionName,
      );

      steps.push({
        id: generateStepId(),
        type: "action",
        name: currentAction.settings.actionName || "action",
        displayName: currentAction.displayName,
        description: actionType?.description,
        icon: actionType?.icon || <Zap className="h-5 w-5" />,
        config: currentAction.settings.input || {},
        isValid: currentAction.valid,
        isExpanded: false,
      });

      currentAction = currentAction.nextAction;
    }

    return steps;
  };

  // Add trigger
  const handleAddTrigger = (triggerType: (typeof TRIGGER_TYPES)[0]) => {
    const newStep: WorkflowStep = {
      id: generateStepId(),
      type: "trigger",
      name: triggerType.id,
      displayName: triggerType.name,
      description: triggerType.description,
      icon: triggerType.icon,
      config: {},
      isValid: false,
      isExpanded: true,
    };

    setSteps([newStep]);
    setShowTriggerPicker(false);
    setTriggerSearchTerm("");
  };

  // Add action
  const handleAddAction = (actionType: (typeof ACTION_TYPES)[0]) => {
    const newStep: WorkflowStep = {
      id: generateStepId(),
      type: "action",
      name: actionType.id,
      displayName: actionType.name,
      description: actionType.description,
      icon: actionType.icon,
      config: {},
      isValid: false,
      isExpanded: true,
    };

    if (addActionAfterStepId) {
      const index = steps.findIndex((s) => s.id === addActionAfterStepId);
      const newSteps = [...steps];
      newSteps.splice(index + 1, 0, newStep);
      setSteps(newSteps);
    } else {
      setSteps([...steps, newStep]);
    }

    setShowActionPicker(false);
    setAddActionAfterStepId(null);
    setActionSearchTerm("");
  };

  // Update step config
  const handleUpdateStep = (stepId: string, updates: Partial<WorkflowStep>) => {
    setSteps(
      steps.map((step) =>
        step.id === stepId ? { ...step, ...updates } : step,
      ),
    );
  };

  // Delete step
  const handleDeleteStep = (stepId: string) => {
    setSteps(steps.filter((step) => step.id !== stepId));
  };

  // Save as draft
  const handleSaveDraft = async () => {
    setIsSaving(true);
    setError(null);

    try {
      const flowData = buildFlowData();

      let savedFlow: Flow;
      if (flow) {
        // Update existing flow
        const response = await fetch(`/api/automations/flows/${flow.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(flowData),
        });

        if (!response.ok) throw new Error("Failed to save draft");
        const result = await response.json();
        savedFlow = result.data;
      } else {
        // Create new flow
        const response = await fetch("/api/automations/flows", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(flowData),
        });

        if (!response.ok) throw new Error("Failed to create draft");
        const result = await response.json();
        savedFlow = result.data;
      }

      setFlow(savedFlow);
      setIsDirty(false);
      onSaveDraft(savedFlow);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Publish flow
  const handlePublish = async () => {
    setIsSaving(true);
    setError(null);

    try {
      // First save the flow
      await handleSaveDraft();

      if (!flow) throw new Error("Flow must be saved before publishing");

      // Then activate it
      const response = await fetch(
        `/api/automations/flows/${flow.id}/activate`,
        {
          method: "POST",
        },
      );

      if (!response.ok) throw new Error("Failed to publish flow");
      const result = await response.json();

      setFlow(result.data);
      onPublish(result.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Test flow
  const handleTestFlow = async () => {
    try {
      // Mock test for now
      setTestResult({
        success: true,
        executionTime: 234,
        steps: steps.map((step) => ({
          name: step.displayName,
          status: "success",
          duration: Math.floor(Math.random() * 100),
        })),
      });
      setShowTestResult(true);
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Build flow data from steps
  const buildFlowData = (): CreateFlowData | UpdateFlowData => {
    const trigger = steps.find((s) => s.type === "trigger");
    if (!trigger) throw new Error("Flow must have a trigger");

    // Build linked action structure
    let currentAction = null;
    for (let i = steps.length - 1; i >= 0; i--) {
      const step = steps[i];
      if (step.type === "action") {
        currentAction = {
          name: step.name,
          displayName: step.displayName,
          valid: step.isValid,
          type: "PIECE_ACTION",
          settings: {
            actionName: step.name,
            input: step.config,
          },
          nextAction: currentAction,
        };
      }
    }

    return {
      displayName: automationName,
      metadata: { description },
      trigger: {
        name: trigger.name,
        displayName: trigger.displayName,
        valid: trigger.isValid,
        type: "PIECE_TRIGGER",
        settings: {
          triggerName: trigger.name,
          input: trigger.config,
        },
        nextAction: currentAction,
      },
    };
  };

  // Generate unique step ID
  const generateStepId = () => {
    return `step-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  // Filter triggers/actions
  const filteredTriggers = TRIGGER_TYPES.filter(
    (t) =>
      t.name.toLowerCase().includes(triggerSearchTerm.toLowerCase()) ||
      t.description?.toLowerCase().includes(triggerSearchTerm.toLowerCase()),
  );

  const filteredActions = ACTION_TYPES.filter(
    (a) =>
      a.name.toLowerCase().includes(actionSearchTerm.toLowerCase()) ||
      a.description?.toLowerCase().includes(actionSearchTerm.toLowerCase()),
  );

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-gray-50">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="flex h-8 w-8 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100"
            >
              <ArrowLeft size={20} />
            </button>

            <div>
              <input
                type="text"
                value={automationName}
                onChange={(e) => setAutomationName(e.target.value)}
                className="border-none bg-transparent text-lg font-semibold text-gray-900 outline-none focus:ring-0"
                placeholder="Automation name"
              />
              <p className="text-sm text-gray-500">
                {flow?.status === "ENABLED" ? "Published" : "Draft"} •
                {isDirty ? " Unsaved changes" : " All changes saved"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleTestFlow}
              className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <Play size={16} />
              Test
            </button>

            <button
              onClick={handleSaveDraft}
              disabled={!isDirty || isSaving}
              className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              <Save size={16} />
              Save
            </button>

            <button
              onClick={handlePublish}
              disabled={isSaving || steps.length === 0}
              className="flex items-center gap-2 rounded-lg bg-gray-800 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check size={16} />
              )}
              Publish
            </button>
          </div>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="mx-4 mt-4 rounded-lg bg-red-50 p-3 text-red-600">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} />
            {error}
          </div>
        </div>
      )}

      {/* Main editor area */}
      <div className="flex-1 overflow-y-auto p-4 lg:p-8">
        <div className="mx-auto max-w-3xl">
          {/* Workflow steps */}
          <div className="space-y-3">
            {steps.length === 0 ? (
              <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
                <Zap className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                <h3 className="mb-2 text-lg font-medium text-gray-900">
                  Start building your automation
                </h3>
                <p className="mb-4 text-gray-600">
                  Choose a trigger to begin your workflow
                </p>
                <button
                  onClick={() => setShowTriggerPicker(true)}
                  className="inline-flex items-center gap-2 rounded-lg bg-gray-800 px-4 py-2 text-white hover:bg-gray-700"
                >
                  <Plus size={16} />
                  Add Trigger
                </button>
              </div>
            ) : (
              <>
                {steps.map((step, index) => (
                  <div key={step.id}>
                    <StepCard
                      step={step}
                      onUpdate={(updates) => handleUpdateStep(step.id, updates)}
                      onDelete={() => handleDeleteStep(step.id)}
                      onExpand={() =>
                        handleUpdateStep(step.id, {
                          isExpanded: !step.isExpanded,
                        })
                      }
                    />

                    {/* Add action button between steps */}
                    {index < steps.length - 1 && (
                      <div className="relative py-2">
                        <div className="absolute left-1/2 top-0 h-full w-0.5 -translate-x-1/2 bg-gray-200" />
                      </div>
                    )}
                  </div>
                ))}

                {/* Add action button at the end */}
                <div className="mt-3 flex justify-center">
                  <button
                    onClick={() => {
                      setAddActionAfterStepId(
                        steps[steps.length - 1]?.id || null,
                      );
                      setShowActionPicker(true);
                    }}
                    className="flex items-center gap-2 rounded-lg border-2 border-dashed border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:border-gray-400 hover:text-gray-700"
                  >
                    <Plus size={16} />
                    Add Action
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Trigger Picker Modal */}
      {showTriggerPicker && (
        <PickerModal
          title="Choose a Trigger"
          subtitle="Select what will start your automation"
          searchTerm={triggerSearchTerm}
          onSearchChange={setTriggerSearchTerm}
          onClose={() => {
            setShowTriggerPicker(false);
            setTriggerSearchTerm("");
          }}
        >
          <div className="grid gap-3 sm:grid-cols-2">
            {filteredTriggers.map((trigger) => (
              <button
                key={trigger.id}
                onClick={() => handleAddTrigger(trigger)}
                className="flex items-start gap-3 rounded-lg border border-gray-200 p-4 text-left transition-colors hover:border-gray-400 hover:bg-gray-50"
              >
                <div className="mt-0.5">{trigger.icon}</div>
                <div>
                  <div className="font-medium text-gray-900">
                    {trigger.name}
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    {trigger.description}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </PickerModal>
      )}

      {/* Action Picker Modal */}
      {showActionPicker && (
        <PickerModal
          title="Choose an Action"
          subtitle="Select what this step should do"
          searchTerm={actionSearchTerm}
          onSearchChange={setActionSearchTerm}
          onClose={() => {
            setShowActionPicker(false);
            setAddActionAfterStepId(null);
            setActionSearchTerm("");
          }}
        >
          <div className="grid gap-3 sm:grid-cols-2">
            {filteredActions.map((action) => (
              <button
                key={action.id}
                onClick={() => handleAddAction(action)}
                className="flex items-start gap-3 rounded-lg border border-gray-200 p-4 text-left transition-colors hover:border-gray-400 hover:bg-gray-50"
              >
                <div className="mt-0.5">{action.icon}</div>
                <div>
                  <div className="font-medium text-gray-900">{action.name}</div>
                  <p className="mt-1 text-sm text-gray-500">
                    {action.description}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </PickerModal>
      )}

      {/* Test Results Modal */}
      {showTestResult && testResult && (
        <TestResultModal
          result={testResult}
          onClose={() => setShowTestResult(false)}
        />
      )}
    </div>
  );
}

// Step Card Component
function StepCard({
  step,
  onUpdate,
  onDelete,
  onExpand,
}: {
  step: WorkflowStep;
  onUpdate: (updates: Partial<WorkflowStep>) => void;
  onDelete: () => void;
  onExpand: () => void;
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
      <div
        className="flex cursor-pointer items-center justify-between p-4"
        onClick={onExpand}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
            {step.icon}
          </div>
          <div>
            <div className="font-medium text-gray-900">{step.displayName}</div>
            <p className="text-sm text-gray-500">{step.description}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {step.isValid && (
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100">
              <Check className="h-4 w-4 text-green-600" />
            </div>
          )}
          <ChevronDown
            className={`h-5 w-5 text-gray-400 transition-transform ${
              step.isExpanded ? "rotate-180" : ""
            }`}
          />
        </div>
      </div>

      {step.isExpanded && (
        <div className="border-t border-gray-200 p-4">
          {/* Step configuration UI would go here */}
          <div className="space-y-4">
            {step.type === "trigger" && step.name === "webhook" && (
              <WebhookConfig
                config={step.config}
                onChange={(config) => onUpdate({ config, isValid: true })}
              />
            )}

            {step.type === "trigger" && step.name === "schedule" && (
              <ScheduleConfig
                config={step.config}
                onChange={(config) => onUpdate({ config, isValid: true })}
              />
            )}

            {step.type === "action" && step.name === "email" && (
              <EmailConfig
                config={step.config}
                onChange={(config) => onUpdate({ config, isValid: true })}
              />
            )}

            {/* Add more configuration components for other step types */}
          </div>

          <div className="mt-4 flex justify-end">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="text-sm text-red-600 hover:text-red-700"
            >
              Delete step
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Picker Modal Component
function PickerModal({
  title,
  subtitle,
  searchTerm,
  onSearchChange,
  onClose,
  children,
}: {
  title: string;
  subtitle: string;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative mx-4 h-[80vh] w-full max-w-3xl overflow-hidden rounded-lg bg-white shadow-xl">
        <div className="border-b border-gray-200 p-6">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>

          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          <p className="mt-1 text-gray-600">{subtitle}</p>

          <div className="relative mt-4">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
              autoFocus
            />
          </div>
        </div>

        <div
          className="overflow-y-auto p-6"
          style={{ maxHeight: "calc(80vh - 180px)" }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

// Test Result Modal
function TestResultModal({
  result,
  onClose,
}: {
  result: any;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative mx-4 w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
        >
          <X size={20} />
        </button>

        <h3 className="mb-4 text-lg font-semibold text-gray-900">
          Test Results
        </h3>

        {result.success ? (
          <>
            <div className="mb-4 flex items-center gap-2 text-green-600">
              <Check className="h-5 w-5" />
              <span>Test completed successfully</span>
            </div>

            <div className="space-y-2">
              {result.steps.map((step: any, index: number) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-lg bg-gray-50 p-3"
                >
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium">{step.name}</span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {step.duration}ms
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-lg bg-blue-50 p-3">
              <p className="text-sm text-blue-800">
                Total execution time: <strong>{result.executionTime}ms</strong>
              </p>
            </div>
          </>
        ) : (
          <div className="text-red-600">Test failed</div>
        )}

        <button
          onClick={onClose}
          className="mt-6 w-full rounded-lg bg-gray-800 py-2 text-white hover:bg-gray-700"
        >
          Close
        </button>
      </div>
    </div>
  );
}

// Configuration Components
function WebhookConfig({
  config,
  onChange,
}: {
  config: Record<string, any>;
  onChange: (config: Record<string, any>) => void;
}) {
  const webhookUrl = `${window.location.origin}/webhook/{{workflow_id}}`;

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Webhook URL
        </label>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={webhookUrl}
            readOnly
            className="flex-1 rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm"
          />
          <button
            onClick={() => navigator.clipboard.writeText(webhookUrl)}
            className="rounded-lg border border-gray-300 p-2 hover:bg-gray-50"
          >
            <Copy size={16} />
          </button>
        </div>
        <p className="mt-1 text-xs text-gray-500">
          Send POST requests to this URL to trigger the automation
        </p>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Request Method
        </label>
        <select
          value={config.method || "POST"}
          onChange={(e) => onChange({ ...config, method: e.target.value })}
          className="w-full rounded-lg border border-gray-300 px-3 py-2"
        >
          <option value="POST">POST</option>
          <option value="GET">GET</option>
          <option value="PUT">PUT</option>
        </select>
      </div>
    </div>
  );
}

function ScheduleConfig({
  config,
  onChange,
}: {
  config: Record<string, any>;
  onChange: (config: Record<string, any>) => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Schedule Type
        </label>
        <select
          value={config.scheduleType || "interval"}
          onChange={(e) =>
            onChange({ ...config, scheduleType: e.target.value })
          }
          className="w-full rounded-lg border border-gray-300 px-3 py-2"
        >
          <option value="interval">Interval</option>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="cron">Custom (Cron)</option>
        </select>
      </div>

      {config.scheduleType === "interval" && (
        <div className="flex gap-2">
          <input
            type="number"
            value={config.intervalValue || 1}
            onChange={(e) =>
              onChange({ ...config, intervalValue: e.target.value })
            }
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2"
          />
          <select
            value={config.intervalUnit || "hours"}
            onChange={(e) =>
              onChange({ ...config, intervalUnit: e.target.value })
            }
            className="rounded-lg border border-gray-300 px-3 py-2"
          >
            <option value="minutes">Minutes</option>
            <option value="hours">Hours</option>
            <option value="days">Days</option>
          </select>
        </div>
      )}

      {config.scheduleType === "cron" && (
        <div>
          <input
            type="text"
            value={config.cronExpression || "0 * * * *"}
            onChange={(e) =>
              onChange({ ...config, cronExpression: e.target.value })
            }
            placeholder="0 * * * *"
            className="w-full rounded-lg border border-gray-300 px-3 py-2"
          />
          <p className="mt-1 text-xs text-gray-500">
            Enter a valid cron expression
          </p>
        </div>
      )}
    </div>
  );
}

function EmailConfig({
  config,
  onChange,
}: {
  config: Record<string, any>;
  onChange: (config: Record<string, any>) => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          To
        </label>
        <input
          type="email"
          value={config.to || ""}
          onChange={(e) => onChange({ ...config, to: e.target.value })}
          placeholder="recipient@example.com"
          className="w-full rounded-lg border border-gray-300 px-3 py-2"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Subject
        </label>
        <input
          type="text"
          value={config.subject || ""}
          onChange={(e) => onChange({ ...config, subject: e.target.value })}
          placeholder="Email subject"
          className="w-full rounded-lg border border-gray-300 px-3 py-2"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Body
        </label>
        <textarea
          value={config.body || ""}
          onChange={(e) => onChange({ ...config, body: e.target.value })}
          placeholder="Email content..."
          rows={4}
          className="w-full rounded-lg border border-gray-300 px-3 py-2"
        />
      </div>
    </div>
  );
}
