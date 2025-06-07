// src/components/TicketsTabContent.tsx
import React from 'react';
import { Ticket } from '../detailed-contacts';
import { formatDate } from '@/components/Unified Commerce Dashboard/utils/utils';
import { Tag, PlusCircle, AlertOctagon, MessageSquareWarning, CheckCircle2, UserSquare2 } from 'lucide-react';

interface TicketsTabContentProps {
  tickets: Ticket[];
  contactName: string;
  onCreateTicket: () => void;
}

const getTicketStatusInfo = (status: Ticket['status']): { color: string; icon: React.ElementType } => {
  switch (status) {
    case 'Open': return { color: 'bg-blue-100 text-blue-700', icon: AlertOctagon };
    case 'In Progress': return { color: 'bg-yellow-100 text-yellow-700', icon: MessageSquareWarning };
    case 'Pending Customer': return { color: 'bg-orange-100 text-orange-700', icon: UserSquare2 };
    case 'Resolved': case 'Closed': return { color: 'bg-green-100 text-green-700', icon: CheckCircle2 };
    default: return { color: 'bg-slate-100 text-slate-700', icon: Tag };
  }
};

const getPriorityColor = (priority: Ticket['priority']): string => {
    if (priority === 'Urgent') return 'text-red-600 font-semibold';
    if (priority === 'High') return 'text-orange-600 font-semibold';
    if (priority === 'Medium') return 'text-yellow-600';
    return 'text-slate-500';
}

export function TicketsTabContent({ tickets, contactName, onCreateTicket }: TicketsTabContentProps) {
  const sortedTickets = [...(tickets || [])].sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());

  return (
    <div className="p-4 sm:p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-200 flex-shrink-0">
        <h3 className="text-xl font-semibold text-slate-800">Support Tickets for {contactName}</h3>
        <button
          onClick={onCreateTicket}
          className="flex items-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md text-sm transition-colors"
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Create Ticket
        </button>
      </div>

      {sortedTickets.length === 0 ? (
        <div className="flex-grow flex flex-col items-center justify-center text-center py-10">
          <Tag className="h-16 w-16 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-500 text-lg">No support tickets found for {contactName}.</p>
        </div>
      ) : (
        <div className="flex-grow overflow-y-auto space-y-3 pr-2 -mr-2">
          {sortedTickets.map(ticket => {
            const statusInfo = getTicketStatusInfo(ticket.status);
            const IconComponent = statusInfo.icon;
            return (
              <div key={ticket.id} className="p-4 bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-1">
                  <h4 className="text-md font-semibold text-slate-800 hover:underline cursor-pointer truncate" title={ticket.subject}>
                    {ticket.subject}
                  </h4>
                   <span className={`ml-2 flex-shrink-0 px-2 py-1 text-xs font-semibold rounded-full flex items-center ${statusInfo.color}`}>
                     <IconComponent className="h-3.5 w-3.5 mr-1" /> {ticket.status}
                   </span>
                </div>
                <div className="text-xs text-slate-500 space-x-3">
                  <span>ID: {ticket.id}</span>
                  <span className={`${getPriorityColor(ticket.priority)}`}>Priority: {ticket.priority}</span>
                  <span>Last Updated: {formatDate(ticket.lastUpdated)}</span>
                  {ticket.assignedTo && <span>Assigned: {ticket.assignedTo}</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}