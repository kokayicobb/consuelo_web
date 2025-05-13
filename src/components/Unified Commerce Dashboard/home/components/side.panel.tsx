// src/app/chat/segmentation/SideArtifactPanel.tsx (or your path)
"use client";

import React from 'react';

import { XMarkIcon, ArrowsPointingOutIcon, ArrowsPointingInIcon } from '@heroicons/react/24/outline';
import { ChatMessageData } from '@/types/chats';
import { QueryResults } from '../../segmentation';

interface SideArtifactPanelProps {
  data: ChatMessageData | null;
  isOpen: boolean;
  isExpanded: boolean;
  onClose: () => void;
  onToggleExpand: () => void;
  onViewModeChange: (newMode: "table" | "chart" | "actions") => void;
}

const SideArtifactPanel: React.FC<SideArtifactPanelProps> = ({
  data,
  isOpen,
  isExpanded,
  onClose,
  onToggleExpand,
  onViewModeChange
}) => {
  if (!isOpen || !data) {
    return null;
  }

  const panelBaseClasses = "bg-white shadow-2xl flex flex-col transition-all duration-300 ease-in-out border-gray-200";
  let panelSizeAndPositionClasses = "";

  if (isExpanded) {
    // Fullscreen popup style
    panelSizeAndPositionClasses = "fixed inset-4 sm:inset-6 md:inset-8 lg:inset-10 z-40 rounded-xl border";
  } else {
    // Wider default sidebar: 60% on small, 50% on medium, 40% on large+
    panelSizeAndPositionClasses = "fixed top-0 right-0 h-full w-4/5 sm:w-3/5 md:w-7/12 lg:w-1/2 xl:w-5/12 z-30 border-l";
  }

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
              setViewMode={onViewModeChange} // This now updates sideArtifactData.viewMode
              chartConfig={data.chartConfig}
              isLoadingChart={data.isLoadingChart}
              actionSuggestions={data.actionSuggestions}
              isLoadingActions={data.isLoadingActions}
              isCompactView={!isExpanded} // Pass compact view based on panel expansion
            />
          ) : null}
          {data.queryResults && data.queryResults.length === 0 && data.sqlQuery && !data.error && (
            <p className="text-sm text-gray-600 p-3 bg-gray-100 rounded-md">No clients match these criteria.</p>
          )}
           {!data.sqlQuery && !data.error && (
             <p className="text-sm text-gray-500 p-3">No details to display for this message.</p>
           )}
        </div>
      </div>
    </>
  );
};

export default SideArtifactPanel;