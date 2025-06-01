// src/components/TasksTabContent.tsx
import React from 'react';

import { CheckSquare, PlusCircle, AlertTriangle, CalendarClock } from 'lucide-react';
import { RecentActivityItem } from '../detailed-contacts';
import { formatDate } from '@/components/Unified Commerce Dashboard/utils/utils';

interface TasksTabContentProps {
  activities: RecentActivityItem[];
  contactName: string;
  onCreateTask: () => void;
}

const getTaskStatusColor = (status?: string, dueDate?: string): string => {
  const now = new Date();
  const due = dueDate ? new Date(dueDate) : null;

  if (status === 'Completed') return 'bg-green-100 text-green-700';
  if (due && due < now && status !== 'Completed') return 'bg-red-100 text-red-700'; // Overdue
  if (status === 'In Progress') return 'bg-blue-100 text-blue-700';
  return 'bg-slate-100 text-slate-700'; // Default or To Do
};

const getTaskStatusIcon = (status?: string, dueDate?: string) => {
  const now = new Date();
  const due = dueDate ? new Date(dueDate) : null;
  if (status === 'Completed') return <CheckSquare className="h-4 w-4 text-green-600" />;
  if (due && due < now && status !== 'Completed') return <AlertTriangle className="h-4 w-4 text-red-600" />;
  return <CalendarClock className="h-4 w-4 text-slate-500" />;
};


export function TasksTabContent({ activities, contactName, onCreateTask }: TasksTabContentProps) {
  const taskActivities = (activities || [])
    .filter(activity => activity.type === 'Task')
    .sort((a, b) => {
      const dateA = a.details?.dueDate ? new Date(a.details.dueDate) : new Date(a.date);
      const dateB = b.details?.dueDate ? new Date(b.details.dueDate) : new Date(b.date);
      // Sort by due date, then by creation date for tasks without due dates
      return dateA.getTime() - dateB.getTime();
    });

  return (
    <div className="p-4 sm:p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-200 flex-shrink-0">
        <h3 className="text-xl font-semibold text-slate-800">Tasks for {contactName}</h3>
        <button
          onClick={onCreateTask}
          className="flex items-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md text-sm transition-colors"
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Create Task
        </button>
      </div>

      {taskActivities.length === 0 ? (
        <div className="flex-grow flex flex-col items-center justify-center text-center py-10">
          <CheckSquare className="h-16 w-16 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-500 text-lg">No tasks associated with {contactName} yet.</p>
          <p className="text-slate-400 text-sm mt-2">Click "Create Task" to add one.</p>
        </div>
      ) : (
        <div className="flex-grow overflow-y-auto space-y-3 pr-2 -mr-2">
          {taskActivities.map(task => (
            <div key={task.id} className="p-3 bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                   <div className="mt-0.5">
                     {getTaskStatusIcon(task.details?.status, task.details?.dueDate)}
                   </div>
                  <div>
                    <p className={`text-sm font-medium ${task.details?.status === 'Completed' ? 'line-through text-slate-500' : 'text-slate-800'}`}>
                      {task.description}
                    </p>
                    <div className="text-xs text-slate-500 space-x-2">
                      {task.details?.dueDate && <span>Due: {formatDate(task.details.dueDate)}</span>}
                      {task.details?.assignedTo && <span>Assigned to: {task.details.assignedTo}</span>}
                      {!task.details?.dueDate && <span>Created: {formatDate(task.date)}</span>}
                    </div>
                  </div>
                </div>
                {task.details?.status && (
                  <span className={`ml-2 flex-shrink-0 px-2 py-0.5 text-xs font-semibold rounded-full ${getTaskStatusColor(task.details.status, task.details.dueDate)}`}>
                    {task.details.status}
                    {(new Date(task.details.dueDate) < new Date() && task.details.status !== 'Completed') && ' (Overdue)'}
                  </span>
                )}
              </div>
               {task.details?.priority && <p className="text-xs text-slate-500 mt-1 ml-8">Priority: {task.details.priority}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}