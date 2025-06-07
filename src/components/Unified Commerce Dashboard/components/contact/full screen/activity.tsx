// src/components/ActivityTabContent.jsx
import React, { useState, useMemo } from 'react';
import {
  ListFilter, Mail, Phone, CalendarDays as MeetingIcon, FileText as NoteIcon, CheckSquare, UploadCloud, Filter, Clock, Users, MoreHorizontal, MessageSquare, Edit3, Trash2
} from 'lucide-react';
import { RecentActivityItem } from '../detailed-contacts';
import { formatDate } from '@/components/Unified Commerce Dashboard/utils/utils';


const ACTIVITY_TYPES = ['All', 'Call', 'Email', 'Meeting', 'Note', 'Task', 'File Upload'];

const getActivityIcon = (type, className = "h-5 w-5") => {
  switch (type) {
    case 'Call': return <Phone className={className} />;
    case 'Email': return <Mail className={className} />;
    case 'Meeting': return <MeetingIcon className={className} />;
    case 'Note': return <NoteIcon className={className} />;
    case 'Task': return <CheckSquare className={className} />;
    case 'File Upload': return <UploadCloud className={className} />;
    default: return <MessageSquare className={className} />;
  }
};

interface ActivityTabContentProps {
  activities: RecentActivityItem[];
  contactName: string;
}

export function ActivityTabContent({ activities, contactName }: ActivityTabContentProps) {
  const [selectedType, setSelectedType] = useState('All');
  // Placeholder states for other filters - functionality not implemented yet
  const [searchTerm, setSearchTerm] = useState(''); 

  const sortedActivities = useMemo(() => {
    return [...(activities || [])].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [activities]);

  const filteredActivities = useMemo(() => {
    return sortedActivities.filter(activity => {
      const typeMatch = selectedType === 'All' || activity.type === selectedType;
      const termMatch = searchTerm === '' || 
                        activity.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (activity.user && activity.user.toLowerCase().includes(searchTerm.toLowerCase())) ||
                        (activity.details?.subject && activity.details.subject.toLowerCase().includes(searchTerm.toLowerCase()));
      return typeMatch && termMatch;
    });
  }, [sortedActivities, selectedType, searchTerm]);

  const handleLogActivity = (type) => {
    alert(`Placeholder: Log ${type} for ${contactName}`);
  };

  const handleEditActivity = (activityId) => {
    alert(`Placeholder: Edit activity ${activityId}`);
  };

  const handleDeleteActivity = (activityId) => {
    alert(`Placeholder: Delete activity ${activityId}`);
  };


  return (
    <div className="p-4 sm:p-6 h-full flex flex-col">
      {/* Header and Filters */}
      <div className="mb-6 pb-4 border-b border-slate-200 flex-shrink-0">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
          <h3 className="text-xl font-semibold text-slate-800 mb-2 sm:mb-0">Activity Feed</h3>
          <div className="flex space-x-2">
            <button onClick={() => handleLogActivity('Call')} className="text-sm bg-blue-500 hover:bg-blue-600 text-white py-1.5 px-3 rounded-md transition-colors">Log Call</button>
            <button onClick={() => handleLogActivity('Email')} className="text-sm bg-blue-500 hover:bg-blue-600 text-white py-1.5 px-3 rounded-md transition-colors">Log Email</button>
            <button onClick={() => handleLogActivity('Meeting')} className="text-sm bg-blue-500 hover:bg-blue-600 text-white py-1.5 px-3 rounded-md transition-colors">Log Meeting</button>
            {/* Add more log buttons (Task, Note) if needed */}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-3">
          <div className="relative flex-grow sm:max-w-xs">
             <input
                type="text"
                placeholder="Search activities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
            />
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          </div>
          <div className="relative">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="appearance-none w-full sm:w-auto bg-white border border-slate-300 text-slate-700 py-2 pl-3 pr-8 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
            >
              {ACTIVITY_TYPES.map(type => (
                <option key={type} value={type}>{type === 'All' ? 'All Activity Types' : type}</option>
              ))}
            </select>
            <ListFilter className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          </div>
          {/* Placeholder for Date Range Filter */}
          {/* <button className="text-sm flex items-center text-slate-600 hover:text-blue-600 p-2 border border-slate-300 rounded-md hover:border-blue-500 transition-colors">
            <Clock className="h-4 w-4 mr-1.5" /> Date Range
          </button> */}
        </div>
      </div>

      {/* Activity List */}
      <div className="flex-grow overflow-y-auto space-y-6 pr-2 -mr-2"> {/* Added pr and -mr for custom scrollbar visibility if needed */}
        {filteredActivities.length === 0 ? (
          <div className="text-center py-10">
            <MessageSquare className="h-16 w-16 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-500 text-lg">No activities match your filters.</p>
            {activities.length > 0 && <p className="text-slate-400 text-sm mt-2">Try adjusting your search or filter criteria.</p>}
            {activities.length === 0 && <p className="text-slate-400 text-sm mt-2">No activities logged for this contact yet.</p>}
          </div>
        ) : (
          filteredActivities.map((activity) => (
            <div key={activity.id} className="flex space-x-3 relative group">
              <div className={`mt-1 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center
                ${activity.type === 'Call' ? 'bg-sky-100 text-sky-600' :
                  activity.type === 'Email' ? 'bg-amber-100 text-amber-600' :
                  activity.type === 'Meeting' ? 'bg-purple-100 text-purple-600' :
                  activity.type === 'Task' ? 'bg-indigo-100 text-indigo-600' :
                  activity.type === 'Note' ? 'bg-slate-100 text-slate-600' :
                  activity.type === 'File Upload' ? 'bg-green-100 text-green-600' :
                  'bg-gray-100 text-gray-600'}`}>
                {getActivityIcon(activity.type, "h-4 w-4")}
              </div>
              <div className="flex-grow pb-4 border-b border-slate-200 group-last:border-b-0">
                <div className="flex items-center justify-between mb-0.5">
                  <p className="text-sm font-medium text-slate-800">
                    {activity.type}
                    {activity.user && <span className="text-slate-500 font-normal"> by {activity.user}</span>}
                  </p>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-slate-500">{formatDate(activity.date)}</span>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleEditActivity(activity.id)} title="Edit" className="p-1 text-slate-400 hover:text-blue-600 rounded"><Edit3 size={14}/></button>
                      <button onClick={() => handleDeleteActivity(activity.id)} title="Delete" className="p-1 text-slate-400 hover:text-red-600 rounded"><Trash2 size={14}/></button>
                    </div>
                  </div>
                </div>
                {activity.details?.subject && <p className="text-sm font-semibold text-slate-700 mb-1">{activity.details.subject}</p>}
                <p className="text-sm text-slate-600 leading-relaxed">{activity.description}</p>
                
                {/* Activity specific details */}
                <div className="text-xs text-slate-500 mt-1.5 space-x-3">
                  {activity.details?.duration && <span>Duration: {activity.details.duration}</span>}
                  {activity.details?.location && <span>Location: {activity.details.location}</span>}
                  {activity.details?.status && <span>Status: {activity.details.status}</span>}
                  {activity.details?.dueDate && <span>Due: {formatDate(activity.details.dueDate)}</span>}
                  {activity.details?.fileName && <span>File: {activity.details.fileName}</span>}
                  {activity.sentiment && (
                    <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium
                      ${activity.sentiment === 'Positive' ? 'bg-green-100 text-green-700' :
                        activity.sentiment === 'Negative' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'}`}>
                      {activity.sentiment}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}