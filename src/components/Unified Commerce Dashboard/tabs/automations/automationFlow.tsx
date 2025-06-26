// // src/components/Unified Commerce Dashboard/tabs/automations/automationFlow.tsx
// "use client";

// import { useRouter, useParams } from "next/navigation";
// import React, { useState, useMemo, ReactElement, useEffect } from "react";
// import {
//   Plus,
//   X,
//   Search,
//   Zap,
//   MessageSquare,
//   Mail,
//   FileText,
//   Clock,
//   ChevronLeft,
//   Settings2,
//   GitFork,
//   Database,
//   Loader2,
//   Save,
//   PlayCircle,
//   ToggleLeft,
//   ToggleRight,
//   AlertCircle,
//   Copy,
//   CheckCircle,
// } from "lucide-react";
// import { Flow, FlowVersion } from "../../lib/automations/types";

// // App definitions and other interfaces remain the same
// interface AppDefinition {
//   id: string;
//   name: string;
//   icon: ReactElement;
//   app_type: "trigger" | "action" | "condition";
//   category: string;
//   description: string;
//   defaultEvent?: string;
//   defaultAction?: string;
// }

// interface AppCategories {
//   [category: string]: AppDefinition[];
// }

// const appCategories: AppCategories = {
//   "Triggers & Lead Sources": [
//     {
//       id: "webhook",
//       name: "Webhook",
//       icon: <Zap className="text-yellow-500" />,
//       app_type: "trigger",
//       category: "Triggers & Lead Sources",
//       defaultEvent: "On Webhook Received",
//       description: "Start when an HTTP request is sent to a URL.",
//     },
//     {
//       id: "schedule",
//       name: "Schedule",
//       icon: <Clock className="text-purple-500" />,
//       app_type: "trigger",
//       category: "Triggers & Lead Sources",
//       defaultEvent: "Every Hour",
//       description: "Run this workflow on a fixed schedule.",
//     },
//     {
//       id: "form",
//       name: "Form Submitted",
//       icon: <FileText className="text-indigo-500" />,
//       app_type: "trigger",
//       category: "Triggers & Lead Sources",
//       defaultEvent: "New Form Submission",
//       description: "Start when a form on your site is submitted.",
//     },
//   ],
//   Communication: [
//     {
//       id: "email",
//       name: "Send Email",
//       icon: <Mail className="text-red-500" />,
//       app_type: "action",
//       category: "Communication",
//       defaultAction: "Send an Email",
//       description: "Send a personalized email.",
//     },
//     {
//       id: "gmail",
//       name: "Send Gmail",
//       icon: <Mail className="text-red-600" />,
//       app_type: "action",
//       category: "Communication",
//       defaultAction: "Send Gmail",
//       description: "Send email via Gmail.",
//     },
//     {
//       id: "twilio",
//       name: "Send SMS (Twilio)",
//       icon: <MessageSquare className="text-lime-600" />,
//       app_type: "action",
//       category: "Communication",
//       defaultAction: "Send an SMS Message",
//       description: "Send an SMS text message via Twilio.",
//     },
//   ],
//   "Data & Storage": [
//     {
//       id: "http",
//       name: "HTTP Request",
//       icon: <Database className="text-blue-500" />,
//       app_type: "action",
//       category: "Data & Storage",
//       defaultAction: "Make HTTP Request",
//       description: "Make an HTTP request to any API.",
//     },
//     {
//       id: "database",
//       name: "Database Query",
//       icon: <Database className="text-green-500" />,
//       app_type: "action",
//       category: "Data & Storage",
//       defaultAction: "Execute Query",
//       description: "Query a database.",
//     },
//   ],
//   "Logic & Control": [
//     {
//       id: "if",
//       name: "IF Condition",
//       icon: <GitFork className="text-orange-500" />,
//       app_type: "condition",
//       category: "Logic & Control",
//       defaultAction: "Check Condition",
//       description: "Branch based on conditions.",
//     },
//     {
//       id: "wait",
//       name: "Wait/Delay",
//       icon: <Clock className="text-amber-600" />,
//       app_type: "condition",
//       category: "Logic & Control",
//       defaultAction: "Wait",
//       description: "Pause the workflow.",
//     },
//     {
//       id: "code",
//       name: "Code",
//       icon: <Settings2 className="text-gray-600" />,
//       app_type: "action",
//       category: "Logic & Control",
//       defaultAction: "Run Code",
//       description: "Execute custom JavaScript code.",
//     },
//   ],
// };

