// src/components/FullScreenContactView.tsx
import React, { useState } from 'react';
import { User, Activity, Mail, Phone, Briefcase, FileText as NotesIconFS, DollarSign, Tag, Paperclip } from 'lucide-react'; // Renamed NotesIcon to NotesIconFS to avoid conflict
import { DetailedContact } from '../detailed-contacts';
import { ActivityTabContent } from './activity';
import { EmailsTabContent } from './email-profile';
import { FilesTabContent } from './files';
import { NotesTabContent } from './notes';
import { TicketsTabContent } from './tickets';
import { DealsTabContent } from './deal';
import { CallsTabContent } from './call';
import { TasksTabContent } from './tasks';
import { OverviewTabContent } from './overview';




interface Tab {
  id: string;
  label: string;
  icon: React.ElementType;
}

const TABS: Tab[] = [
  { id: 'overview', label: 'Overview', icon: User },
  { id: 'activity', label: 'Activity', icon: Activity },
  { id: 'emails', label: 'Emails', icon: Mail },
  { id: 'calls', label: 'Calls', icon: Phone },
  { id: 'tasks', label: 'Tasks', icon: Briefcase },
  { id: 'notes', label: 'Notes', icon: NotesIconFS },
  { id: 'files', label: 'Files', icon: Paperclip },
  { id: 'deals', label: 'Deals', icon: DollarSign },
  { id: 'tickets', label: 'Tickets', icon: Tag },
];

interface FullScreenContactViewProps {
  contact: DetailedContact;
}

export function FullScreenContactView({ contact }: FullScreenContactViewProps) {
  const [activeTab, setActiveTab] = useState<string>(TABS[0].id);

  if (!contact) {
    return (
      <div className="flex items-center justify-center h-full text-slate-500">
        No contact data to display in full screen.
      </div>
    );
  }

  // Dummy handlers for "Create/Log" buttons
  const handleLogActivity = (type: string) => alert(`Placeholder: Log new ${type} for ${contact.name}`);
  const handleCreateItem = (type: string) => alert(`Placeholder: Create new ${type} for ${contact.name}`);


  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTabContent contact={contact} />;
      case 'activity':
        return <ActivityTabContent activities={contact.recentActivity || []} contactName={contact.name} />;
      case 'emails':
        return <EmailsTabContent 
                  activities={contact.recentActivity || []} 
                  contactEmail={contact.email} 
                  contactName={contact.name} 
                />;
      case 'calls':
        return <CallsTabContent 
                  activities={contact.recentActivity || []} 
                  contactName={contact.name} 
                  onLogCall={() => handleLogActivity('Call')} 
                />;
      case 'tasks':
        return <TasksTabContent 
                  activities={contact.recentActivity || []} 
                  contactName={contact.name} 
                  onCreateTask={() => handleCreateItem('Task')} 
                />;
      case 'notes':
        return <NotesTabContent 
                  contact={contact} 
                  onCreateNote={() => handleCreateItem('Note')} 
                />;
      case 'files':
        return <FilesTabContent files={contact.files || []} />;
      case 'deals':
        return <DealsTabContent 
                  deals={contact.deals || []} 
                  contactName={contact.name} 
                  onCreateDeal={() => handleCreateItem('Deal')}
                />;
      case 'tickets':
        return <TicketsTabContent 
                  tickets={contact.tickets || []} 
                  contactName={contact.name} 
                  onCreateTicket={() => handleCreateItem('Ticket')} 
                />;
      default:
        return <div className="p-6 text-slate-700">Content for {activeTab}</div>;
    }
  };

  const getTabLabel = (tab: Tab) => {
    let count: number | undefined;
    switch (tab.id) {
        case 'emails':
            count = contact.recentActivity?.filter(act => act.type === 'Email').length;
            break;
        case 'calls':
            count = contact.recentActivity?.filter(act => act.type === 'Call').length;
            break;
        case 'tasks':
            count = contact.recentActivity?.filter(act => act.type === 'Task').length;
            break;
        case 'notes': // Counts 'Note' type activities, not the general contact.notes field for simplicity in tab label
            count = contact.recentActivity?.filter(act => act.type === 'Note').length;
            break;
        case 'files':
            count = contact.files?.length;
            break;
        case 'deals':
            count = contact.deals?.length;
            break;
        case 'tickets':
            count = contact.tickets?.length;
            break;
    }
    return count !== undefined ? `${tab.label} (${count})` : tab.label;
  };


  return (
    <div className="flex flex-col h-full bg-slate-100">
      {/* Top Section (Contact Header) */}
      <div className="p-4 sm:p-6 bg-white border-b border-slate-200 flex-shrink-0">
        <div className="flex items-center space-x-4">
          <div className="relative inline-flex items-center justify-center w-16 h-16 overflow-hidden bg-blue-100 rounded-full ring-2 ring-blue-200 flex-shrink-0">
            <span className="font-medium text-blue-700 text-2xl">
              {contact.name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{contact.name}</h1>
            <p className="text-md text-slate-600">{contact.title} at {contact.company}</p>
          </div>
        </div>
      </div>

      {/* Main Content Area with Tabs */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar for Tabs */}
        <nav className="w-48 md:w-60 bg-white border-r border-slate-200 p-4 overflow-y-auto flex-shrink-0">
          <ul className="space-y-1">
            {TABS.map((tab) => (
              <li key={tab.id}>
                <button
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors
                    ${
                      activeTab === tab.id
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                >
                  <tab.icon className={`h-5 w-5 flex-shrink-0 ${activeTab === tab.id ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-500'}`} />
                  <span className="truncate">{getTabLabel(tab)}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Tab Content Area */}
        <main className="flex-1 bg-white overflow-y-auto">
          {renderTabContent()}
        </main>
      </div>
    </div>
  );
}