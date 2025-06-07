// src/components/OverviewTabContent.tsx

import React from 'react';
import {
  Calendar,
  CheckSquare,
  FileText as NoteIconLucide, // Renamed to avoid conflict if NoteIcon is used as a component name
  ArrowRight,
  Lightbulb, // For AI Talking Tips
  DollarSign, // For Financial Overview
  TrendingUp, // For Financial Overview
  User,       // For Financial Overview
  Link as LinkIcon, // For Financial Overview
  Info,       // For Financial Overview
  CalendarDays, // For Financial Overview
} from 'lucide-react';
import { DetailedContact, RecentActivityItem } from '../detailed-contacts';
import { ContactCard } from '../contact-card';
import { formatCurrency, formatDate } from '@/components/Unified Commerce Dashboard/utils/utils';

// Assuming ContactCard is in a sibling directory or a common components directory
// Adjust the path as per your project structure


// Helper to get an icon for specific activity types used in this overview
const getActivityTypeIcon = (type: RecentActivityItem['type'], className: string = "h-4 w-4") => {
  switch (type) {
    case 'Meeting':
      return <Calendar className={className} />;
    case 'Task':
      return <CheckSquare className={className} />;
    case 'Note':
      return <NoteIconLucide className={className} />; // Using renamed import
    default:
      return <ArrowRight className={className} />;
  }
};

interface OverviewTabContentProps {
  contact: DetailedContact;
}