// interface WorkflowStep {
//   id: string;
//   type: "trigger" | "action" | "condition";
//   app: string;
//   appName: string;
//   event: string;
//   configured: boolean;
//   icon: ReactElement;
//   description?: string;
//   stepData?: any;
// }

// const renderIcon = (
//   iconInput: ReactElement,
//   defaultSize: number = 20,
//   className?: string,
// ) => {
//   return React.cloneElement(iconInput, { size: defaultSize, className });
// };

// export default function AutomationFlowPage() {
//   const router = useRouter();
//   const params = useParams();
//   const flowId = params.flowId as string;

//   // State
//   const [flow, setFlow] = useState<Flow | null>(null);
//   const [workflowName, setWorkflowName] = useState("");
//   const [workflowStatus, setWorkflowStatus] = useState<"ENABLED" | "DISABLED">(
//     "DISABLED",
//   );
//   const [workflow, setWorkflow] = useState<WorkflowStep[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [isSaving, setIsSaving] = useState(false);
//   const [isToggling, setIsToggling] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [selectedStepIndex, setSelectedStepIndex] = useState<number | null>(
//     null,
//   );
//   const [sidebarMode, setSidebarMode] = useState<
//     "closed" | "selectApp" | "configure"
//   >("closed");
//   const [stepIndexToInsertAfter, setStepIndexToInsertAfter] = useState<
//     number | null
//   >(null);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [webhookUrl, setWebhookUrl] = useState<string>("");
//   const [copiedWebhook, setCopiedWebhook] = useState(false);

//   // Parse flow to steps
//   const parseFlowToSteps = (
//     flowVersion: FlowVersion | undefined,
//   ): WorkflowStep[] => {
//     if (!flowVersion?.trigger) return [];

//     const steps: WorkflowStep[] = [];
//     let currentStepInFlow = flowVersion.trigger;
//     let isFirst = true;

//     while (currentStepInFlow) {
//       const appDef = Object.values(appCategories)
//         .flat()
//         .find((app) => app.id === currentStepInFlow.settings.pieceName);

//       steps.push({
//         id: currentStepInFlow.name,
//         type: isFirst
//           ? "trigger"
//           : currentStepInFlow.type.includes("ACTION")
//             ? "action"
//             : "condition",
//         app: currentStepInFlow.settings.pieceName || "unknown",
//         appName: appDef?.name || currentStepInFlow.displayName,
//         event:
//           currentStepInFlow.settings.triggerName ||
//           (currentStepInFlow.settings as any).actionName ||
//           "Configure",
//         configured: currentStepInFlow.valid,
//         icon: appDef?.icon || <Zap />,
//         description: appDef?.description,
//         stepData: currentStepInFlow,
//       });

//       isFirst = false;
//       currentStepInFlow = currentStepInFlow.nextAction;
//     }
//     return steps;
//   };

//   // Fetch flow data
//   useEffect(() => {
//     if (!flowId) {
//       console.error("No flowId provided");
//       setError("No flow ID provided");
//       setIsLoading(false);
//       return;
//     }

//     console.log(`Fetching flow with ID: ${flowId}`);
//     const fetchFlow = async () => {
//       try {
//         setIsLoading(true);
//         setError(null);

//         const response = await fetch(`/api/automations/${flowId}`);
//         console.log(`Flow fetch response status: ${response.status}`);

//         if (!response.ok) {
//           console.error(`Failed to fetch flow: ${response.status}`);
//           throw new Error(
//             `Failed to fetch automation details (${response.status})`,
//           );
//         }

//         const responseText = await response.text();
//         console.log("Raw flow response:", responseText);

//         // Try to parse as JSON
//         let result;
//         try {
//           result = JSON.parse(responseText);
//         } catch (parseError) {
//           console.error("Failed to parse flow response as JSON:", parseError);
//           throw new Error("Invalid response format from server");
//         }

//         if (result.success && result.data) {
//           console.log("Flow data received:", result.data);
//           setFlow(result.data);
//           setWorkflowName(result.data.version.displayName);
//           setWorkflowStatus(result.data.status);
//           const parsedSteps = parseFlowToSteps(result.data.version);
//           setWorkflow(parsedSteps);

//           // Generate webhook URL if webhook trigger exists
//           const webhookTrigger = parsedSteps.find(
//             (step) => step.app === "webhook",
//           );
//           if (webhookTrigger) {
//             // Simple webhook URL construction if activePieces.getWebhookUrl isn't working
//             const url = `${window.location.origin}/api/webhook/${flowId}`;
//             setWebhookUrl(url);
//           }

