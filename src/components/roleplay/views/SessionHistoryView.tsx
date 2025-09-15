import React from 'react';
import {
  RoleplaySession,
  SessionAnalytics,
  Scenario,
  Character,
  ViewType
} from '../types';
// Utility functions
function formatSessionDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  if (minutes === 0) {
    return `${remainingSeconds}s`;
  } else if (remainingSeconds === 0) {
    return `${minutes}m`;
  } else {
    return `${minutes}m ${remainingSeconds}s`;
  }
}

function getSessionDuration(session: RoleplaySession): number {
  if (session.total_duration) {
    return session.total_duration;
  }
  
  if (session.end_time) {
    const start = new Date(session.start_time).getTime();
    const end = new Date(session.end_time).getTime();
    return Math.floor((end - start) / 1000);
  }
  
  return 0;
}

async function fetchSessionAnalytics(sessionId: string): Promise<SessionAnalytics | null> {
  try {
    const response = await fetch(`/api/roleplay/analytics/${sessionId}`);
    
    if (!response.ok) {
      console.warn('Analytics API not available');
      return null;
    }
    
    const data = await response.json();
    return data.analytics;
  } catch (error) {
    console.warn('Error fetching session analytics:', error);
    return null;
  }
}

interface SessionHistoryViewProps {
  sessions: RoleplaySession[];
  scenarios: Scenario[];
  characters: Character[];
  loading: boolean;
  onNavigateBack: () => void;
  onResumeSession: (session: RoleplaySession) => void;
  onClose: () => void;
  onSelectAnalytics: (analytics: SessionAnalytics) => void;
  onChangeView: (view: ViewType) => void;
}

export const SessionHistoryView: React.FC<SessionHistoryViewProps> = ({
  sessions,
  scenarios,
  characters,
  loading,
  onNavigateBack,
  onResumeSession,
  onClose,
  onSelectAnalytics,
  onChangeView
}) => {
  const handleSessionClick = (session: RoleplaySession) => {
    if (session.status === 'active' || session.status === 'paused') {
      onResumeSession(session);
      onClose();
    }
    // For completed sessions, we could navigate to a session detail view
    // but that's not implemented in the original specification
  };

  const handleAnalyticsClick = async (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    try {
      const analytics = await fetchSessionAnalytics(sessionId);
      if (analytics) {
        onSelectAnalytics(analytics);
        onChangeView('analytics_detail');
      }
    } catch (error) {
      console.error('Error fetching session analytics:', error);
    }
  };

  return (
    <>
      <div className="flex items-center border-b border-gray-200 dark:border-gray-700 px-3">
        <button
          onClick={onNavigateBack}
          className="mr-2 p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded text-white dark:text-gray-100"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex h-14 w-full items-center py-4 text-base font-medium text-white dark:text-gray-100">
          Session History
          {loading && <span className="ml-2 text-sm text-white/70 dark:text-gray-300">Loading...</span>}
        </div>
      </div>
      <div className="max-h-96 overflow-y-auto p-3">
        {sessions.length === 0 && !loading ? (
          <div className="py-6 text-center text-sm text-white/70 dark:text-gray-300">
            No session history found. Start your first roleplay!
          </div>
        ) : (
          <div className="space-y-2">
            {sessions.map((session) => {
              const scenario = scenarios.find(s => s.id === session.scenario_id);
              const character = characters.find(c => c.id === session.character_id);
              const duration = getSessionDuration(session);
              
              return (
                <div
                  key={session.id}
                  className="
                    flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700
                    hover:bg-gray-200/30 dark:hover:bg-gray-600 cursor-pointer transition-colors
                  "
                  onClick={() => handleSessionClick(session)}
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 dark:bg-gray-700">
                        {session.status === 'active' ? (
                          <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse"></div>
                        ) : session.status === 'completed' ? (
                          <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg className="h-5 w-5 text-white/70 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium text-white dark:text-gray-100">
                          {scenario?.title || 'Unknown Scenario'}
                        </span>
                        <div className="flex items-center space-x-2 text-xs text-white/70 dark:text-gray-300">
                          <span className="capitalize">{session.status}</span>
                          {character && (
                            <>
                              <span>•</span>
                              <span>{character.name}</span>
                            </>
                          )}
                          <span>•</span>
                          <span>{new Date(session.start_time).toLocaleDateString()}</span>
                          {duration > 0 && (
                            <>
                              <span>•</span>
                              <span>{formatSessionDuration(duration)}</span>
                            </>
                          )}
                          {session.voice_enabled && (
                            <>
                              <span>•</span>
                              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                              </svg>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <button
                      onClick={(e) => handleAnalyticsClick(e, session.session_id)}
                      className="
                        p-2 text-white/70 hover:text-white dark:hover:text-gray-100 hover:bg-gray-200/30 dark:hover:bg-gray-600 rounded-full
                        transition-colors flex-shrink-0
                      "
                      title="View analytics"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </button>
                    {session.status === 'active' && (
                      <span className="text-xs text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded font-medium">
                        Resume
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};