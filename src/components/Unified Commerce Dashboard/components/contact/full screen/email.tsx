// src/components/EmailsTabContent.jsx
import React from 'react';

import { Mail, ArrowUpRightSquare, ArrowDownLeftSquare, Edit, PlusCircle } from 'lucide-react';
import { formatDate } from '@/components/Unified Commerce Dashboard/utils/utils';
import { RecentActivityItem } from '../detailed-contacts';

interface EmailsTabContentProps {
  activities: RecentActivityItem[];
  contactEmail: string;
  contactName: string;
}

export function EmailsTabContent({ activities, contactEmail, contactName }: EmailsTabContentProps) {
  const emailActivities = (activities || [])
    .filter(activity => activity.type === 'Email')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleComposeEmail = () => {
    alert(`Placeholder: Compose new email to ${contactName} (${contactEmail})`);
  };

  return (
    <div className="p-4 sm:p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-200 flex-shrink-0">
        <h3 className="text-xl font-semibold text-slate-800">Email History</h3>
        <button
          onClick={handleComposeEmail}
          className="flex items-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md text-sm transition-colors"
        >
          <Edit className="h-4 w-4 mr-2" />
          Compose Email
        </button>
      </div>

      {emailActivities.length === 0 ? (
        <div className="flex-grow flex flex-col items-center justify-center text-center py-10">
          <Mail className="h-16 w-16 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-500 text-lg">No emails logged for {contactName} yet.</p>
          <p className="text-slate-400 text-sm mt-2">Click "Compose Email" or log past email activities.</p>
        </div>
      ) : (
        <div className="flex-grow overflow-y-auto space-y-4 pr-2 -mr-2">
          {emailActivities.map(email => {
            const isOutgoing = email.details?.from && !email.details.from.toLowerCase().includes(contactEmail.toLowerCase());
            const fromParty = isOutgoing ? "You" : (email.details?.from || "Unknown Sender");
            const toParty = isOutgoing ? (email.details?.to || contactName) : "You";

            return (
              <div key={email.id} className="p-4 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center space-x-2">
                    {isOutgoing ? (
                      <ArrowUpRightSquare className="h-4 w-4 text-blue-500 flex-shrink-0"  />
                    ) : (
                      <ArrowDownLeftSquare className="h-4 w-4 text-green-500 flex-shrink-0" />
                    )}
                    <p className="text-sm font-semibold text-slate-800 truncate" title={email.details?.subject || 'No Subject'}>
                      {email.details?.subject || '(No Subject)'}
                    </p>
                  </div>
                  <span className="text-xs text-slate-500 flex-shrink-0 ml-2">{formatDate(email.date)}</span>
                </div>
                <div className="text-xs text-slate-500 mb-2">
                  <span>From: {fromParty}</span> • <span>To: {toParty}</span>
                  {email.user && !isOutgoing && <span className="italic"> (Logged by: {email.user})</span>}
                </div>
                <p className="text-sm text-slate-600 leading-relaxed line-clamp-3" title={email.description}>
                  {email.description}
                </p>
                {/* Placeholder for "View Full Email" or expand functionality */}
                {/* <button className="text-xs text-blue-600 hover:underline mt-1">View full email</button> */}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}