//           if (parsedSteps.length > 0) {
//             setSelectedStepIndex(0);
//             setSidebarMode("configure");
//           }
//         } else {
//           console.error("API returned error:", result.error);
//           throw new Error(result.error?.message || "Could not load automation");
//         }
//       } catch (err: any) {
//         console.error("Error in fetchFlow:", err);
//         setError(err.message);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchFlow();
//   }, [flowId]);

//   // Copy webhook URL
//   const copyWebhookUrl = () => {
//     if (!webhookUrl) {
//       setError("No webhook URL available");
//       return;
//     }
//     navigator.clipboard.writeText(webhookUrl);
//     setCopiedWebhook(true);
//     setTimeout(() => setCopiedWebhook(false), 2000);
//   };

//   // Toggle workflow status
//   const handleToggleStatus = async () => {
//     if (!flowId) {
//       setError("No flow ID available");
//       return;
//     }

//     setIsToggling(true);
//     try {
//       const newStatus = workflowStatus === "ENABLED" ? "DISABLED" : "ENABLED";
//       console.log(`Toggling flow ${flowId} status to: ${newStatus}`);

//       // Instead of using /activate or /deactivate endpoints, update the status directly
//       const response = await fetch(`/api/automations/${flowId}`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           displayName: workflowName,
//           status: newStatus,
//         }),
//       });

//       console.log(`Toggle status response: ${response.status}`);

//       if (!response.ok) {
//         throw new Error(
//           `Failed to ${newStatus === "ENABLED" ? "enable" : "disable"} automation`,
//         );
//       }

//       const responseText = await response.text();
//       console.log("Raw toggle response:", responseText);

//       // Only try to parse if there's content
//       if (responseText.trim()) {
//         try {
//           const result = JSON.parse(responseText);
//           if (result.success && result.data) {
//             console.log("Toggle success, new data:", result.data);
//             setWorkflowStatus(result.data.status);
//           } else {
//             throw new Error(result.error?.message || "Failed to update status");
//           }
//         } catch (parseError) {
//           console.error("Failed to parse toggle response:", parseError);
//           throw new Error("Invalid response format from server");
//         }
//       } else {
//         // If empty response but status is ok, assume it worked
//         if (response.ok) {
//           setWorkflowStatus(newStatus);
//         } else {
//           throw new Error("Empty response from server");
//         }
//       }
//     } catch (err: any) {
//       console.error("Error toggling status:", err);
//       setError(err.message);
//     } finally {
//       setIsToggling(false);
//     }
//   };

//   // Save workflow
//   const handleSave = async () => {
//     if (!flowId) {
//       setError("No flow ID available");
//       return;
//     }

//     setIsSaving(true);
//     try {
//       console.log(`Saving flow ${flowId} with name: ${workflowName}`);
//       const response = await fetch(`/api/automations/${flowId}`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ displayName: workflowName }),
//       });

//       console.log(`Save response status: ${response.status}`);

//       if (!response.ok) {
//         throw new Error(`Failed to save automation (${response.status})`);
//       }

//       const responseText = await response.text();
//       console.log("Raw save response:", responseText);

//       // Only try to parse if there's content
//       if (responseText.trim()) {
//         try {
//           const result = JSON.parse(responseText);
//           if (!result.success) {
//             throw new Error(result.error?.message || "Failed to save workflow");
//           }
//           console.log("Save successful:", result);
//         } catch (parseError) {
//           console.error("Failed to parse save response:", parseError);
//           // Don't throw here, the save might have worked even if parsing failed
//         }
//       }
//     } catch (err: any) {
//       console.error("Error saving workflow:", err);
//       setError(err.message);
//     } finally {
//       setIsSaving(false);
//     }
//   };

//   // Test workflow
//   const handleTest = async () => {
//     if (!flowId) {
//       setError("No flow ID available");
//       return;
//     }

//     try {
//       if (webhookUrl) {
//         alert(`To test this automation, send a POST request to: ${webhookUrl}`);
//       } else {
//         alert(
//           "Test feature coming soon! No webhook URL available for this workflow.",
//         );
//       }
//     } catch (err: any) {
//       setError(err.message);
//     }
//   };

