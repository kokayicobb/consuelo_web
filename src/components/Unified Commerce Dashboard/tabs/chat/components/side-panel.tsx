"use client";

import React, { useEffect, useState } from "react";
import {
  XMarkIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
  ArrowLeftIcon,
  ClipboardDocumentIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import type { ChatMessageData } from "@/types/chats";

import type { OtfContactLog } from "@/types/otf";
import { generateSalesScript } from "@/components/Unified Commerce Dashboard/lib/actions/prompt_actions";
import { SuggestedAction } from "../action-suggestions";
import QueryResults from "../query-results";
import ScriptModal from "../script-modal";
import RedditSearch from "@/components/Unified Commerce Dashboard/tabs/apps/app-views/social-search/reddit-search";

interface SideArtifactPanelProps {
  data: ChatMessageData | null;
  userQuery?: string;
  isOpen: boolean;
  isExpanded: boolean;
  onClose: () => void;
  onToggleExpand: () => void;
  onViewModeChange: (newMode: "table" | "chart" | "actions") => void;
}

const SideArtifactPanel: React.FC<SideArtifactPanelProps> = ({
  data,
  userQuery,
  isOpen,
  isExpanded,
  onClose,
  onToggleExpand,
  onViewModeChange,
}) => {
  // State for script generation
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);

  // State for script modal
  const [scriptModal, setScriptModal] = useState<{
    isOpen: boolean;
    type: "call" | "email";
    clientName?: string;
    script: string;
  } | null>(null);
  useEffect(() => {
    if (data) {
      console.log("SideArtifactPanel data updated:", {
        viewMode: data.viewMode,
        queryContext: data.queryContext,
        hasQueryResults: !!data.queryResults && data.queryResults.length > 0,
        hasSqlQuery: !!data.sqlQuery,
      });
    }
  }, [data]);
  // State for clipboard copy
  const [isCopied, setIsCopied] = useState(false);

  if (!isOpen || !data) {
    return null;
  }

  // Resolve userQuery: prefer prop, then from data object
  const currentQueryContext =
    userQuery || data?.userQuery || data?.queryContext || "";

  // Handle copying script to clipboard
  const handleCopyToClipboard = () => {
    if (scriptModal) {
      navigator.clipboard.writeText(scriptModal.script);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000); // Reset after 2 seconds
    }
  };

  // Fixed renderContent function with proper function definition and return statement
  const renderContent = () => {
    console.log("renderContent called with viewMode:", data.viewMode);

    // Explicitly check for leadGenerator mode
    if (data.viewMode === "leadGenerator") {
      console.log(
        "Should render OrangeSalesAgent with query:",
        currentQueryContext,
      );

      // Return the OrangeSalesAgent component
      return (
        <div className="h-full w-full">
          <RedditSearch userQuery={currentQueryContext} />
        </div>
      );
    }

    console.log("Rendering regular QueryResults");
    // Regular query results
    return (data.queryResults && data.queryResults.length > 0) ||
      (data.sqlQuery &&
        (!data.queryResults || data.queryResults.length === 0)) ? (
      <QueryResults
        results={data.queryResults || []}
        columns={data.columns || []}
        viewMode={data.viewMode || "cards"}
        setViewMode={onViewModeChange}
        chartConfig={data.chartConfig}
        isLoadingChart={!!data.isLoadingChart}
        actionSuggestions={actionSuggestionsForQueryResults}
        isLoadingActions={!!data.isLoadingActions}
        isCompactView={!isExpanded}
        onInitiateAction={handleInitiateAction}
      />
    ) : null;
  };

  // handleInitiateAction implementation
  const handleInitiateAction = async (action: SuggestedAction) => {
    console.log(
      "[SideArtifactPanel] handleInitiateAction triggered. Action:",
      action,
    );

    if (
      action.type === "generate_call_script" ||
      action.type === "generate_email_script"
    ) {
      console.log(
        `[SideArtifactPanel] Matched script generation type: ${action.type}`,
      );
      setIsGeneratingScript(true);

      const scriptType =
        action.type === "generate_call_script" ? "call" : "email";

      // Initialize script modal with loading state
      setScriptModal({
        isOpen: true,
        type: scriptType,
        script: "Generating script...",
      });

      let logsForScript: OtfContactLog[] = [];
      let specificClientName: string | undefined = undefined;

      // Use displayableResults logic
      const resultsToUse =
        data.queryResults &&
        data.queryResults.length > 0 &&
        Array.isArray(data.queryResults[0]) &&
        typeof data.queryResults[0] !== "string"
          ? data.queryResults[0]
          : data.queryResults || [];

      console.log(
        "[SideArtifactPanel] Current queryResults for script:",
        resultsToUse,
      );
      console.log(
        "[SideArtifactPanel] Current userQuery/context for script:",
        currentQueryContext,
      );

      if (action.payload?.clientId && resultsToUse.length > 0) {
        const targetClient = resultsToUse.find(
          (client) => client["Client ID"] === action.payload.clientId,
        );
        if (targetClient) {
          logsForScript = targetClient.contact_logs || [];
          specificClientName = targetClient["Client"];
          console.log(
            `[SideArtifactPanel] Script for specific client: ${specificClientName}, Logs:`,
            logsForScript.length,
          );
        }
      } else if (resultsToUse.length > 0) {
        logsForScript = resultsToUse
          .flatMap((client) => client.contact_logs || [])
          .filter((log) => log);
        console.log(
          `[SideArtifactPanel] Script based on all ${logsForScript.length} logs from ${resultsToUse.length} clients.`,
        );
        if (resultsToUse.length === 1 && resultsToUse[0]["Client"]) {
          specificClientName = resultsToUse[0]["Client"];
        }
      } else {
        console.log(
          "[SideArtifactPanel] No specific client or logs found. Generating generic script.",
        );
      }

      try {
        // Extract any additional client data we might have
        let clientContext = {};
        if (action.payload?.clientId && resultsToUse.length > 0) {
          const targetClient = resultsToUse.find(
            (client) => client["Client ID"] === action.payload.clientId,
          );
          if (targetClient) {
            clientContext = {
              membershipType:
                targetClient["Membership Type"] || "Orange 60 - Tornado",
              coach: targetClient["Coach"] || "",
              joinDate: targetClient["Join Date"] || "",
              lastVisit: targetClient["Last Visit"] || "",
            };
          }
        }

        const scriptParams = {
          contactLogs: logsForScript.length > 0 ? logsForScript : undefined,
          scriptType: scriptType as "call" | "email",
          clientName: specificClientName,
          queryContext: currentQueryContext,
          clientContext: clientContext,
        };
        console.log(
          "[SideArtifactPanel] Calling generateSalesScript with params:",
          scriptParams,
        );

        const script = await generateSalesScript(scriptParams);

        console.log(
          "[SideArtifactPanel] Script generated successfully:",
          script,
        );

        // Update script modal with the generated content
        setScriptModal({
          isOpen: true,
          type: scriptType,
          clientName: specificClientName,
          script: script,
        });
      } catch (error) {
        console.error("[SideArtifactPanel] Error generating script:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";

        // Update script modal with error message
        setScriptModal({
          isOpen: true,
          type: scriptType,
          clientName: specificClientName,
          script: `Error generating script: ${errorMessage}`,
        });
      } finally {
        setIsGeneratingScript(false);
      }
    } else {
      console.log(
        "[SideArtifactPanel] Handling other action type:",
        action.type,
        action.payload,
      );
      alert(
        `Action type: ${action.type} \nPayload: ${JSON.stringify(action.payload)}`,
      );
    }
  };

  const panelBaseClasses =
    "bg-white shadow-2xl flex flex-col transition-all duration-300 ease-in-out border-gray-200";
  let panelSizeAndPositionClasses = "";

  if (isExpanded) {
    panelSizeAndPositionClasses =
      "fixed inset-4 sm:inset-6 md:inset-8 lg:inset-10 z-40 rounded-xl border";
  } else {
    panelSizeAndPositionClasses =
      "fixed top-0 right-0 h-full w-4/5 sm:w-3/5 md:w-7/12 lg:w-1/2 xl:w-5/12 z-30 border-l";
  }

  // Ensure script generation actions are available
  const currentSuggestedActions = data.actionSuggestions?.actions || [];
  const alwaysAvailableScriptActions: SuggestedAction[] = [
    {
      title: "Generate Call Script",
      description: "Create a sales call script for the current context.",
      priority: "medium",
      type: "generate_call_script",
    },
    {
      title: "Generate Email Script",
      description: "Create a sales email script for the current context.",
      priority: "medium",
      type: "generate_email_script",
    },
  ];

  const allDisplayableActions = [...currentSuggestedActions];
  alwaysAvailableScriptActions.forEach((manualAction) => {
    if (!allDisplayableActions.find((a) => a.title === manualAction.title)) {
      allDisplayableActions.push(manualAction);
    }
  });

  const actionSuggestionsForQueryResults = {
    actions: allDisplayableActions,
    summary:
      data.actionSuggestions?.summary || "Review actions or generate scripts.",
  };

  return (
    <>
      {isExpanded && (
        <div
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm"
          onClick={onToggleExpand}
        ></div>
      )}

      <div className={`${panelBaseClasses} ${panelSizeAndPositionClasses}`}>
        <div className="flex flex-shrink-0 items-center justify-between border-b border-gray-200 bg-gray-50 p-3.5">
          <h3 className="text-md truncate font-semibold text-gray-700">
            {data.viewMode === "leadGenerator"
              ? "Lead Generator"
              : "Query Analysis & Results"}
          </h3>

          <div className="flex items-center space-x-1.5">
            <button
              onClick={onToggleExpand}
              className="rounded-md p-1.5 text-gray-500 hover:bg-gray-200 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
              title={isExpanded ? "Collapse" : "Expand"}
            >
              {isExpanded ? (
                <ArrowsPointingInIcon className="h-5 w-5" />
              ) : (
                <ArrowsPointingOutIcon className="h-5 w-5" />
              )}
            </button>
            <button
              onClick={onClose}
              className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
              title="Close"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex-grow space-y-4 overflow-y-auto p-4">
          {data.error && (
            <div className="rounded-md border border-red-200 bg-red-50 p-4 text-red-700">
              <h4 className="font-medium">Error Processing Query</h4>
              <p>{data.error}</p>
            </div>
          )}

          {/* Use the renderContent function here instead of inline conditional */}
          {renderContent()}

          {data.queryResults &&
            data.queryResults.length === 0 &&
            data.sqlQuery &&
            !data.error && (
              <p className="rounded-md bg-gray-100 p-3 text-sm text-gray-600">
                No clients match these criteria.
              </p>
            )}

          {!data.sqlQuery &&
            !data.error &&
            data.viewMode !== "leadGenerator" && (
              <p className="p-3 text-sm text-gray-500">
                No details to display for this message.
              </p>
            )}
        </div>
      </div>

      {/* Script Modal */}
      {scriptModal && (
        <ScriptModal
          isOpen={scriptModal.isOpen}
          onClose={() => setScriptModal(null)}
          scriptType={scriptModal.type}
          clientName={scriptModal.clientName}
          script={scriptModal.script}
        />
      )}
    </>
  );
};

export default SideArtifactPanel;
