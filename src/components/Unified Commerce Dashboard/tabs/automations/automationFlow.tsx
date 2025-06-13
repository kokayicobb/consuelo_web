"use client"
import { useRouter } from 'next/navigation';
import React, { useState, useMemo, ReactElement } from 'react';
import {
  Plus,
  MoreVertical,
  PlayCircle,
  X,
  Search,
  Zap,
  MessageSquare, Mail, Phone, Calendar, Users, TrendingUp, FileText, Target, Bell, UserCheck,
  ChevronLeft,
  Settings2,
  Filter as FilterIcon,
  Clock,
  GitFork,
  RefreshCw,
  ListChecks,
  Tag as TagIcon,
  BellRing,
  UserPlus,
  Database,
  ArrowRightLeft,
  Facebook,
} from 'lucide-react';

// Type Definitions
interface AppDefinition {
  id: string;
  name: string;
  icon: ReactElement | string;
  app_type: 'trigger' | 'action' | 'condition';
  category: string;
  defaultEvent?: string;
  defaultAction?: string;
  description: string;
}

interface AppCategories {
  [categoryName: string]: AppDefinition[];
}

interface WorkflowStep {
  id: string;
  type: 'trigger' | 'action' | 'condition';
  app: string;
  appName: string;
  event: string;
  configured: boolean;
  icon: ReactElement | string;
  description?: string;
  // Specific config fields can be added here using optional properties
  // e.g., facebookAdAccount?: string; formId?: string;
  // e.g., targetCohortId?: string; emailSubject?: string;
}

// Helper to generate unique IDs
const generateId = (): string => Date.now().toString() + Math.random().toString(36).substring(2, 9);

// Helper to render icons
const renderIcon = (iconInput: ReactElement | string, defaultSize: number = 20, className?: string) => {
  if (typeof iconInput === 'string') {
    return <span className={`text-${defaultSize === 20 ? 'lg' : '2xl'} ${className}`}>{iconInput}</span>;
  }
  if (React.isValidElement(iconInput)) {
    // Ensure className from AppDefinition is merged with any additional className
    const existingClassName = (iconInput.props as any).className || '';
    const combinedClassName = `${existingClassName} ${className || ''}`.trim();
    return React.cloneElement(iconInput as React.ReactElement<{ size?: number; className?: string }>, { size: defaultSize, className: combinedClassName });
  }
  return <Zap size={defaultSize} className={className} />; // Fallback icon
};