//   // Other handler functions remain the same...
//   const handleAppSelected = (app: AppDefinition) => {
//     const newStep: WorkflowStep = {
//       id: `step_${workflow.length}`,
//       type: app.app_type,
//       app: app.id,
//       appName: app.name,
//       event: app.defaultAction || app.defaultEvent || "New Step",
//       configured: false,
//       icon: app.icon,
//       description: app.description,
//       stepData: {},
//     };

//     const newWorkflow = [...workflow];
//     const insertAt =
//       stepIndexToInsertAfter === null ? 0 : stepIndexToInsertAfter + 1;
//     newWorkflow.splice(insertAt, 0, newStep);

//     setWorkflow(newWorkflow);
//     setSelectedStepIndex(insertAt);
//     setSidebarMode("configure");
//   };

//   const handleRemoveStep = (indexToRemove: number) => {
//     const newWorkflow = workflow.filter((_, i) => i !== indexToRemove);
//     setWorkflow(newWorkflow);

//     if (selectedStepIndex === indexToRemove) {
//       setSelectedStepIndex(Math.max(0, indexToRemove - 1));
//       if (newWorkflow.length === 0) setSidebarMode("closed");
//     } else if (
//       selectedStepIndex !== null &&
//       selectedStepIndex > indexToRemove
//     ) {
//       setSelectedStepIndex(selectedStepIndex - 1);
//     }
//   };

//   const openAppSelector = (indexToInsertAfter: number) => {
//     setStepIndexToInsertAfter(indexToInsertAfter);
//     setSelectedStepIndex(null);
//     setSidebarMode("selectApp");
//     setSearchTerm("");
//   };

//   const filteredApps = useMemo<AppCategories>(() => {
//     if (!searchTerm) return appCategories;
//     const lowerSearchTerm = searchTerm.toLowerCase();
//     const filtered: AppCategories = {};
//     for (const categoryKey in appCategories) {
//       const appsInCategory = appCategories[categoryKey].filter(
//         (app) =>
//           app.name.toLowerCase().includes(lowerSearchTerm) ||
//           app.description.toLowerCase().includes(lowerSearchTerm),
//       );
//       if (appsInCategory.length > 0) {
//         filtered[categoryKey] = appsInCategory;
//       }
//     }
//     return filtered;
//   }, [searchTerm]);

//   // UI Components
//   const StepCard: React.FC<{
//     step: WorkflowStep;
//     index: number;
//     isSelected: boolean;
//     onClick: () => void;
//     onRemove: () => void;
//   }> = ({ step, index, isSelected, onClick, onRemove }) => (
//     <div
//       className={`group relative mb-4 cursor-pointer rounded-lg border-2 bg-white p-4 transition-all ${
//         isSelected ? "border-gray-800" : "border-gray-200 hover:border-gray-400"
//       }`}
//       onClick={onClick}
//     >
//       <div className="flex items-start justify-between">
//         <div className="flex items-start gap-3">
//           <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full">
//             {renderIcon(step.icon, 24)}
//           </div>
//           <div>
//             <div className="flex items-center gap-2">
//               <span className="font-semibold text-gray-800">
//                 {step.appName}
//               </span>
//               {step.configured ? (
//                 <span
//                   className="h-2.5 w-2.5 rounded-full bg-green-500"
//                   title="Configured"
//                 ></span>
//               ) : (
//                 <span
//                   className="h-2.5 w-2.5 rounded-full bg-yellow-400"
//                   title="Needs Configuration"
//                 ></span>
//               )}
//             </div>
//             <p className="mt-0.5 text-sm text-gray-600">
//               {index === 0 ? "Trigger: " : `Action ${index}: `}
//               {step.event}
//             </p>
//           </div>
//         </div>
//         {(index > 0 || workflow.length > 1) && (
//           <button
//             onClick={(e) => {
//               e.stopPropagation();
//               onRemove();
//             }}
//             className="text-gray-400 opacity-0 transition-opacity hover:text-red-500 group-hover:opacity-100"
//             title="Remove step"
//           >
//             <X size={18} />
//           </button>
//         )}
//       </div>
//     </div>
//   );
//   const AddStepButton: React.FC<{ onClick: () => void; label?: string }> = ({
//     onClick,
//     label = "Add an action",
//   }) => (
//     <div className="relative my-1 flex h-10 items-center justify-center">
//       <div className="absolute left-1/2 top-0 h-full w-0.5 -translate-x-1/2 transform bg-gray-300"></div>
//       <button
//         onClick={onClick}
//         className="relative z-10 flex items-center justify-center rounded-full border-2 border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:border-gray-800 hover:text-gray-800"
//       >
//         <Plus size={14} className="mr-1" /> {label}
//       </button>
//     </div>
//   );

