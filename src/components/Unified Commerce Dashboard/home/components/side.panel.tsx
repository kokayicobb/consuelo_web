// src/app/chat/segmentation/SideArtifactPanel.tsx (or your path)
"use client";

import React, { useState } from 'react'; // Added useState

import { XMarkIcon, ArrowsPointingOutIcon, ArrowsPointingInIcon } from '@heroicons/react/24/outline';
import type { ChatMessageData } from '@/types/chats'; // Ensure ChatMessageData can hold userQuery
import { QueryResults } from '../../segmentation'; // Make sure this path is correct


import type { OtfContactLog } from '@/types/otf'; // Adjust path
import { generateSalesScript } from '@/lib/actions';
import { SuggestedAction } from '../../segmentation/action-suggestions';

interface SideArtifactPanelProps {
  data: ChatMessageData | null; // ChatMessageData should ideally include userQuery
  userQuery?: string; // << OR pass userQuery as a separate prop
  isOpen: boolean;
  isExpanded: boolean;
  onClose: () => void;
  onToggleExpand: () => void;
  onViewModeChange: (newMode: "table" | "chart" | "actions") => void;
}

const SideArtifactPanel: React.FC<SideArtifactPanelProps> = ({
  data,
  userQuery, // << Destructure userQuery if passed as separate prop
  isOpen,
  isExpanded,
  onClose,
  onToggleExpand,
  onViewModeChange
}) => {
  // --- STATE FOR SCRIPT GENERATION MODAL ---
  const [generatedScriptModalOpen, setGeneratedScriptModalOpen] = useState(false);
  const [generatedScriptContent, setGeneratedScriptContent] = useState("");
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);

  if (!isOpen || !data) {
    return null;
  }

  // Resolve userQuery: prefer prop, then from data object
  const currentQueryContext = userQuery || data?.userQuery || ""; // <<< Get userQuery

  // --- handleInitiateAction IMPLEMENTATION ---
  const handleInitiateAction = async (action: SuggestedAction) => {
    console.log('[SideArtifactPanel] handleInitiateAction triggered. Action:', action);

    if (action.type === "generate_call_script" || action.type === "generate_email_script") {
      console.log(`[SideArtifactPanel] Matched script generation type: ${action.type}`);
      setIsGeneratingScript(true);
      setGeneratedScriptContent("");

      let logsForScript: OtfContactLog[] = [];
      let specificClientName: string | undefined = undefined;
      
      // Use displayableResults logic similar to QueryResults, or directly from data.queryResults
      const resultsToUse =
        data.queryResults &&
        data.queryResults.length > 0 &&
        Array.isArray(data.queryResults[0]) &&
        typeof data.queryResults[0] !== 'string'
          ? data.queryResults[0]
          : (data.queryResults || []);

      console.log('[SideArtifactPanel] Current queryResults for script:', resultsToUse);
      console.log('[SideArtifactPanel] Current userQuery/context for script:', currentQueryContext);


      if (action.payload?.clientId && resultsToUse.length > 0) {
        const targetClient = resultsToUse.find(client => client["Client ID"] === action.payload.clientId);
        if (targetClient) {
          logsForScript = targetClient.contact_logs || [];
          specificClientName = targetClient["Client"];
          console.log(`[SideArtifactPanel] Script for specific client: ${specificClientName}, Logs:`, logsForScript.length);
        }
      } else if (resultsToUse.length > 0) {
        logsForScript = resultsToUse.flatMap(client => client.contact_logs || []).filter(log => log);
        console.log(`[SideArtifactPanel] Script based on all ${logsForScript.length} logs from ${resultsToUse.length} clients.`);
        if (resultsToUse.length === 1 && resultsToUse[0]["Client"]) {
            specificClientName = resultsToUse[0]["Client"];
        }
      } else {
        console.log('[SideArtifactPanel] No specific client or logs found. Generating generic script.');
      }

      try {
        const scriptParams = {
          contactLogs: logsForScript.length > 0 ? logsForScript : undefined,
          scriptType: action.type === "generate_call_script" ? 'call' : 'email' as 'call' | 'email',
          clientName: specificClientName,
          queryContext: currentQueryContext,
        };
        console.log('[SideArtifactPanel] Calling generateSalesScript with params:', scriptParams);

        const script = await generateSalesScript(scriptParams);

        console.log('[SideArtifactPanel] Script generated successfully:', script);
        setGeneratedScriptContent(script);
        setGeneratedScriptModalOpen(true);

      } catch (error) {
        console.error('[SideArtifactPanel] Error generating script:', error);
        alert(`Error generating script: ${error instanceof Error ? error.message : "Unknown error"}`);
        setGeneratedScriptContent(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
        setGeneratedScriptModalOpen(true);
      } finally {
        setIsGeneratingScript(false);
      }
    } else {
      console.log('[SideArtifactPanel] Handling other action type:', action.type, action.payload);
      alert(`Action type: ${action.type} \nPayload: ${JSON.stringify(action.payload)}`);
    }
  };

  // --- SCRIPT DISPLAY MODAL (simple version) ---
  const ScriptDisplayModal = () => (
    <div style={{
        position: 'fixed', top: '0', left: '0', right: '0', bottom: '0',
        backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
        alignItems: 'center', justifyContent: 'center', zIndex: 1050 // Higher z-index
    }}>
      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', width: '80%', maxWidth: '600px', maxHeight: '80vh', overflowY: 'auto' }}>
        <h3>Generated Script</h3>
        {isGeneratingScript ? <p>Loading...</p> : <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>{generatedScriptContent}</pre>}
        <button onClick={() => setGeneratedScriptModalOpen(false)} style={{ marginTop: '10px', padding: '8px 12px', cursor: 'pointer' }}>Close</button>
      </div>
    </div>
  );

  const panelBaseClasses = "bg-white shadow-2xl flex flex-col transition-all duration-300 ease-in-out border-gray-200";
  let panelSizeAndPositionClasses = "";

  if (isExpanded) {
    panelSizeAndPositionClasses = "fixed inset-4 sm:inset-6 md:inset-8 lg:inset-10 z-40 rounded-xl border";
  } else {
    panelSizeAndPositionClasses = "fixed top-0 right-0 h-full w-4/5 sm:w-3/5 md:w-7/12 lg:w-1/2 xl:w-5/12 z-30 border-l";
  }

  // --- Ensure script generation actions are available ---
  const currentSuggestedActions = data.actionSuggestions?.actions || [];
  const alwaysAvailableScriptActions: SuggestedAction[] = [ // Ensure SuggestedAction type is used
      { title: "Generate Call Script", description: "Create a sales call script for the current context.", priority: "medium", type: "generate_call_script" },
      { title: "Generate Email Script", description: "Create a sales email script for the current context.", priority: "medium", type: "generate_email_script" }
  ];

  const allDisplayableActions = [...currentSuggestedActions];
  alwaysAvailableScriptActions.forEach(manualAction => {
      if (!allDisplayableActions.find(a => a.title === manualAction.title)) {
          allDisplayableActions.push(manualAction);
      }
  });
  const actionSuggestionsForQueryResults = {
      actions: allDisplayableActions,
      summary: data.actionSuggestions?.summary || "Review actions or generate scripts."
  };


  return (
    <>
      {isExpanded && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30"
          onClick={onToggleExpand}
        ></div>
      )}

      <div className={`${panelBaseClasses} ${panelSizeAndPositionClasses}`}>
        <div className="flex items-center justify-between p-3.5 border-b border-gray-200 bg-gray-50 flex-shrink-0">
          {/* ... header ... */}
           <h3 className="text-md font-semibold text-gray-700 truncate">
            Query Analysis & Results
          </h3>
          <div className="flex items-center space-x-1.5">
            <button
              onClick={onToggleExpand}
              className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
              title={isExpanded ? "Collapse" : "Expand"}
            >
              {isExpanded ? <ArrowsPointingInIcon className="w-5 h-5" /> : <ArrowsPointingOutIcon className="w-5 h-5" />}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-100 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              title="Close"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-grow p-4 overflow-y-auto space-y-4">
          {data.error && (
            // ... error display ...
            <div className="rounded-md bg-red-50 p-4 text-red-700 border border-red-200">
              <h4 className="font-medium">Error Processing Query</h4>
              <p>{data.error}</p>
            </div>
          )}

          {(data.queryResults && data.queryResults.length > 0) || (data.sqlQuery && (!data.queryResults || data.queryResults.length === 0)) ? (
            <QueryResults
              results={data.queryResults || []}
              columns={data.columns || []}
              viewMode={data.viewMode || 'cards'}
              setViewMode={onViewModeChange}
              chartConfig={data.chartConfig}
              isLoadingChart={!!data.isLoadingChart} // Ensure boolean
              actionSuggestions={actionSuggestionsForQueryResults} // Pass combined actions
              isLoadingActions={!!data.isLoadingActions} // Ensure boolean
              isCompactView={!isExpanded}
              onInitiateAction={handleInitiateAction} // <<<< PASS THE HANDLER HERE
            />
          ) : null}
          {/* ... rest of your conditional rendering ... */}
           {data.queryResults && data.queryResults.length === 0 && data.sqlQuery && !data.error && (
            <p className="text-sm text-gray-600 p-3 bg-gray-100 rounded-md">No clients match these criteria.</p>
          )}
           {!data.sqlQuery && !data.error && (
             <p className="text-sm text-gray-500 p-3">No details to display for this message.</p>
           )}
        </div>
      </div>
      {generatedScriptModalOpen && <ScriptDisplayModal />}
    </>
  );
};

export default SideArtifactPanel;