export function OverviewTabContent({ contact }: OverviewTabContentProps): JSX.Element | null {
  if (!contact) {
    return (
        <div className="p-4 md:p-6 text-center text-slate-500">
            Contact data is not available.
        </div>
    );
  }

  const now = new Date();

  // Upcoming Activities: Future tasks (not completed) and future meetings
  const upcomingActivities = (contact.recentActivity || [])
    .filter(activity => {
      if (activity.type === 'Task') {
        return activity.details?.dueDate && new Date(activity.details.dueDate) >= now && activity.details?.status !== 'Completed';
      }
      if (activity.type === 'Meeting') {
        // Ensure date is valid before comparing
        const activityDate = new Date(activity.date);
        return !isNaN(activityDate.getTime()) && activityDate >= now;
      }
      return false;
    })
    .sort((a, b) => {
      const dateA = a.type === 'Task' ? new Date(a.details.dueDate) : new Date(a.date);
      const dateB = b.type === 'Task' ? new Date(b.details.dueDate) : new Date(b.date);
      return dateA.getTime() - dateB.getTime();
    })
    .slice(0, 3); // Show top 3 upcoming

  // Recent Key Notes: Notes from activity feed
  const recentKeyNotes = (contact.recentActivity || [])
    .filter(activity => activity.type === 'Note')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3); // Show top 3 recent notes

  return (
    <div className="p-4 md:p-6 space-y-6 bg-slate-50 min-h-full"> {/* Added bg-slate-50 and min-h-full */}
      {/* Main Contact Card - this itself contains a lot of info */}
      <ContactCard contact={contact} />

      {/* AI Talking Tips - (Moved from ContactCard here as per typical dashboard layout, or can be in both) */}
      {contact.aiTalkingTips && contact.aiTalkingTips.length > 0 && (
        <div className="bg-white p-4 shadow rounded-lg border border-slate-200">
          <h4 className="text-lg font-semibold text-slate-800 mb-3 flex items-center">
            <Lightbulb className="h-5 w-5 mr-2 text-amber-500" />
            AI Talking Tips
          </h4>
          <ul className="space-y-2">
            {contact.aiTalkingTips.slice(0, 3).map((tip, index) => (
              <li key={index} className="flex items-start text-sm">
                <span className="text-amber-600 font-bold mr-2 text-lg leading-none mt-px">•</span>
                <span className="text-slate-700">{tip}</span>
              </li>
            ))}
          </ul>
          {contact.aiTalkingTips.length > 3 && (
            <p className="text-xs text-slate-500 mt-2 italic">
              +{contact.aiTalkingTips.length - 3} more tips available.
            </p>
          )}
           <p className="text-xs text-slate-400 mt-3 italic">
            AI-generated based on recent interactions and profile.
          </p>
        </div>
      )}

      {/* Condensed Financial Overview - (Could also be part of ContactCard or a separate component) */}
      {contact.financialOverview && (
        <div className="bg-white p-4 shadow rounded-lg border border-slate-200">
          <h4 className="text-lg font-semibold text-slate-800 mb-3">Financial Snapshot</h4>
          <ul className="space-y-2 text-sm text-slate-700">
            <li className="flex items-center"><User className="h-4 w-4 mr-3 text-slate-500 flex-shrink-0" /> Relationship Mgr: <span className="font-medium ml-1">{contact.relationshipManager}</span></li>
            <li className="flex items-center"><Info className="h-4 w-4 mr-3 text-slate-500 flex-shrink-0" /> Status: <span className="font-medium ml-1">{contact.status}</span></li>
            <li className="flex items-center"><TrendingUp className="h-4 w-4 mr-3 text-slate-500 flex-shrink-0" /> Segment: <span className="font-medium ml-1">{contact.segment}</span></li>
            {typeof contact.financialOverview.totalAssetsUnderManagement === 'number' && (
              <li className="flex items-center"><DollarSign className="h-4 w-4 mr-3 text-slate-500 flex-shrink-0" /> AUM: <span className="font-medium ml-1">{formatCurrency(contact.financialOverview.totalAssetsUnderManagement)}</span></li>
            )}
            {contact.financialOverview.productInterests && contact.financialOverview.productInterests.length > 0 && (
              <li className="flex items-start"><LinkIcon className="h-4 w-4 mr-3 text-slate-500 flex-shrink-0 mt-0.5" /> Product Interests: <span className="ml-1">{contact.financialOverview.productInterests.join(', ')}</span></li>
            )}
             {contact.financialOverview.lastReviewDate && (
              <li className="flex items-center"><CalendarDays className="h-4 w-4 mr-3 text-slate-500 flex-shrink-0" /> Last Review: <span className="font-medium ml-1">{formatDate(contact.financialOverview.lastReviewDate)}</span></li>
            )}
          </ul>
        </div>
      )}


      {/* Upcoming Activities Section */}
      {upcomingActivities.length > 0 && (
        <div className="bg-white p-4 shadow rounded-lg border border-slate-200">
          <h4 className="text-lg font-semibold text-slate-800 mb-3">Upcoming Activities</h4>
          <ul className="space-y-3">
            {upcomingActivities.map(activity => (
              <li key={activity.id} className="flex items-start space-x-3 p-2 hover:bg-slate-50 rounded-md">
                <div className={`mt-1 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center
                  ${activity.type === 'Meeting' ? 'bg-purple-100 text-purple-600' : 'bg-indigo-100 text-indigo-600'}`}>
                  {getActivityTypeIcon(activity.type)}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700">{activity.description}</p>
                  <p className="text-xs text-slate-500">
                    {activity.type === 'Task' ? `Due: ${formatDate(activity.details.dueDate)}` : `On: ${formatDate(activity.date)}`}
                    {activity.user && <span className="italic"> • by {activity.user}</span>}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recent Key Notes Section */}
      {recentKeyNotes.length > 0 && (
        <div className="bg-white p-4 shadow rounded-lg border border-slate-200">
          <h4 className="text-lg font-semibold text-slate-800 mb-3">Recent Notes</h4>
          <ul className="space-y-3">
            {recentKeyNotes.map(note => (
              <li key={note.id} className="flex items-start space-x-3 p-2 hover:bg-slate-50 rounded-md">
                 <div className="mt-1 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-slate-100 text-slate-600">
                  {getActivityTypeIcon(note.type)}
                </div>
                <div>
                  <p className="text-sm text-slate-600 leading-relaxed line-clamp-3" title={note.description}>{note.description}</p>
                  <p className="text-xs text-slate-500">
                    {formatDate(note.date)}
                    {note.user && <span className="italic"> • by {note.user}</span>}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Fallback if no extra overview items (beyond ContactCard) */}
      {upcomingActivities.length === 0 && recentKeyNotes.length === 0 && (!contact.aiTalkingTips || contact.aiTalkingTips.length === 0) && !contact.financialOverview && (
         <div className="text-center text-slate-400 py-8 bg-white p-6 rounded-lg shadow border border-slate-200">
            <Info className="h-10 w-10 mx-auto mb-2 text-slate-400" />
            No additional overview items like upcoming activities, recent notes, or AI tips to display for this contact at the moment.
        </div>
      )}
    </div>
  );
}