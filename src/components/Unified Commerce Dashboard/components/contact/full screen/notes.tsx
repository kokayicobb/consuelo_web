// src/components/NotesTabContent.tsx
import React from 'react';

import { FileText as NoteIcon, PlusCircle } from 'lucide-react';
import { DetailedContact } from '../detailed-contacts';
import { formatDate } from '@/components/Unified Commerce Dashboard/utils/utils';

interface NotesTabContentProps {
  contact: DetailedContact; // Pass full contact to access contact.notes
  onCreateNote: () => void;
}

export function NotesTabContent({ contact, onCreateNote }: NotesTabContentProps) {
  const noteActivities = (contact.recentActivity || [])
    .filter(activity => activity.type === 'Note')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const generalNote = contact.notes;

  return (
    <div className="p-4 sm:p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-200 flex-shrink-0">
        <h3 className="text-xl font-semibold text-slate-800">Notes for {contact.name}</h3>
        <button
          onClick={onCreateNote}
          className="flex items-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md text-sm transition-colors"
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Create Note
        </button>
      </div>

      <div className="flex-grow overflow-y-auto space-y-5 pr-2 -mr-2">
        {generalNote && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="text-sm font-semibold text-yellow-800 mb-1">General Note</h4>
            <p className="text-sm text-yellow-700 whitespace-pre-wrap">{generalNote}</p>
          </div>
        )}

        {noteActivities.length === 0 && !generalNote ? (
          <div className="flex-grow flex flex-col items-center justify-center text-center py-10">
            <NoteIcon className="h-16 w-16 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-500 text-lg">No notes recorded for {contact.name} yet.</p>
          </div>
        ) : noteActivities.length > 0 ? (
           <div className="space-y-4">
             {noteActivities.map(note => (
                <div key={note.id} className="p-3 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200">
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex items-center space-x-2">
                      <NoteIcon className="h-5 w-5 text-slate-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-slate-800">
                          Note
                          {note.user && <span className="text-slate-500 font-normal"> by {note.user}</span>}
                        </p>
                        <p className="text-xs text-slate-500">{formatDate(note.date)}</p>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed mt-1 ml-7">{note.description}</p>
                </div>
              ))}
           </div>
        ) : null}
      </div>
    </div>
  );
}