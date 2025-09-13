import React from 'react';
import { Command } from 'cmdk';
import { Scenario } from '../types';

interface ScenarioViewProps {
  scenarios: Scenario[];
  loading: boolean;
  search: string;
  onSearchChange: (value: string) => void;
  onBackClick: () => void;
  onStartSession: (scenario: Scenario) => void;
  onNavigateToSession: (scenario: Scenario) => void;
  onClose: () => void;
}

export const ScenarioView: React.FC<ScenarioViewProps> = ({
  scenarios,
  loading,
  search,
  onSearchChange,
  onBackClick,
  onStartSession,
  onNavigateToSession,
  onClose
}) => {
  return (
    <>
      <div className="flex items-center border-b border-gray-200 dark:border-gray-700 px-3">
        <button
          onClick={onBackClick}
          className="mr-2 p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded text-white dark:text-gray-100"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <svg
          className="mr-2 h-5 w-5 shrink-0 opacity-50 text-white/70 dark:text-gray-300"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <Command.Input
          placeholder="Search scenarios..."
          className="flex h-14 w-full rounded-md bg-transparent py-4 text-base outline-none placeholder:text-white/70 dark:placeholder:text-gray-300 disabled:cursor-not-allowed disabled:opacity-50 text-white dark:text-gray-100"
          value={search}
          onValueChange={onSearchChange}
          autoFocus
        />
      </div>
      <Command.List className="max-h-96 overflow-y-auto p-3">
        {loading ? (
          <div className="py-6 text-center text-sm text-white/70 dark:text-gray-300">
            Loading scenarios...
          </div>
        ) : (
          <>
            <Command.Empty className="py-6 text-center text-sm text-white/70 dark:text-gray-300">
              No scenarios found.
            </Command.Empty>
            
            <Command.Group heading="Available Scenarios" className="text-xs font-medium text-white/70 dark:text-gray-300 px-2 py-1.5">
              {scenarios.map((scenario) => (
                <Command.Item
                  key={scenario.id}
                  value={`${scenario.title} ${scenario.description}`}
                  onSelect={() => {
                    onNavigateToSession(scenario);
                  }}
                  className="
                    relative flex cursor-pointer select-none items-center rounded-md px-3 py-4 text-base outline-none 
                    data-[selected=true]:bg-gray-200/30 data-[selected=true]:dark:bg-gray-600 data-[selected=true]:text-white data-[selected=true]:dark:text-gray-100
                    hover:bg-gray-200/30 hover:dark:bg-gray-600 text-white dark:text-gray-100
                  "
                >
                  <div className="flex items-center space-x-3 w-full">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 dark:bg-gray-700 flex-shrink-0">
                      <svg className="h-6 w-6 text-white/70 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="flex flex-col flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-white dark:text-gray-100 truncate">{scenario.title}</span>
                        <div className="flex items-center space-x-2 flex-shrink-0">
                          <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            Roleplay
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-white/80 dark:text-gray-300 mt-1 line-clamp-3 leading-relaxed">
                        {scenario.description}
                      </p>
                      <div className="mt-2 text-xs text-white/60 dark:text-gray-400">
                        Click to prepare this roleplay scenario
                      </div>
                    </div>
                  </div>
                </Command.Item>
              ))}
            </Command.Group>
          </>
        )}
      </Command.List>
    </>
  );
};