//   // Render
//   if (isLoading) {
//     return (
//       <div className="flex h-screen w-screen items-center justify-center bg-gray-50">
//         <Loader2 className="h-10 w-10 animate-spin text-gray-400" />
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="flex h-screen w-screen flex-col items-center justify-center bg-gray-50">
//         <AlertCircle className="mb-2 h-10 w-10 text-red-500" />
//         <p className="text-red-600">{error}</p>
//         <button
//           onClick={() => router.push("/automations")}
//           className="mt-4 rounded-md border px-4 py-2"
//         >
//           Back to Automations
//         </button>
//       </div>
//     );
//   }

//   return (
//     <div className="flex h-screen flex-col bg-slate-50">
//       {/* Header */}
//       <header className="flex-shrink-0 border-b border-gray-200 bg-white">
//         <div className="mx-auto flex max-w-full items-center justify-between p-3">
//           <div className="flex items-center gap-2">
//             <button
//               onClick={() => router.push("/automations")}
//               className="rounded-md p-1 text-gray-500 hover:bg-gray-100"
//             >
//               <ChevronLeft size={20} />
//             </button>
//             <span className="text-gray-300">/</span>
//             <input
//               type="text"
//               value={workflowName}
//               onChange={(e) => setWorkflowName(e.target.value)}
//               className="rounded-md p-1 font-semibold text-gray-800 outline-none hover:bg-gray-100 focus:bg-gray-100 focus:ring-1 focus:ring-gray-800"
//             />
//           </div>
//           <div className="flex items-center gap-4">
//             <button
//               onClick={handleToggleStatus}
//               disabled={isToggling}
//               className="flex items-center gap-2 rounded-md p-2 text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-50"
//             >
//               {isToggling ? (
//                 <Loader2 className="animate-spin" size={20} />
//               ) : workflowStatus === "ENABLED" ? (
//                 <ToggleRight className="text-green-500" size={20} />
//               ) : (
//                 <ToggleLeft className="text-gray-400" size={20} />
//               )}
//               {workflowStatus === "ENABLED" ? "Enabled" : "Disabled"}
//             </button>
//             <button
//               onClick={handleTest}
//               className="flex items-center gap-2 rounded-md p-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
//             >
//               <PlayCircle size={16} /> Test
//             </button>
//             <button
//               onClick={handleSave}
//               disabled={isSaving}
//               className="flex items-center gap-2 rounded-lg bg-gray-800 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
//             >
//               {isSaving ? (
//                 <Loader2 className="animate-spin" size={16} />
//               ) : (
//                 <Save size={16} />
//               )}
//               Save
//             </button>
//           </div>
//         </div>
//       </header>

//       {/* Main Content */}
//       <div className="flex flex-1 overflow-hidden">
//         {/* Left Panel: Steps */}
//         <div className="w-[480px] overflow-y-auto border-r border-gray-200 bg-slate-50">
//           <div className="space-y-2 p-6">
//             {workflow.length === 0 && (
//               <div className="py-12 text-center">
//                 <Zap size={40} className="mx-auto mb-3 text-gray-300" />
//                 <h3 className="mb-2 font-semibold text-gray-700">
//                   Create your automation
//                 </h3>
//                 <p className="mb-4 text-sm text-gray-500">
//                   Start by adding a trigger.
//                 </p>
//                 <button
//                   onClick={() => openAppSelector(-1)}
//                   className="mx-auto flex items-center gap-2 rounded-lg bg-gray-800 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
//                 >
//                   <Plus size={16} /> Add Trigger
//                 </button>
//               </div>
//             )}
//             {workflow.map((step, index) => (
//               <React.Fragment key={step.id}>
//                 <StepCard
//                   step={step}
//                   index={index}
//                   isSelected={
//                     selectedStepIndex === index && sidebarMode === "configure"
//                   }
//                   onClick={() => {
//                     setSelectedStepIndex(index);
//                     setSidebarMode("configure");
//                   }}
//                   onRemove={() => handleRemoveStep(index)}
//                 />
//                 <AddStepButton onClick={() => openAppSelector(index)} />
//               </React.Fragment>
//             ))}
//           </div>
//         </div>

