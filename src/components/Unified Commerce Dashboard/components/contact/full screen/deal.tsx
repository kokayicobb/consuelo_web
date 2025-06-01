// src/components/DealsTabContent.tsx
import React from 'react';

import { DollarSign, PlusCircle, TrendingUp, CalendarCheck2, Flag, UserCircle } from 'lucide-react';
import { Deal } from '../detailed-contacts';
import { formatCurrency, formatDate } from '@/components/Unified Commerce Dashboard/utils/utils';

interface DealsTabContentProps {
  deals: Deal[];
  contactName: string;
  onCreateDeal: () => void;
}

const getStageColor = (stage: Deal['stage']): string => {
  switch (stage) {
    case 'Closed Won': return 'bg-green-100 text-green-700';
    case 'Closed Lost': return 'bg-red-100 text-red-700';
    case 'Negotiation': case 'Proposal': return 'bg-blue-100 text-blue-700';
    case 'Qualification': return 'bg-yellow-100 text-yellow-700';
    case 'Prospecting': default: return 'bg-slate-100 text-slate-700';
  }
};

export function DealsTabContent({ deals, contactName, onCreateDeal }: DealsTabContentProps) {
  const sortedDeals = [...(deals || [])].sort((a, b) => new Date(b.closeDate).getTime() - new Date(a.closeDate).getTime());

  return (
    <div className="p-4 sm:p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-200 flex-shrink-0">
        <h3 className="text-xl font-semibold text-slate-800">Deals with {contactName}</h3>
        <button
          onClick={onCreateDeal}
          className="flex items-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md text-sm transition-colors"
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Create Deal
        </button>
      </div>

      {sortedDeals.length === 0 ? (
        <div className="flex-grow flex flex-col items-center justify-center text-center py-10">
          <DollarSign className="h-16 w-16 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-500 text-lg">No deals associated with {contactName} yet.</p>
        </div>
      ) : (
        <div className="flex-grow overflow-y-auto space-y-3 pr-2 -mr-2">
          {sortedDeals.map(deal => (
            <div key={deal.id} className="p-4 bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-md font-semibold text-blue-700 hover:underline cursor-pointer truncate" title={deal.name}>
                  {deal.name}
                </h4>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStageColor(deal.stage)}`}>
                  {deal.stage}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-slate-600">
                <div className="flex items-center">
                  <TrendingUp className="h-4 w-4 mr-1.5 text-slate-400" /> Amount: <span className="font-medium ml-1">{formatCurrency(deal.amount)}</span>
                </div>
                <div className="flex items-center">
                  <CalendarCheck2 className="h-4 w-4 mr-1.5 text-slate-400" /> Close Date: <span className="font-medium ml-1">{formatDate(deal.closeDate)}</span>
                </div>
                <div className="flex items-center">
                  <UserCircle className="h-4 w-4 mr-1.5 text-slate-400" /> Owner: <span className="font-medium ml-1">{deal.owner}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}