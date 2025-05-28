'use client';

import { ActionSuggestion } from '@/types/otf';
import React, { useState } from 'react';


interface ActionSuggestionsProps {
  actions: ActionSuggestion[];
  summary: string;
}

/**
 * Component to display AI-generated action suggestions for client outreach
 */
export default function ActionSuggestions({ actions, summary }: ActionSuggestionsProps) {
  const [expandedAction, setExpandedAction] = useState<number | null>(null);
  
  const toggleExpand = (index: number) => {
    setExpandedAction(expandedAction === index ? null : index);
  };
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getEffortColor = (effort: string) => {
    switch (effort) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Copy script to clipboard
  const copyToClipboard = (text: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent toggling the panel
    navigator.clipboard.writeText(text)
      .then(() => {
        alert('Script copied to clipboard!');
      })
      .catch(err => {
        console.error('Failed to copy text: ', err);
      });
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-4 bg-orange-50 border-b border-orange-100">
        <h3 className="text-lg font-medium text-gray-900">Recommended Actions</h3>
        <p className="mt-1 text-sm text-gray-600">{summary}</p>
      </div>
      
      <ul className="divide-y divide-gray-200">
        {actions.map((action, index) => (
          <li key={index} className="p-4 hover:bg-gray-50 transition-colors">
            <div 
              className="flex justify-between items-start cursor-pointer"
              onClick={() => toggleExpand(index)}
            >
              <div className="flex-1">
                <div className="flex items-center mb-1">
                  <h4 className="text-base font-medium text-gray-900 mr-2">
                    {action.title}
                  </h4>
                  <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(action.priority)}`}>
                    {action.priority} priority
                  </span>
                  <span className={`ml-2 text-xs px-2 py-1 rounded-full ${getEffortColor(action.effort)}`}>
                    {action.effort} effort
                  </span>
                </div>
                <p className="text-sm text-gray-600">{action.description}</p>
              </div>
              <svg 
                className={`w-5 h-5 text-gray-500 transform transition-transform ${expandedAction === index ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </div>
            
            {expandedAction === index && action.scriptTemplate && (
              <div className="mt-4 bg-gray-50 p-3 rounded-md border border-gray-200">
                <h5 className="text-sm font-medium text-gray-700 mb-2">Script Template</h5>
                <div className="relative">
                  <pre className="text-sm text-gray-600 bg-white p-3 rounded border border-gray-200 overflow-x-auto whitespace-pre-wrap">
                    {action.scriptTemplate}
                  </pre>
                  <button 
                    className="absolute top-2 right-2 bg-white text-gray-500 hover:text-gray-700 p-1 rounded border border-gray-200"
                    onClick={(e) => copyToClipboard(action.scriptTemplate || '', e)}
                    title="Copy to clipboard"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
      
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <button className="w-full py-2 px-4 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-md">
          Create Email Campaign
        </button>
        <button className="w-full mt-2 py-2 px-4 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-md">
          Export Call List
        </button>
      </div>
    </div>
  );
}

/**
 * Loading state component for action suggestions
 */
export function ActionSuggestionsLoading() {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-4 bg-orange-50 border-b border-orange-100 animate-pulse">
        <div className="h-5 bg-orange-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-orange-200 rounded w-full"></div>
      </div>
      
      <div className="divide-y divide-gray-200">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-4 animate-pulse">
            <div className="h-5 bg-gray-200 rounded w-2/3 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-1"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    </div>
  );
}