//         {/* Right Panel: Configuration / App Selection */}
//         <div className="flex-1 overflow-y-auto bg-white shadow-inner">
//           {sidebarMode === "closed" && (
//             <div className="flex h-full flex-col items-center justify-center p-8 text-center text-gray-500">
//               <Database size={48} className="mx-auto mb-4 opacity-50" />
//               <h2 className="mb-2 text-xl font-semibold text-gray-700">
//                 Automation Editor
//               </h2>
//               <p>Select a step to configure it, or add a new one.</p>
//             </div>
//           )}

//           {sidebarMode === "selectApp" && (
//             <div className="p-6">
//               <div className="mb-6 flex items-center">
//                 <button
//                   onClick={() =>
//                     setSidebarMode(
//                       selectedStepIndex !== null ? "configure" : "closed",
//                     )
//                   }
//                   className="mr-3 text-gray-500 hover:text-gray-700"
//                 >
//                   <ChevronLeft size={24} />
//                 </button>
//                 <h2 className="text-xl font-semibold text-gray-800">
//                   {stepIndexToInsertAfter === -1
//                     ? "Choose a Trigger"
//                     : "Choose an Action"}
//                 </h2>
//               </div>
//               <div className="relative mb-6">
//                 <Search
//                   className="absolute left-3 top-1/2 -translate-y-1/2 transform text-gray-400"
//                   size={20}
//                 />
//                 <input
//                   type="text"
//                   placeholder="Search apps & actions..."
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                   className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 focus:outline-none focus:ring-1 focus:ring-gray-800"
//                 />
//               </div>
//               <div className="max-h-[calc(100vh-250px)] space-y-6 overflow-y-auto pr-2">
//                 {Object.entries(filteredApps).map(([category, apps]) => {
//                   const relevantApps = apps.filter((appDef) =>
//                     stepIndexToInsertAfter === -1
//                       ? appDef.app_type === "trigger"
//                       : appDef.app_type !== "trigger",
//                   );
//                   if (relevantApps.length === 0) return null;
//                   return (
//                     <div key={category}>
//                       <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
//                         {category}
//                       </h3>
//                       <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
//                         {relevantApps.map((appDef) => (
//                           <button
//                             key={appDef.id}
//                             onClick={() => handleAppSelected(appDef)}
//                             className="flex items-start gap-3 rounded-lg border border-gray-200 p-3.5 text-left transition-colors hover:border-gray-800 hover:bg-gray-50/50 focus:outline-none focus:ring-1 focus:ring-gray-800"
//                           >
//                             <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md">
//                               {renderIcon(appDef.icon, 20)}
//                             </div>
//                             <div>
//                               <span className="text-sm font-medium text-gray-800">
//                                 {appDef.name}
//                               </span>
//                               <p className="mt-0.5 text-xs text-gray-500">
//                                 {appDef.description}
//                               </p>
//                             </div>
//                           </button>
//                         ))}
//                       </div>
//                     </div>
//                   );
//                 })}
//                 {Object.keys(filteredApps).length === 0 && searchTerm && (
//                   <p className="py-4 text-center text-gray-500">
//                     No apps found for "{searchTerm}".
//                   </p>
//                 )}
//               </div>
//             </div>
//           )}

//           {sidebarMode === "configure" &&
//             selectedStepIndex !== null &&
//             workflow[selectedStepIndex] &&
//             (() => {
//               const currentStep = workflow[selectedStepIndex];
//               return (
//                 <div className="p-8">
//                   <div className="mb-6 flex items-center gap-3 border-b border-gray-200 pb-6">
//                     <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg">
//                       {renderIcon(currentStep.icon, 28)}
//                     </div>
//                     <div>
//                       <h3 className="text-xl font-semibold text-gray-800">
//                         {currentStep.appName}
//                       </h3>
//                       <p className="text-sm text-gray-600">
//                         {currentStep.type === "trigger"
//                           ? "Configure Trigger"
//                           : `Configure Action ${selectedStepIndex + 1}`}
//                       </p>
//                     </div>
//                   </div>