const AutomationFlow: React.FC = () => {
  const [workflowName, setWorkflowName] = useState<string>('New Automation');
  const [workflow, setWorkflow] = useState<WorkflowStep[]>([
    {
      id: generateId(),
      type: 'trigger',
      app: 'facebook-ads',
      appName: 'Facebook Lead Ads',
      event: 'New Lead',
      configured: true,
      icon: <Facebook className="text-blue-600 bg-transparent" />,
      description: 'When a new lead is submitted via your Facebook Lead Ad form.'
    }
  ]);
  const router = useRouter();
  const [selectedStepIndex, setSelectedStepIndex] = useState<number | null>(workflow.length > 0 ? 0 : null);
  const [sidebarMode, setSidebarMode] = useState<'closed' | 'selectApp' | 'configure'>(workflow.length > 0 ? 'configure' : 'closed');
  const [stepIndexToInsertAfter, setStepIndexToInsertAfter] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const appCategories: AppCategories = {
    'Triggers & Lead Sources': [
      { id: 'facebook-ads', name: 'Facebook Lead Ads', icon: <Facebook className="text-blue-600 bg-transparent"/>, app_type: 'trigger', category: 'Triggers & Lead Sources', defaultEvent: 'New Lead', description: 'Start automation when a Facebook Lead Ad form is submitted.' },
      { id: 'google-ads', name: 'Google Ads Lead Form', icon: <UserPlus className="text-green-500"/>, app_type: 'trigger', category: 'Triggers & Lead Sources', defaultEvent: 'New Lead Form Submission', description: 'Trigger when a new lead is captured from Google Ads.' },
      { id: 'web-forms', name: 'Website Forms', icon: <FileText className="text-indigo-500"/>, app_type: 'trigger', category: 'Triggers & Lead Sources', defaultEvent: 'New Form Submission', description: 'Initiate flow when a form on your website is submitted.' },
      { id: 'linkedin-ads', name: 'LinkedIn Lead Gen Forms', icon: <UserPlus className="text-sky-700"/>, app_type: 'trigger', category: 'Triggers & Lead Sources', defaultEvent: 'New Lead', description: 'Automate actions for new LinkedIn leads.' },
      { id: 'cohort-change', name: 'Cohort Change', icon: <ArrowRightLeft className="text-cyan-500"/>, app_type: 'trigger', category: 'Triggers & Lead Sources', defaultEvent: 'Contact Moves Cohort', description: 'Trigger when a contact is moved to a new cohort.' },
    ],
    'Communication': [
      { id: 'email', name: 'Send Email', icon: <Mail className="text-red-500"/>, app_type: 'action', category: 'Communication', defaultAction: 'Send an Email', description: 'Send a personalized email to a contact.' },
      { id: 'sms', name: 'Send SMS', icon: <MessageSquare className="text-lime-600"/>, app_type: 'action', category: 'Communication', defaultAction: 'Send an SMS Message', description: 'Send an SMS text message.' },
      { id: 'whatsapp', name: 'Send WhatsApp Message', icon: <MessageSquare className="text-green-500"/>, app_type: 'action', category: 'Communication', defaultAction: 'Send WhatsApp', description: 'Engage contacts via WhatsApp.' },
      { id: 'calendar-booking', name: 'Send Booking Link', icon: <Calendar className="text-purple-600"/>, app_type: 'action', category: 'Communication', defaultAction: 'Share Calendar Link', description: 'Send a link for contacts to book a meeting.' },
    ],
    'CRM Actions': [
      { id: 'update-cohort', name: 'Update Cohort', icon: <Users className="text-yellow-500"/>, app_type: 'action', category: 'CRM Actions', defaultAction: 'Move to Cohort', description: 'Move a contact to a different cohort segment.' },
      { id: 'add-tag', name: 'Add Tag', icon: <TagIcon className="text-pink-500"/>, app_type: 'action', category: 'CRM Actions', defaultAction: 'Add a Tag', description: 'Apply a tag to a contact for segmentation.' },
      { id: 'update-lead-score', name: 'Update Lead Score', icon: <TrendingUp className="text-indigo-600"/>, app_type: 'action', category: 'CRM Actions', defaultAction: 'Adjust Score', description: 'Modify a contact\'s lead score.' },
      { id: 'create-task', name: 'Create Task', icon: <ListChecks className="text-teal-500"/>, app_type: 'action', category: 'CRM Actions', defaultAction: 'Create a Follow-up Task', description: 'Assign a task to a team member.' },
      { id: 'internal-notification', name: 'Notify Team', icon: <BellRing className="text-orange-500"/>, app_type: 'action', category: 'CRM Actions', defaultAction: 'Send Internal Alert', description: 'Send a notification to your team.' },
    ],
    'Logic & Conditions': [
      { id: 'filter', name: 'Filter', icon: <FilterIcon className="text-gray-500"/>, app_type: 'condition', category: 'Logic & Conditions', defaultAction: 'Filter Contacts', description: 'Continue only if specific conditions are met.' },
      { id: 'delay', name: 'Delay', icon: <Clock className="text-amber-600"/>, app_type: 'condition', category: 'Logic & Conditions', defaultAction: 'Wait for a Period', description: 'Pause the automation for a set duration.' },
      { id: 'branch', name: 'Branch / If/Else', icon: <GitFork className="text-emerald-700"/>, app_type: 'condition', category: 'Logic & Conditions', defaultAction: 'Create Conditional Paths', description: 'Split the automation into different paths based on conditions.' },
    ]
  };

  const openAppSelector = (indexToInsertAfterValue: number) => {
    setStepIndexToInsertAfter(indexToInsertAfterValue);
    setSelectedStepIndex(null);
    setSidebarMode('selectApp');
    setSearchTerm('');
  };

  const handleAppSelected = (app: AppDefinition) => {
    const isAddingTrigger = stepIndexToInsertAfter === -1;
    let stepType: 'trigger' | 'action' | 'condition';

    if (isAddingTrigger) {
      if (app.app_type !== 'trigger') {
        alert("Only Triggers (e.g., Lead Sources, Cohort Changes) can be the first step.");
        return;
      }
      stepType = 'trigger';
    } else {
      if (app.app_type === 'trigger') {
        alert("Triggers can only be the first step in an automation.");
        return;
      }
      stepType = app.app_type;
    }

    const newStep: WorkflowStep = {
      id: generateId(),
      type: stepType,
      app: app.id,
      appName: app.name,
      event: stepType === 'trigger' ? (app.defaultEvent || 'New Event') : (app.defaultAction || 'Perform Action'),
      configured: false,
      icon: app.icon,
      description: app.description
    };

    const newWorkflow = [...workflow];
    const insertAt = stepIndexToInsertAfter === null ? 0 : stepIndexToInsertAfter + 1;
    newWorkflow.splice(insertAt, 0, newStep);
    setWorkflow(newWorkflow);
    setSelectedStepIndex(insertAt);
    setSidebarMode('configure');
  };
  
  const handleStepCardClick = (index: number) => {
    setSelectedStepIndex(index);
    setSidebarMode('configure');
  };

  const removeStep = (indexToRemove: number) => {
    const newWorkflow = workflow.filter((_, i) => i !== indexToRemove);
    setWorkflow(newWorkflow);

    if (newWorkflow.length === 0) {
      setSelectedStepIndex(null);
      setSidebarMode('closed');
    } else if (selectedStepIndex === indexToRemove) {
      const newSelection = Math.max(0, indexToRemove - 1);
      setSelectedStepIndex(newSelection);
      setSidebarMode('configure');
    } else if (selectedStepIndex !== null && selectedStepIndex > indexToRemove) {
      setSelectedStepIndex(selectedStepIndex - 1);
    }
  };

  const updateStepConfiguration = (index: number, configUpdate: Partial<WorkflowStep>) => {
    const newWorkflow = [...workflow];
    if (newWorkflow[index]) {
        newWorkflow[index] = { ...newWorkflow[index], ...configUpdate, configured: true };
        setWorkflow(newWorkflow);
    }
  };

  const filteredApps = useMemo<AppCategories>(() => {
    if (!searchTerm) return appCategories;
    
    const lowerSearchTerm = searchTerm.toLowerCase();
    const filtered: AppCategories = {};
    for (const categoryKey in appCategories) {
      if (Object.prototype.hasOwnProperty.call(appCategories, categoryKey)) {
        const appsInCategory = appCategories[categoryKey];
        const appsFound = appsInCategory.filter(appDef => 
          appDef.name.toLowerCase().includes(lowerSearchTerm) || 
          (appDef.description && appDef.description.toLowerCase().includes(lowerSearchTerm))
        );
        if (appsFound.length > 0) {
          filtered[categoryKey] = appsFound;
        }
      }
    }
    return filtered;
  }, [searchTerm, appCategories]);

  interface StepCardProps {
    step: WorkflowStep;
    index: number;
    isSelected: boolean;
    onClick: () => void;
    onRemove: () => void;
  }
  
  const StepCard: React.FC<StepCardProps> = ({ step, index, isSelected, onClick, onRemove }) => (
    <div
      className={`relative bg-white border-2 rounded-lg p-4 cursor-pointer transition-all mb-4 group ${
        isSelected ? 'border-gray-800 shadow-md' : 'border-gray-200 hover:border-gray-500'
      }`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 bg-transparent rounded-full flex items-center justify-center">
            {renderIcon(step.icon, 24)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-800">{step.appName}</span>
              {step.configured && (
                <span className="w-2.5 h-2.5 bg-green-500 rounded-full" title="Configured"></span>
              )}
              {!step.configured && (
                <span className="w-2.5 h-2.5 bg-yellow-400 rounded-full" title="Needs Configuration"></span>
              )}
            </div>
            <div className="text-sm text-gray-600 mt-0.5">
              {index === 0 && step.type === 'trigger' ? 'Trigger: ' : `${index + 1}. Action: `} {step.event}
            </div>
          </div>
        </div>
        {( (step.type !== 'trigger' || workflow.length > 1)) && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
              className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
              title="Remove step"
            >
              <X size={18} />
            </button>
           )
        }
      </div>
    </div>
  );

  interface AddStepButtonProps {
    onClick: () => void;
    label?: string;
  }
  
  const AddStepButton: React.FC<AddStepButtonProps> = ({ onClick, label = "Add an action" }) => (
    <div className="relative h-10 flex items-center justify-center my-1">
      <div className="absolute w-0.5 h-full bg-gray-300 top-0 left-1/2 transform -translate-x-1/2"></div>
      <button
        onClick={onClick}
        className="relative z-10 px-3 py-1.5 bg-white border-2 border-gray-300 rounded-full flex items-center justify-center text-xs font-medium text-gray-600 hover:border-blue-500 hover:text-blue-500 transition-colors"
      >
        <Plus size={14} className="mr-1" /> {label}
      </button>
    </div>
  );


  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 
        MAIN BACKGROUND of the page. 
        The user wants a Zapier-like background. This could be a subtle pattern SVG,
        a very light gradient, or textured image. For now, a simple gradient.
        Example for later: style={{ backgroundImage: 'url("/path/to/subtle-pattern.svg")' }}
      */}
     

      <div className="flex flex-1 overflow-hidden">
        <div className="w-[480px] bg-slate-50 border-r border-gray-200 overflow-y-auto">
          <div className="p-6 space-y-2">
            {workflow.length === 0 && (
              <div className="text-center py-12">
                <Zap size={40} className="mx-auto text-gray-400 mb-3" />
                <h3 className="font-semibold text-gray-700 mb-2">Create your automation</h3>
                <p className="text-sm text-gray-500 mb-4">Start by adding a trigger to kick off your workflow.</p>
                <button
                  onClick={() => openAppSelector(-1)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm flex items-center gap-2 mx-auto"
                >
                  <Plus size={16} /> Add Trigger
                </button>
              </div>
            )}

            {workflow.map((step, index) => (
              <React.Fragment key={step.id}>
                <StepCard
                  step={step}
                  index={index}
                  isSelected={selectedStepIndex === index && sidebarMode === 'configure'}
                  onClick={() => handleStepCardClick(index)}
                  onRemove={() => removeStep(index)}
                />
                 <AddStepButton onClick={() => openAppSelector(index)} />
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="flex-1 bg-white overflow-y-auto shadow-inner">
          {sidebarMode === 'closed' && selectedStepIndex === null && (
            <div className="p-8 h-full flex flex-col items-center justify-center text-center text-gray-500">
              <Database size={48} className="mx-auto mb-4 opacity-50" />
              <h2 className="text-xl font-semibold mb-2 text-gray-700">Automation Hub</h2>
              <p className="max-w-sm">
                {workflow.length > 0 
                  ? "Select a step from the left to configure it, or add a new step to your workflow."
                  : "Your automation is currently empty. Add a trigger to begin." }
              </p>
            </div>
          )}

          {sidebarMode === 'selectApp' && (
            <div className="p-6">
              <div className="flex items-center mb-6">
                <button 
                    onClick={() => setSidebarMode(selectedStepIndex !== null ? 'configure' : (workflow.length > 0 ? 'configure' : 'closed'))} 
                    className="mr-3 text-gray-500 hover:text-gray-700"
                >
                  <ChevronLeft size={24} />
                </button>
                <h2 className="text-xl font-semibold text-gray-800">
                  {stepIndexToInsertAfter === -1 ? 'Choose a Trigger' : 'Choose an Action'}
                </h2>
              </div>
              <div className="mb-6 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search apps & actions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
                {Object.entries(filteredApps).map(([category, apps]) => {
                  const relevantApps = apps.filter(appDef => 
                    stepIndexToInsertAfter === -1 ? appDef.app_type === 'trigger' : appDef.app_type !== 'trigger'
                  );
                  if (relevantApps.length === 0) return null;

                  return (
                    <div key={category}>
                      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">{category}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {relevantApps.map((appDef) => (
                          <button
                            key={appDef.id}
                            onClick={() => handleAppSelected(appDef)}
                            className="flex items-start gap-3 p-3.5 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50/50 transition-colors text-left focus:outline-none focus:ring-2 focus:ring-blue-400"
                          >
                            <div className="flex-shrink-0 w-8 h-8 bg-transparent rounded-md flex items-center justify-center mt-0.5">
                               {renderIcon(appDef.icon, 20)}
                            </div>
                            <div>
                                <span className="font-medium text-gray-800 text-sm">{appDef.name}</span>
                                <p className="text-xs text-gray-500 mt-0.5">{appDef.description}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
                {Object.keys(filteredApps).length === 0 && searchTerm && (
                    <p className="text-gray-500 text-center py-4">No apps found for "{searchTerm}".</p>
                )}
              </div>
            </div>
          )}

          {sidebarMode === 'configure' && selectedStepIndex !== null && workflow[selectedStepIndex] && (() => {
            const currentStep = workflow[selectedStepIndex];
            if (!currentStep) return null; // Should not happen if selectedStepIndex is valid
            return (
              <div className="p-8">
                <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-200">
                    <div className="flex-shrink-0 w-12 h-12 bg-transparent rounded-lg flex items-center justify-center">
                        {renderIcon(currentStep.icon, 28)}
                    </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800">{currentStep.appName}</h3>
                    <p className="text-sm text-gray-600">
                      {currentStep.type === 'trigger' ? 'Configure Trigger:' : `Configure Action ${selectedStepIndex + 1}:`} {currentStep.event}
                    </p>
                  </div>
                </div>

                <div className="space-y-5">
                  {currentStep.app === 'facebook-ads' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Ad Account</label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                          <option>Select Ad Account...</option>
                          <option>Main Business Account (123456789)</option>
                          <option>Finance Campaign Account (987654321)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Form</label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                          <option>All Forms</option>
                          <option>Mortgage Pre-Qual Form</option>
                          <option>Investment Guide Download Form</option>
                        </select>
                      </div>
                    </>
                  )}
                  {currentStep.app === 'cohort-change' && (
                    <>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Trigger Condition</label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                          <option>When contact ENTERS a cohort</option>
                          <option>When contact LEAVES a cohort</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Target Cohort</label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                          <option>Select Cohort...</option>
                          <option>Engaged Prospects (Finance)</option>
                        </select>
                      </div>
                    </>
                  )}
                  {currentStep.app === 'email' && (
                     <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
                        <input type="text" defaultValue="{{contact.email}}" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                        <input type="text" placeholder="Welcome {{contact.first_name}}!" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email Template / Body</label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2">
                          <option>Select Template...</option>
                          <option>Welcome Series - Email 1 (Finance)</option>
                        </select>
                        <textarea placeholder="Or compose your email here..." rows={4} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
                      </div>
                    </>
                  )}
                  {currentStep.app === 'update-cohort' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Move Contact To Cohort</label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                          <option>Select Cohort...</option>
                          <option>Hot Lead</option>
                          <option>Scheduled Consultation (Finance)</option>
                        </select>
                      </div>
                       <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Conditions for Move (Optional)</label>
                        <div className="space-y-2 p-3 bg-slate-50 rounded-lg border border-gray-200">
                          <p className="text-xs text-gray-500 mb-1">Only move if ALL checked conditions are met:</p>
                          <label className="flex items-center gap-2 text-sm text-gray-700">
                            <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                          
                          </label>
                          <label className="flex items-center gap-2 text-sm text-gray-700">
                            <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                            Expressed interest in "Mortgage Products"
                          </label>
                        </div>
                      </div>
                    </>
                  )}
                  {!['facebook-ads', 'cohort-change', 'email', 'update-cohort'].includes(currentStep.app) && (
                    <p className="text-gray-600">Configuration options for "{currentStep.appName}" will be available soon.</p>
                  )}

                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <button 
                      onClick={() => updateStepConfiguration(selectedStepIndex, { event: `Updated: ${currentStep.event}` })}
                      className="px-5 py-2.5 bg-white text-black shadow-none rounded-lg hover:bg-gray-200 font-medium text-sm w-full sm:w-auto"
                    >
                      Save Configuration
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
};

export default AutomationFlow;