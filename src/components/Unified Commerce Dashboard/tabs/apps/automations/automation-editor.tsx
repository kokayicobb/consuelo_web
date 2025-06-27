// src/components/Unified Commerce Dashboard/tabs/automations/AutomationEditor.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import {
  TRIGGER_INTEGRATIONS,
  ACTION_INTEGRATIONS,
  IntegrationCategory,
  TriggerType,
  ActionType,
  Integration,
} from "../../../lib/automations/integrations";

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
  Shield,
} from "lucide-react";
import {
  Flow,
  CreateFlowData,
  UpdateFlowData,
} from "../../../lib/automations/types";
import {
  INTEGRATION_CONFIG_COMPONENTS,
  GenericTriggerConfig,
  GenericActionConfig,
} from "./components/Integrations-config";

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
  integrationId: string; // Add this
  name: string;
  displayName: string;
  description?: string;
  icon: React.ReactNode;
  config: Record<string, any>;
  isValid: boolean;
  isExpanded: boolean;
  requiresAuth?: boolean;
  authType?: string;
  credentialId?: string; // Add this
}

// Group integrations by category for better UX
const groupIntegrationsByCategory = (integrations: Integration[]) => {
  const grouped: Record<string, Integration[]> = {};

  integrations.forEach((integration) => {
    if (!grouped[integration.category]) {
      grouped[integration.category] = [];
    }
    grouped[integration.category].push(integration);
  });

  return grouped;
};