//                   <div className="space-y-5">
//                     {/* Webhook Configuration */}
//                     {currentStep.app === "webhook" && (
//                       <>
//                         <div>
//                           <label className="mb-1 block text-sm font-medium text-gray-700">
//                             Webhook URL
//                           </label>
//                           <div className="flex items-center gap-2">
//                             <input
//                               type="text"
//                               readOnly
//                               value={webhookUrl || "Loading..."}
//                               className="flex-1 rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-700"
//                             />
//                             <button
//                               onClick={copyWebhookUrl}
//                               className="flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 hover:bg-gray-50"
//                               title="Copy to clipboard"
//                             >
//                               {copiedWebhook ? (
//                                 <CheckCircle
//                                   size={16}
//                                   className="text-green-500"
//                                 />
//                               ) : (
//                                 <Copy size={16} />
//                               )}
//                             </button>
//                           </div>
//                           <p className="mt-1 text-xs text-gray-500">
//                             Send a POST request to this URL to trigger the
//                             automation.
//                           </p>
//                         </div>
//                         <div>
//                           <label className="mb-1 block text-sm font-medium text-gray-700">
//                             Response Mode
//                           </label>
//                           <select className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-gray-800">
//                             <option value="onReceived">
//                               Respond Immediately
//                             </option>
//                             <option value="lastNode">
//                               Wait for Workflow Completion
//                             </option>
//                           </select>
//                         </div>
//                       </>
//                     )}

//                     {/* Schedule Configuration */}
//                     {currentStep.app === "schedule" && (
//                       <>
//                         <div>
//                           <label className="mb-1 block text-sm font-medium text-gray-700">
//                             Schedule Type
//                           </label>
//                           <select className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-gray-800">
//                             <option value="interval">Interval</option>
//                             <option value="cron">Cron Expression</option>
//                           </select>
//                         </div>
//                         <div>
//                           <label className="mb-1 block text-sm font-medium text-gray-700">
//                             Run Every
//                           </label>
//                           <div className="flex gap-2">
//                             <input
//                               type="number"
//                               defaultValue="1"
//                               min="1"
//                               className="w-24 rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-gray-800"
//                             />
//                             <select className="flex-1 rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-gray-800">
//                               <option value="minutes">Minutes</option>
//                               <option value="hours">Hours</option>
//                               <option value="days">Days</option>
//                               <option value="weeks">Weeks</option>
//                               <option value="months">Months</option>
//                             </select>
//                           </div>
//                         </div>
//                       </>
//                     )}

//                     {/* Email Configuration */}
//                     {(currentStep.app === "email" ||
//                       currentStep.app === "gmail") && (
//                       <>
//                         <div>
//                           <label className="mb-1 block text-sm font-medium text-gray-700">
//                             From Email
//                           </label>
//                           <input
//                             type="email"
//                             placeholder="sender@example.com"
//                             className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-gray-800"
//                           />
//                         </div>
//                         <div>
//                           <label className="mb-1 block text-sm font-medium text-gray-700">
//                             To Email
//                           </label>
//                           <input
//                             type="text"
//                             defaultValue="{{trigger.body.email}}"
//                             placeholder="recipient@example.com or use data from previous steps"
//                             className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-gray-800"
//                           />
//                         </div>
//                         <div>
//                           <label className="mb-1 block text-sm font-medium text-gray-700">
//                             Subject
//                           </label>
//                           <input
//                             type="text"
//                             placeholder="Welcome to our service!"
//                             className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-gray-800"
//                           />
//                         </div>
//                         <div>
//                           <label className="mb-1 block text-sm font-medium text-gray-700">
//                             Body
//                           </label>
//                           <textarea
//                             placeholder="Hi {{trigger.body.name}},&#10;&#10;Welcome to our service..."
//                             rows={6}
//                             className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-gray-800"
//                           />
//                         </div>
//                       </>
//                     )}

//                     {/* HTTP Request Configuration */}
//                     {currentStep.app === "http" && (
//                       <>
//                         <div>
//                           <label className="mb-1 block text-sm font-medium text-gray-700">
//                             Method
//                           </label>
//                           <select className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-gray-800">
//                             <option value="GET">GET</option>
//                             <option value="POST">POST</option>
//                             <option value="PUT">PUT</option>
//                             <option value="DELETE">DELETE</option>
//                             <option value="PATCH">PATCH</option>
//                           </select>
//                         </div>
//                         <div>
//                           <label className="mb-1 block text-sm font-medium text-gray-700">
//                             URL
//                           </label>
//                           <input
//                             type="text"
//                             placeholder="https://api.example.com/endpoint"
//                             className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-gray-800"
//                           />
//                         </div>
//                         <div>
//                           <label className="mb-1 block text-sm font-medium text-gray-700">
//                             Headers (JSON)
//                           </label>
//                           <textarea
//                             placeholder='{"Content-Type": "application/json"}'
//                             rows={3}
//                             className="w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-gray-800"
//                           />
//                         </div>
//                         <div>
//                           <label className="mb-1 block text-sm font-medium text-gray-700">
//                             Body
//                           </label>
//                           <textarea
//                             placeholder='{"key": "value"}'
//                             rows={4}
//                             className="w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-gray-800"
//                           />
//                         </div>
//                       </>
//                     )}

