// src/components/CallsTabContent.tsx
import React from 'react';

import { Phone, Edit3, PlusCircle } from 'lucide-react';
import { RecentActivityItem } from '../detailed-contacts';
import { formatDate } from '@/components/Unified Commerce Dashboard/utils/utils';

// Helper for formatting duration (example)
// export const formatDuration = (durationString?: string): string => {
//   if (!durationString) return 'N/A';
//   // Add logic to parse and format, e.g., "30 mins" -> "30 minutes" or handle seconds
//   return durationString;
// };


interface CallsTabContentProps {
  activities: RecentActivityItem[];
  contactName: string;
  onLogCall: () => void; // Callback for logging a new call
}

export function CallsTabContent({ activities, contactName, onLogCall }: CallsTabContentProps) {
  const callActivities = (activities || [])
    .filter(activity => activity.type === 'Call')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="p-4 sm:p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-200 flex-shrink-0">
        <h3 className="text-xl font-semibold text-slate-800">Call Log</h3>
        <button
          onClick={onLogCall}
          className="flex items-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md text-sm transition-colors"
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Log Call
        </button>
      </div>

      {callActivities.length === 0 ? (
        <div className="flex-grow flex flex-col items-center justify-center text-center py-10">
          <Phone className="h-16 w-16 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-500 text-lg">No calls logged for {contactName} yet.</p>
          <p className="text-slate-400 text-sm mt-2">Click "Log Call" to add call details.</p>
        </div>
      ) : (
        <div className="flex-grow overflow-y-auto space-y-4 pr-2 -mr-2">
          {callActivities.map(call => (
            <div key={call.id} className="p-4 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200">
              <div className="flex items-start justify-between mb-1">
                <div className="flex items-center space-x-2">
                  <Phone className="h-5 w-5 text-sky-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-slate-800">
                      Call
                      {call.user && <span className="text-slate-500 font-normal"> with {call.user}</span>}
                    </p>
                    <p className="text-xs text-slate-500">
                      {formatDate(call.date)}
                      {call.details?.duration && ` • Duration: ${call.details.duration}`} {/* Use formatDuration if created */}
                    </p>
                  </div>
                </div>
                {/* <button title="Edit Call" className="p-1 text-slate-400 hover:text-blue-600 rounded"><Edit3 size={14}/></button> */}
              </div>
              <p className="text-sm text-slate-600 leading-relaxed mt-1">{call.description}</p>
              {call.details?.outcome && <p className="text-xs text-slate-500 mt-1">Outcome: {call.details.outcome}</p>}
              {call.sentiment && (
                <span className={`mt-2 inline-block px-1.5 py-0.5 rounded-full text-xs font-medium
                  ${call.sentiment === 'Positive' ? 'bg-green-100 text-green-700' :
                    call.sentiment === 'Negative' ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'}`}>
                  Sentiment: {call.sentiment}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}