// Use the real integrations from our integrations file
const GROUPED_TRIGGERS = groupIntegrationsByCategory(TRIGGER_INTEGRATIONS);
const GROUPED_ACTIONS = groupIntegrationsByCategory(ACTION_INTEGRATIONS);

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
  // Generate unique step ID
  const generateStepId = () => {
    return `step-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };
  // Track changes
  useEffect(() => {
    setIsDirty(true);
  }, [automationName, description, steps]);
  const convertFlowToSteps = (flow: Flow): WorkflowStep[] => {
    const steps: WorkflowStep[] = [];

    // Add trigger
    const trigger = flow.version.trigger;
    const triggerIntegration = TRIGGER_INTEGRATIONS.find(
      (t) =>
        t.id === trigger.settings.triggerName ||
        t.id === trigger.settings.pieceName + "_trigger",
    );

    steps.push({
      id: generateStepId(),
      type: "trigger",
      integrationId:
        triggerIntegration?.id || trigger.settings.triggerName || "webhook",
      name: trigger.settings.triggerName || "webhook",
      displayName: trigger.displayName,
      description: triggerIntegration?.description,
      icon: triggerIntegration?.icon || <Zap className="h-5 w-5" />,
      config: trigger.settings.input || {},
      isValid: trigger.valid,
      isExpanded: false,
      requiresAuth: triggerIntegration?.requiresAuth,
      authType: triggerIntegration?.authType,
      credentialId: trigger.settings.credentialId,
    });

    // Add actions
    let currentAction = trigger.nextAction;
    while (currentAction) {
      const actionIntegration = ACTION_INTEGRATIONS.find(
        (a) =>
          a.id === currentAction.settings.actionName ||
          a.id === currentAction.settings.pieceName + "_action",
      );

      steps.push({
        id: generateStepId(),
        type: "action",
        integrationId:
          actionIntegration?.id ||
          currentAction.settings.actionName ||
          "webhook",
        name: currentAction.settings.actionName || "action",
        displayName: currentAction.displayName,
        description: actionIntegration?.description,
        icon: actionIntegration?.icon || <Zap className="h-5 w-5" />,
        config: currentAction.settings.input || {},
        isValid: currentAction.valid,
        isExpanded: false,
        requiresAuth: actionIntegration?.requiresAuth,
        authType: actionIntegration?.authType,
        credentialId: currentAction.settings.credentialId,
      });

      currentAction = currentAction.nextAction;
    }

    return steps;
  };
  // Load existing flow
  const loadFlow = useCallback(async (id: string) => {
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
  }, []); // Empty dependency array since it doesn't depend on any props or state

  useEffect(() => {
    if (flowId) {
      loadFlow(flowId);
    } else if (attemptId) {
      // New flow - show trigger picker immediately
      setShowTriggerPicker(true);
    }
  }, [flowId, attemptId, loadFlow]);
  // // Convert flow structure to editable steps

  // 6. Add helper function to get integration credentials:
  const getIntegrationCredentials = async (integrationId: string) => {
    try {
      // TODO: Implement actual credential fetching
      // This would call your API to get available credentials for the integration
      const response = await fetch(
        `/api/automations/credentials?integration=${integrationId}`,
      );
      const result = await response.json();
      return result.data || [];
    } catch (error) {
      console.error("Failed to fetch credentials:", error);
      return [];
    }
  };

  // Add trigger
  const handleAddTrigger = (trigger: TriggerType) => {
    const newStep: WorkflowStep = {
      id: generateStepId(),
      type: "trigger",
      integrationId: trigger.id,
      name: trigger.id,
      displayName: trigger.name,
      description: trigger.description,
      icon: trigger.icon,
      config: {},
      isValid: false,
      isExpanded: true,
      requiresAuth: trigger.requiresAuth,
      authType: trigger.authType,
    };

    setSteps([newStep]);
    setShowTriggerPicker(false);
    setTriggerSearchTerm("");
  };

  // Add action
  const handleAddAction = (action: ActionType) => {
    const newStep: WorkflowStep = {
      id: generateStepId(),
      type: "action",
      integrationId: action.id,
      name: action.id,
      displayName: action.name,
      description: action.description,
      icon: action.icon,
      config: {},
      isValid: false,
      isExpanded: true,
      requiresAuth: action.requiresAuth,
      authType: action.authType,
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
          type: "PIECE_ACTION" as const,
          settings: {
            pieceName: step.integrationId.replace("_action", ""),
            actionName: step.integrationId,
            input: step.config,
            credentialId: step.credentialId,
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
        type: "PIECE_TRIGGER" as const,
        settings: {
          pieceName: trigger.integrationId.replace("_trigger", ""),
          triggerName: trigger.integrationId,
          input: trigger.config,
          credentialId: trigger.credentialId,
        },
        nextAction: currentAction,
      },
    };
  };

  const filterIntegrationsBySearch = (
    grouped: Record<string, Integration[]>,
    searchTerm: string,
  ): Record<string, Integration[]> => {
    if (!searchTerm) return grouped;

    const filtered: Record<string, Integration[]> = {};
    const lowercaseSearch = searchTerm.toLowerCase();

    Object.entries(grouped).forEach(([category, integrations]) => {
      const matchingIntegrations = integrations.filter(
        (integration) =>
          integration.name.toLowerCase().includes(lowercaseSearch) ||
          integration.description?.toLowerCase().includes(lowercaseSearch) ||
          category.toLowerCase().includes(lowercaseSearch),
      );

      if (matchingIntegrations.length > 0) {
        filtered[category] = matchingIntegrations;
      }
    });

    return filtered;
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-white">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100"
            >
              <ArrowLeft size={20} />
            </button>

            <div>
              <input
                type="text"
                value={automationName}
                onChange={(e) => setAutomationName(e.target.value)}
                className="w-full rounded-md border-none bg-transparent px-2 py-1 text-lg font-semibold text-slate-900 placeholder-slate-400 
             transition-all
             duration-200 ease-in-out hover:bg-slate-100 focus:bg-slate-100
             focus:outline-none focus:ring-2 focus:ring-slate-200"
                placeholder="Untitled Automation"
              />
              <p className="text-sm text-slate-500">
                {flow?.status === "ENABLED" ? "Published" : "Draft"} •
                {isDirty ? " Unsaved changes" : " All changes saved"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleTestFlow}
              className="flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <Play size={16} />
              Test
            </button>

            <button
              onClick={handleSaveDraft}
              disabled={!isDirty || isSaving}
              className="flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              <Save size={16} />
              Save
            </button>

            <button
              onClick={handlePublish}
              disabled={isSaving || steps.length === 0}
              className="flex items-center gap-2 rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
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
              <div className="rounded-lg border-2 border-dashed border-slate-300 p-12 text-center">
                <Zap className="mx-auto mb-4 h-12 w-12 text-slate-400" />
                <h3 className="mb-2 text-lg font-medium text-slate-900">
                  Start building your automation
                </h3>
                <p className="mb-4 text-slate-600">
                  Choose a trigger to begin your workflow
                </p>
                <button
                  onClick={() => setShowTriggerPicker(true)}
                  className="inline-flex items-center gap-2 rounded-lg bg-slate-800 px-4 py-2 text-white hover:bg-slate-700"
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
                        <div className="absolute left-1/2 top-0 h-full w-0.5 -translate-x-1/2 bg-slate-200" />
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
                    className="flex items-center gap-2 rounded-lg border-2 border-dashed border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:border-slate-400 hover:text-slate-700"
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
        <IntegrationPicker
          type="trigger"
          onSelect={(integration) =>
            handleAddTrigger(integration as TriggerType)
          }
          onClose={() => {
            setShowTriggerPicker(false);
            setTriggerSearchTerm("");
          }}
        />
      )}

      {showActionPicker && (
        <IntegrationPicker
          type="action"
          onSelect={(integration) => handleAddAction(integration as ActionType)}
          onClose={() => {
            setShowActionPicker(false);
            setAddActionAfterStepId(null);
            setActionSearchTerm("");
          }}
        />
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
  // Get the appropriate config component
  const getConfigComponent = () => {
    const configKey = step.integrationId;
    const ConfigComponent = INTEGRATION_CONFIG_COMPONENTS[configKey];

    if (ConfigComponent) {
      return ConfigComponent;
    }

    // Fallback to generic config
    return step.type === "trigger" ? GenericTriggerConfig : GenericActionConfig;
  };

  const ConfigComponent = getConfigComponent();

  return (
    <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
      <div
        className="flex cursor-pointer items-center justify-between p-4"
        onClick={onExpand}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
            {step.icon}
          </div>
          <div>
            <div className="font-medium text-slate-900">{step.displayName}</div>
            <p className="text-sm text-slate-500">{step.description}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {step.requiresAuth && !step.credentialId && (
            <div className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs text-yellow-600">
              Auth Required
            </div>
          )}
          {step.isValid && (
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100">
              <Check className="h-4 w-4 text-green-600" />
            </div>
          )}
          <ChevronDown
            className={`h-5 w-5 text-slate-400 transition-transform ${
              step.isExpanded ? "rotate-180" : ""
            }`}
          />
        </div>
      </div>

      {step.isExpanded && (
        <div className="border-t border-slate-200 p-4">
          {/* Show authentication status if required */}
          {step.requiresAuth && !step.credentialId && (
            <div className="mb-4 rounded-lg bg-slate-50 p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="mt-0.5 h-5 w-5 text-slate-600" />
                <div className="flex-1">
                  <h4 className="font-medium text-slate-900">
                    Authentication Required
                  </h4>
                  <p className="mt-1 text-sm text-slate-700">
                    Connect your {step.displayName} account to use this
                    integration.
                  </p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // TODO: Implement credential connection
                      console.log(
                        "Connect credentials for:",
                        step.integrationId,
                      );
                    }}
                    className="mt-3 rounded-lg bg-slate-600 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
                  >
                    Connect {step.displayName}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Render the configuration component */}
          <ConfigComponent
            config={step.config}
            onChange={(newConfig) => {
              onUpdate({
                config: newConfig,
                isValid: validateStepConfig(step, newConfig),
              });
            }}
          />

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
function validateStepConfig(
  step: WorkflowStep,
  config: Record<string, any>,
): boolean {
  // Basic validation - you can expand this based on integration requirements
  switch (step.integrationId) {
    case "salesforce_trigger":
    case "salesforce_action":
      return !!config.object && (step.type === "action" || !!config.event);

    case "slack_trigger":
    case "slack_action":
      if (step.type === "trigger") return !!config.event;
      return !!config.action && (!!config.channel || !!config.userId);

    case "google_calendar_trigger":
    case "google_calendar_action":
      if (step.type === "trigger") return (config.events?.length || 0) > 0;
      return (
        !!config.action &&
        !!config.title &&
        !!config.startTime &&
        !!config.endTime
      );

    case "stripe_trigger":
      return (config.events?.length || 0) > 0;

    case "stripe_action":
      return !!config.resource && !!config.action;

    case "shopify_trigger":
      return !!config.event;

    case "shopify_action":
      return !!config.resource && !!config.action;

    case "airtable_trigger":
    case "airtable_action":
      return !!config.baseId && !!config.tableId;

    case "hubspot_trigger":
    case "hubspot_action":
      if (step.type === "trigger") return !!config.object && !!config.event;
      return !!config.resource && !!config.action;

    case "mailchimp_trigger":
    case "mailchimp_action":
      return !!config.listId;

    // Basic triggers
    case "webhook":
      return true; // Webhook URL is generated automatically

    case "schedule":
      return !!config.scheduleType;

    case "email":
      return !!config.to && !!config.subject && !!config.body;

    case "sms":
      return !!config.to && !!config.message;

    default:
      // For other integrations, just check if there's some config
      return Object.keys(config).length > 0;
  }
}
const IntegrationPicker = ({
  type,
  onSelect,
  onClose,
}: {
  type: "trigger" | "action";
  onSelect: (integration: TriggerType | ActionType) => void;
  onClose: () => void;
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<
    IntegrationCategory | "all"
  >("all");

  const integrations =
    type === "trigger" ? TRIGGER_INTEGRATIONS : ACTION_INTEGRATIONS;

  // Group by category
  const groupedIntegrations = integrations.reduce(
    (acc, integration) => {
      if (!acc[integration.category]) {
        acc[integration.category] = [];
      }
      acc[integration.category].push(integration);
      return acc;
    },
    {} as Record<IntegrationCategory, (TriggerType | ActionType)[]>,
  );

  // Filter integrations
  const filteredGroups = Object.entries(groupedIntegrations).reduce(
    (acc, [category, items]) => {
      if (selectedCategory !== "all" && category !== selectedCategory)
        return acc;

      const filtered = items.filter(
        (item) =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.description.toLowerCase().includes(searchTerm.toLowerCase()),
      );

      if (filtered.length > 0) {
        acc[category as IntegrationCategory] = filtered;
      }

      return acc;
    },
    {} as Record<IntegrationCategory, (TriggerType | ActionType)[]>,
  );

  const categories = Object.values(IntegrationCategory);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative mx-4 h-[90vh] w-full max-w-4xl overflow-hidden rounded-lg bg-white shadow-xl">
        <div className="border-b border-slate-200 p-6">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
          >
            <X size={20} />
          </button>

          <h2 className="text-xl font-semibold text-slate-900">
            Choose {type === "trigger" ? "a Trigger" : "an Action"}
          </h2>
          <p className="mt-1 text-slate-600">
            {type === "trigger"
              ? "Select what will start your automation"
              : "Select what this step should do"}
          </p>

          <div className="mt-4 flex gap-4">
            <div className="relative flex-1">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search integrations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-slate-300 py-2 pl-10 pr-4 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
                autoFocus
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) =>
                setSelectedCategory(
                  e.target.value as IntegrationCategory | "all",
                )
              }
              className="rounded-lg border border-slate-300 px-4 py-2"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div
          className="overflow-y-auto p-6"
          style={{ maxHeight: "calc(90vh - 200px)" }}
        >
          {Object.entries(filteredGroups).length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-slate-500">
                No integrations found matching "{searchTerm}"
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {Object.entries(filteredGroups).map(([category, items]) => (
                <div key={category}>
                  <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-600">
                    {category}
                  </h3>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {items.map((integration) => (
                      <button
                        key={integration.id}
                        onClick={() => onSelect(integration)}
                        className="group flex items-start gap-3 rounded-lg border border-slate-200 p-4 text-left transition-all hover:border-slate-400 hover:bg-slate-50 hover:shadow-sm"
                      >
                        <div
                          className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-lg group-hover:bg-white"
                          style={{ backgroundColor: integration.color + "20" }}
                        >
                          {integration.icon}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="truncate font-medium text-slate-900">
                              {integration.name}
                            </span>
                            {integration.requiresAuth && (
                              <Shield className="h-3 w-3 text-slate-400" />
                            )}
                          </div>
                          <p className="mt-1 line-clamp-2 text-sm text-slate-500">
                            {integration.description}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
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
        <div className="border-b border-slate-200 p-6">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
          >
            <X size={20} />
          </button>

          <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
          <p className="mt-1 text-slate-600">{subtitle}</p>

          <div className="relative mt-4">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full rounded-lg border border-slate-300 py-2 pl-10 pr-4 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
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
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
        >
          <X size={20} />
        </button>

        <h3 className="mb-4 text-lg font-semibold text-slate-900">
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
                  className="flex items-center justify-between rounded-lg bg-slate-50 p-3"
                >
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium">{step.name}</span>
                  </div>
                  <span className="text-sm text-slate-500">
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
          className="mt-6 w-full rounded-lg bg-slate-800 py-2 text-white hover:bg-slate-700"
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
        <label className="mb-1 block text-sm font-medium text-slate-700">
          Webhook URL
        </label>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={webhookUrl}
            readOnly
            className="flex-1 rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm"
          />
          <button
            onClick={() => navigator.clipboard.writeText(webhookUrl)}
            className="rounded-lg border border-slate-300 p-2 hover:bg-slate-50"
          >
            <Copy size={16} />
          </button>
        </div>
        <p className="mt-1 text-xs text-slate-500">
          Send POST requests to this URL to trigger the automation
        </p>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          Request Method
        </label>
        <select
          value={config.method || "POST"}
          onChange={(e) => onChange({ ...config, method: e.target.value })}
          className="w-full rounded-lg border border-slate-300 px-3 py-2"
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
        <label className="mb-1 block text-sm font-medium text-slate-700">
          Schedule Type
        </label>
        <select
          value={config.scheduleType || "interval"}
          onChange={(e) =>
            onChange({ ...config, scheduleType: e.target.value })
          }
          className="w-full rounded-lg border border-slate-300 px-3 py-2"
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
            className="flex-1 rounded-lg border border-slate-300 px-3 py-2"
          />
          <select
            value={config.intervalUnit || "hours"}
            onChange={(e) =>
              onChange({ ...config, intervalUnit: e.target.value })
            }
            className="rounded-lg border border-slate-300 px-3 py-2"
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
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
          />
          <p className="mt-1 text-xs text-slate-500">
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
        <label className="mb-1 block text-sm font-medium text-slate-700">
          To
        </label>
        <input
          type="email"
          value={config.to || ""}
          onChange={(e) => onChange({ ...config, to: e.target.value })}
          placeholder="recipient@example.com"
          className="w-full rounded-lg border border-slate-300 px-3 py-2"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          Subject
        </label>
        <input
          type="text"
          value={config.subject || ""}
          onChange={(e) => onChange({ ...config, subject: e.target.value })}
          placeholder="Email subject"
          className="w-full rounded-lg border border-slate-300 px-3 py-2"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          Body
        </label>
        <textarea
          value={config.body || ""}
          onChange={(e) => onChange({ ...config, body: e.target.value })}
          placeholder="Email content..."
          rows={4}
          className="w-full rounded-lg border border-slate-300 px-3 py-2"
        />
      </div>
    </div>
  );
}
