import React from 'react';
import { Command } from 'cmdk';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Scenario, Character } from '../types';

interface RoleplaySessionViewProps {
  scenario: Scenario;
  character?: Character;
  onBackClick: () => void;
  onStartSession: (scenario: Scenario, character?: Character) => void;
  onClose: () => void;
}

export const RoleplaySessionView: React.FC<RoleplaySessionViewProps> = ({
  scenario,
  character,
  onBackClick,
  onStartSession,
  onClose
}) => {
  const handleStartCall = () => {
    onStartSession(scenario, character);
    onClose();
  };

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
        <div className="flex h-14 w-full items-center py-4 text-base font-medium text-white dark:text-gray-100">
          Start Roleplay Session
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto p-6">
        <div className="space-y-6">
          {/* Scenario Details */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 dark:bg-gray-700 flex-shrink-0">
                <svg className="h-6 w-6 text-white/70 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="flex flex-col flex-1 min-w-0">
                <h2 className="text-lg font-semibold text-white dark:text-gray-100">{scenario.title}</h2>
                <Badge className="w-fit px-2 py-1 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  Scenario
                </Badge>
              </div>
            </div>

            <p className="text-sm text-white/80 dark:text-gray-300 leading-relaxed">
              {scenario.description}
            </p>
          </div>

          {/* Character Details (if selected) */}
          {character && (
            <>
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 dark:bg-gray-700 flex-shrink-0">
                    <span className="text-sm font-medium text-white dark:text-gray-100">
                      {character.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-white dark:text-gray-100">{character.name}</h3>
                    <Badge className="w-fit px-2 py-1 text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      {character.role}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-medium text-white/90 dark:text-gray-200 mb-1">Personality</h4>
                    <p className="text-sm text-white/80 dark:text-gray-300">{character.personality}</p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-white/90 dark:text-gray-200 mb-1">Background</h4>
                    <p className="text-sm text-white/80 dark:text-gray-300">{character.background}</p>
                  </div>

                  {character.objections && character.objections.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-white/90 dark:text-gray-200 mb-2">Common Objections</h4>
                      <div className="flex flex-wrap gap-2">
                        {character.objections.map((objection, idx) => (
                          <span key={idx} className="text-xs bg-white/20 dark:bg-gray-700 px-3 py-1 rounded-full text-white/80 dark:text-gray-300">
                            {objection}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {character.voice_id && (
                    <div className="flex items-center space-x-2 pt-2">
                      <svg className="h-4 w-4 text-white/70 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                      </svg>
                      <span className="text-xs text-white/70 dark:text-gray-300">Voice enabled</span>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Session Info */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <div className="bg-white/10 dark:bg-gray-800/50 rounded-lg p-4 space-y-2">
              <h4 className="text-sm font-medium text-white/90 dark:text-gray-200">Session Information</h4>
              <div className="text-xs text-white/70 dark:text-gray-400 space-y-1">
                <p>• This roleplay session will be recorded for analysis</p>
                <p>• You'll receive detailed feedback after the session</p>
                <p>• Voice interaction is enabled - speak naturally</p>
                <p>• Use the text input as backup if voice fails</p>
              </div>
            </div>
          </div>

          {/* Start Button */}
          <div className="pt-4">
            <Button
              onClick={handleStartCall}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium py-3"
            >
              <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              Start Voice Call
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};