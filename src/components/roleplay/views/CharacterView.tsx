import React from 'react';
import { Command } from 'cmdk';
import { Character, Scenario } from '../types';

interface CharacterViewProps {
  characters: Character[];
  scenarios: Scenario[];
  loading: boolean;
  search: string;
  onSearchChange: (value: string) => void;
  onBackClick: () => void;
  onStartSession: (scenario: Scenario, character?: Character) => void;
  onClose: () => void;
}

export const CharacterView: React.FC<CharacterViewProps> = ({
  characters,
  scenarios,
  loading,
  search,
  onSearchChange,
  onBackClick,
  onStartSession,
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
          placeholder="Search characters..."
          className="flex h-14 w-full rounded-md bg-transparent py-4 text-base outline-none placeholder:text-white/70 dark:placeholder:text-gray-300 disabled:cursor-not-allowed disabled:opacity-50 text-white dark:text-gray-100"
          value={search}
          onValueChange={onSearchChange}
          autoFocus
        />
      </div>
      <Command.List className="max-h-96 overflow-y-auto p-3">
        {loading ? (
          <div className="py-6 text-center text-sm text-white/70 dark:text-gray-300">
            Loading characters...
          </div>
        ) : (
          <>
            <Command.Empty className="py-6 text-center text-sm text-white/70 dark:text-gray-300">
              No characters found.
            </Command.Empty>
            
            <Command.Group heading="Available Characters" className="text-xs font-medium text-white/70 dark:text-gray-300 px-2 py-1.5">
              {characters.map((character) => (
                <Command.Item
                  key={character.id}
                  value={`${character.name} ${character.role} ${character.personality} ${character.background}`}
                  onSelect={() => {
                    // Use the first available scenario for now
                    const scenario = scenarios[0];
                    if (scenario) {
                      onStartSession(scenario, character);
                      onClose();
                    }
                  }}
                  className="
                    relative flex cursor-pointer select-none items-center rounded-md px-3 py-4 text-base outline-none 
                    data-[selected=true]:bg-gray-200/30 data-[selected=true]:dark:bg-gray-600 data-[selected=true]:text-white data-[selected=true]:dark:text-gray-100
                    hover:bg-gray-200/30 hover:dark:bg-gray-600 text-white dark:text-gray-100
                  "
                >
                  <div className="flex items-center space-x-3 w-full">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 dark:bg-gray-700 flex-shrink-0">
                      <span className="text-sm font-medium text-white dark:text-gray-100">
                        {character.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div className="flex flex-col flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-white dark:text-gray-100">{character.name}</span>
                        <div className="flex items-center space-x-2 flex-shrink-0">
                          <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            {character.role}
                          </span>
                          {character.voice_id && (
                            <svg className="h-4 w-4 text-white/70 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                            </svg>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-white/80 dark:text-gray-300 mt-1 line-clamp-1">
                        {character.personality}
                      </p>
                      <p className="text-xs text-white/70 dark:text-gray-400 mt-1 line-clamp-2 leading-relaxed">
                        {character.background}
                      </p>
                      
                      {character.objections && character.objections.length > 0 && (
                        <div className="mt-2">
                          <span className="text-xs text-white/80 dark:text-gray-300 font-medium">Common objections:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {character.objections.slice(0, 2).map((objection, idx) => (
                              <span key={idx} className="text-xs bg-white/20 dark:bg-gray-700 px-2 py-1 rounded text-white/80 dark:text-gray-300">
                                {objection}
                              </span>
                            ))}
                            {character.objections.length > 2 && (
                              <span className="text-xs text-white/60 dark:text-gray-400">
                                +{character.objections.length - 2} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="mt-2 text-xs text-white/60 dark:text-gray-400">
                        Click to start roleplay with this character
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