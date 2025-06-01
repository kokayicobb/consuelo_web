// src/components/ContactCard.jsx
import React from 'react';
import { Mail, Phone, MapPin, Linkedin, Link as LinkIcon, Info, User, DollarSign, CalendarDays, TrendingUp, Lightbulb } from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/utils'; 

export function ContactCard({ contact }) {
  if (!contact) {
    return (
      <div className="text-center text-slate-500 py-8 bg-white p-6 rounded-lg shadow">
        No contact selected or data not found.
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-white p-4 md:p-6 rounded-lg shadow-lg">
      {/* Header - Modified for two main columns */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between pb-4 border-b border-slate-200">
        {/* Left Part: Avatar, Name, Title, Priority */}
        <div className="flex items-center space-x-3 sm:space-x-4 mb-3 sm:mb-0">
          <div className="relative inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 overflow-hidden bg-blue-100 rounded-full ring-2 ring-blue-200 flex-shrink-0">
            <span className="font-medium text-blue-700 text-xl sm:text-2xl">
              {contact.name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </span>
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900">{contact.name}</h3>
            <p className="text-sm sm:text-md text-slate-600">{contact.title} at {contact.company}</p>
            <div className="mt-1">
              <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                contact.priority === 'High' ? 'bg-red-100 text-red-700' :
                contact.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                'bg-green-100 text-green-700'
              }`}>
                {contact.priority} Priority
              </span>
            </div>
          </div>
        </div>

        {/* Right Part: Compact Contact Details */}
        <div className="text-xs sm:text-sm text-slate-600 sm:text-right space-y-1 sm:max-w-xs pt-2 sm:pt-0">
          <a href={`mailto:${contact.email}`} className="flex items-center sm:justify-end group hover:text-blue-600" title={contact.email}>
            <Mail className="h-3.5 w-3.5 mr-2 text-slate-400 group-hover:text-blue-500 flex-shrink-0" />
            <span className="truncate">{contact.email}</span>
          </a>
          <a href={`tel:${contact.phone}`} className="flex items-center sm:justify-end group hover:text-blue-600">
            <Phone className="h-3.5 w-3.5 mr-2 text-slate-400 group-hover:text-blue-500 flex-shrink-0" />
            <span>{contact.phone}</span>
          </a>
          {contact.linkedin && (
            <a href={`https://${contact.linkedin}`} target="_blank" rel="noopener noreferrer" className="flex items-center sm:justify-end group hover:text-blue-600">
              <Linkedin className="h-3.5 w-3.5 mr-2 text-slate-400 group-hover:text-blue-500 flex-shrink-0" />
              <span>LinkedIn Profile</span>
            </a>
          )}
          {contact.address && (
             <div className="flex items-start sm:justify-end group">
                <MapPin className="h-3.5 w-3.5 mr-2 text-slate-400 flex-shrink-0 mt-0.5" />
                <span className="truncate" title={contact.address}>{contact.address}</span>
             </div>
          )}
        </div>
      </div>

      {/* AI Talking Points - NEW LOCATION */}
      {contact.aiTalkingTips && contact.aiTalkingTips.length > 0 && (
        <div className="bg-transparent p-4 rounded-lg">
          <h4 className="font-semibold text-lg mb-3 text-gray-800 flex items-center">
            {/* <Lightbulb className="h-5 w-5 mr-2 text-gray-500" /> */}
            Talking Tips
          </h4>
          <ul className="space-y-2">
            {contact.aiTalkingTips.slice(0, 3).map((tip, index) => (
              <li key={index} className="flex items-start text-sm">
                <span className="text-amber-600 font-bold mr-2 text-lg leading-none mt-px">•</span>
                <span className="text-slate-700">{tip}</span>
              </li>
            ))}
          </ul>
          <p className="text-xs text-slate-400 mt-3 italic">
            AI-generated based on recent interactions and profile.
          </p>
        </div>
      )}

      {/* Financial Overview */}
      {contact.financialOverview && (
        <div className="bg-transparent p-4 rounded-lg">
          <h4 className="font-semibold text-lg mb-3 text-slate-800">Financial Overview</h4>
          <ul className="space-y-2 text-sm text-slate-700">
            <li className="flex items-center"><User className="h-4 w-4 mr-3 text-slate-500 flex-shrink-0" /> Relationship Mgr: <span className="font-medium ml-1">{contact.relationshipManager}</span></li>
            <li className="flex items-center"><Info className="h-4 w-4 mr-3 text-slate-500 flex-shrink-0" /> Status: <span className="font-medium ml-1">{contact.status}</span></li>
            <li className="flex items-center"><TrendingUp className="h-4 w-4 mr-3 text-slate-500 flex-shrink-0" /> Segment: <span className="font-medium ml-1">{contact.segment}</span></li>
            {typeof contact.financialOverview.totalAssetsUnderManagement === 'number' && (
              <li className="flex items-center"><DollarSign className="h-4 w-4 mr-3 text-slate-500 flex-shrink-0" /> AUM: <span className="font-medium ml-1">{formatCurrency(contact.financialOverview.totalAssetsUnderManagement)}</span></li>
            )}
            {typeof contact.financialOverview.recentDealValue === 'number' && contact.financialOverview.recentDealValue > 0 && (
              <li className="flex items-center"><DollarSign className="h-4 w-4 mr-3 text-slate-500 flex-shrink-0" /> Recent Deal: <span className="font-medium ml-1">{formatCurrency(contact.financialOverview.recentDealValue)}</span></li>
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

      {/* Recent Activity */}
      {contact.recentActivity && contact.recentActivity.length > 0 && (
        <div className="bg-transparent p-4 rounded-lg">
          <h4 className="font-semibold text-lg mb-3 text-slate-800">Recent Activity</h4>
          <ul className="space-y-3 text-sm text-slate-700">
            {contact.recentActivity.slice(0, 3).map((activity, index) => (
              <li key={index} className="border-b border-slate-200 last:border-b-0 pb-2 last:pb-0">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                  <span>{activity.type} • {formatDate(activity.date)}</span>
                  <span className={`font-semibold px-2 py-0.5 rounded-full text-xs ${
                    activity.sentiment === 'Positive' ? 'bg-green-100 text-green-700' :
                    activity.sentiment === 'Negative' ? 'bg-red-100 text-red-700' :
                    'bg-slate-200 text-slate-600'
                  }`}>
                    {activity.sentiment}
                  </span>
                </div>
                <p className="text-slate-600">{activity.description}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Notes */}
      {contact.notes && (
         <div className="bg-transparent p-4 rounded-lg">
          <h4 className="font-semibold text-lg mb-3 text-slate-800">Internal Notes</h4>
          <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{contact.notes}</p>
        </div>
      )}
    </div>
  );
}