//                     {/* IF Condition Configuration */}
//                     {currentStep.app === "if" && (
//                       <>
//                         <div>
//                           <label className="mb-1 block text-sm font-medium text-gray-700">
//                             Condition
//                           </label>
//                           <div className="space-y-2">
//                             <div className="flex gap-2">
//                               <input
//                                 type="text"
//                                 placeholder="{{trigger.body.amount}}"
//                                 className="flex-1 rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-gray-800"
//                               />
//                               <select className="rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-gray-800">
//                                 <option value="equals">Equals</option>
//                                 <option value="notEquals">Not Equals</option>
//                                 <option value="contains">Contains</option>
//                                 <option value="greater">Greater Than</option>
//                                 <option value="less">Less Than</option>
//                               </select>
//                               <input
//                                 type="text"
//                                 placeholder="100"
//                                 className="w-32 rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-gray-800"
//                               />
//                             </div>
//                           </div>
//                           <button className="mt-2 text-sm text-gray-600 hover:text-gray-800">
//                             + Add Condition
//                           </button>
//                         </div>
//                         <div>
//                           <label className="mb-1 block text-sm font-medium text-gray-700">
//                             Combine Conditions
//                           </label>
//                           <select className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-gray-800">
//                             <option value="all">
//                               All conditions must be true (AND)
//                             </option>
//                             <option value="any">
//                               Any condition must be true (OR)
//                             </option>
//                           </select>
//                         </div>
//                       </>
//                     )}

//                     {/* Wait/Delay Configuration */}
//                     {currentStep.app === "wait" && (
//                       <>
//                         <div>
//                           <label className="mb-1 block text-sm font-medium text-gray-700">
//                             Wait Type
//                           </label>
//                           <select className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-gray-800">
//                             <option value="timeInterval">Fixed Time</option>
//                             <option value="dateTime">
//                               Until Specific Date/Time
//                             </option>
//                           </select>
//                         </div>
//                         <div>
//                           <label className="mb-1 block text-sm font-medium text-gray-700">
//                             Duration
//                           </label>
//                           <div className="flex gap-2">
//                             <input
//                               type="number"
//                               defaultValue="5"
//                               min="1"
//                               className="w-24 rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-gray-800"
//                             />
//                             <select className="flex-1 rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-gray-800">
//                               <option value="seconds">Seconds</option>
//                               <option value="minutes">Minutes</option>
//                               <option value="hours">Hours</option>
//                               <option value="days">Days</option>
//                             </select>
//                           </div>
//                         </div>
//                       </>
//                     )}

//                     {/* Code Configuration */}
//                     {currentStep.app === "code" && (
//                       <>
//                         <div>
//                           <label className="mb-1 block text-sm font-medium text-gray-700">
//                             JavaScript Code
//                           </label>
//                           <textarea
//                             placeholder={
//                               "// Access input data with $input.all()\n// Return data with return items;\n\nconst items = $input.all();\n\n// Your code here\n\nreturn items;"
//                             }
//                             rows={12}
//                             className="w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-gray-800"
//                           />
//                           <p className="mt-1 text-xs text-gray-500">
//                             Available: $input, $json, $node, $workflow, $now,
//                             $today
//                           </p>
//                         </div>
//                       </>
//                     )}

//                     {/* Generic fallback for unhandled apps */}
//                     {![
//                       "webhook",
//                       "schedule",
//                       "email",
//                       "gmail",
//                       "http",
//                       "if",
//                       "wait",
//                       "code",
//                     ].includes(currentStep.app) && (
//                       <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
//                         <p className="text-gray-600">
//                           Configuration for "{currentStep.appName}" is not yet
//                           implemented in this UI.
//                         </p>
//                         <p className="mt-2 text-sm text-gray-500">
//                           Please use the n8n editor directly for advanced
//                           configuration.
//                         </p>
//                       </div>
//                     )}

//                     <div className="mt-8 border-t border-gray-200 pt-6">
//                       <button className="w-full rounded-lg bg-gray-100 px-5 py-2.5 text-sm font-medium text-black hover:bg-gray-200 sm:w-auto">
//                         Save Configuration
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               );
//             })()}
//         </div>
//       </div>
//     </div>
//   );
// }
