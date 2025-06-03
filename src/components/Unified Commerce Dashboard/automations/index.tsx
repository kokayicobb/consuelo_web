import { useState } from 'react';
import { Plus, Search, ChevronDown, AlertTriangle, Zap, Mail, Users, Star, Database, UserPlus, FileText, MessageSquare, X, Check, ArrowRight, Filter, Calendar, Clock, Settings, Save, Loader2, PlayCircle, PauseCircle } from 'lucide-react';
import AutomationFlow from './automationFlow';
import AutomationHeader from './header';

// Mock data for automation templates
const automationTemplates = [
  {
    id: 'loan-application-followup',
    name: 'Loan Application Follow-up',
    description: 'Automatically follow up with loan applicants based on their application status',
    category: 'Finance',
    triggers: ['form_submission', 'status_change'],
    popularity: 'high',
  },
  {
    id: 'mortgage-nurture',
    name: 'Mortgage Nurture Sequence',
    description: 'Nurture potential mortgage clients with educational content over 45 days',
    category: 'Finance',
    triggers: ['tag_added', 'list_added'],
    popularity: 'high',
  },
  {
    id: 'investment-advisor',
    name: 'Investment Advisory Workflow',
    description: 'Connect clients with investment advisors based on portfolio size and goals',
    category: 'Finance',
    triggers: ['form_submission', 'manual_trigger'],
    popularity: 'medium',
  },
  {
    id: 'credit-repair',
    name: 'Credit Repair Journey',
    description: 'Guide clients through a credit repair process with timely communications',
    category: 'Finance',
    triggers: ['segment_added', 'score_change'],
    popularity: 'medium',
  },
  {
    id: 'loan-refinance',
    name: 'Loan Refinance Opportunity',
    description: 'Alert existing customers about refinancing opportunities based on rate changes',
    category: 'Finance',
    triggers: ['data_trigger', 'time_trigger'],
    popularity: 'high',
  },
];

// Mock data for triggers
const availableTriggers = [
  {
    id: 'form_submission',
    name: 'Form Submission',
    description: 'Trigger when a lead submits a form on your website',
    category: 'Lead Generation',
    icon: FileText,
  },
  {
    id: 'status_change',
    name: 'Status Change',
    description: 'Trigger when a lead or client status changes',
    category: 'Pipeline',
    icon: RefreshCw,
  },
  {
    id: 'tag_added',
    name: 'Tag Added',
    description: 'Trigger when a tag is added to a contact',
    category: 'Contact Management',
    icon: Tag,
  },
  {
    id: 'segment_added',
    name: 'Added to Segment',
    description: 'Trigger when a contact is added to a segment',
    category: 'Contact Management',
    icon: Users,
  },
  {
    id: 'score_change',
    name: 'Lead Score Change',
    description: 'Trigger when a lead score changes beyond threshold',
    category: 'Lead Management',
    icon: TrendingUp,
  },
  {
    id: 'ai_lead_found',
    name: 'AI Lead Discovery',
    description: 'Trigger when AI finds a new potential lead from social or data sources',
    category: 'AI',
    icon: Zap,
  },
  {
    id: 'email_opened',
    name: 'Email Opened',
    description: 'Trigger when a contact opens a specific email',
    category: 'Email',
    icon: Mail,
  },
  {
    id: 'email_clicked',
    name: 'Email Link Clicked',
    description: 'Trigger when a contact clicks a link in an email',
    category: 'Email',
    icon: ExternalLink,
  },
  {
    id: 'time_trigger',
    name: 'Time-Based Trigger',
    description: 'Trigger at a specific time or date',
    category: 'Scheduling',
    icon: Clock,
  },
  {
    id: 'data_trigger',
    name: 'Data Change Trigger',
    description: 'Trigger when external data changes (e.g., interest rates)',
    category: 'Finance',
    icon: Database,
  },
];

// Mock data for actions
const availableActions = [
  {
    id: 'send_email',
    name: 'Send Email',
    description: 'Send a personalized email to the contact',
    category: 'Communication',
    icon: Mail,
  },
  {
    id: 'add_to_segment',
    name: 'Add to Segment',
    description: 'Add the contact to a specific segment',
    category: 'Contact Management',
    icon: Users,
  },
  {
    id: 'update_contact',
    name: 'Update Contact',
    description: 'Update contact information in the CRM',
    category: 'Contact Management',
    icon: UserCheck,
  },
  {
    id: 'assign_task',
    name: 'Create Task',
    description: 'Create a task for a team member',
    category: 'Workflow',
    icon: CheckSquare,
  },
  {
    id: 'schedule_call',
    name: 'Schedule Call',
    description: 'Schedule a call with the contact',
    category: 'Communication',
    icon: Phone,
  },
  {
    id: 'send_sms',
    name: 'Send SMS',
    description: 'Send an SMS message to the contact',
    category: 'Communication',
    icon: MessageSquare,
  },
  {
    id: 'update_score',
    name: 'Update Lead Score',
    description: 'Update the lead score for the contact',
    category: 'Lead Management',
    icon: Star,
  },
  {
    id: 'create_opportunity',
    name: 'Create Opportunity',
    description: 'Create a new opportunity in the pipeline',
    category: 'Pipeline',
    icon: TrendingUp,
  },
  {
    id: 'ai_research',
    name: 'AI Research',
    description: 'Use AI to research and enrich contact data',
    category: 'AI',
    icon: Search,
  },
  {
    id: 'notify_team',
    name: 'Notify Team',
    description: 'Send notification to team members',
    category: 'Workflow',
    icon: Bell,
  },
];

// Components for the UI
function RefreshCw(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <path d="M3 21v-5h5" />
    </svg>
  );
}

function Tag(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z" />
      <path d="M7 7h.01" />
    </svg>
  );
}

function TrendingUp(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  );
}

function ExternalLink(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" x2="21" y1="14" y2="3" />
    </svg>
  );
}

function UserCheck(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <polyline points="16 11 18 13 22 9" />
    </svg>
  );
}

function CheckSquare(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="9 11 12 14 22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  );
}

function Phone(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function Bell(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  );
}

// Main component
export default function AutomationBuilder() {
  const [activeTab, setActiveTab] = useState('templates');
  const [showTemplates, setShowTemplates] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [workflow, setWorkflow] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [isBuilding, setIsBuilding] = useState(false);
  const [automationName, setAutomationName] = useState('');
  const [automationDescription, setAutomationDescription] = useState('');
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  

  // Filter templates based on search query and category
  const filteredTemplates = automationTemplates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          template.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || template.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const startFromTemplate = (template) => {
    setSelectedTemplate(template);
    // Ensure automationName is set BEFORE setIsBuilding(true)
    setAutomationName(`Copy of ${template.name}`);
    setAutomationDescription(template.description);
    setWorkflow([
      { type: 'trigger', id: template.triggers[0], name: availableTriggers.find(t => t.id === template.triggers[0])?.name || 'Select Trigger' },
      { type: 'action', id: 'send_email', name: 'Send Email' }
    ]);
    setShowTemplates(false);
    setIsBuilding(true);
  };

  const startBlankAutomation = (nameFromHeaderButton = 'New Automation') => { // Accept potential name from header button if needed
    setSelectedTemplate(null);
    // Ensure automationName is set BEFORE setIsBuilding(true)
    setAutomationName(nameFromHeaderButton); // Use "New Automation" or what's passed
    setAutomationDescription('');
    setWorkflow([
      { type: 'trigger', id: '', name: 'Select Trigger' }
    ]);
    setShowTemplates(false);
    setIsBuilding(true);
  };
  const handleTestAutomation = () => {
    // The header's internal editableTitle should have updated `automationName`
    // via the `setAutomationNameForSave` prop if you wired it that way,
    // or you can pass automationName directly to any test function.
    alert(`Testing automation: ${automationName}`);
    // Implement actual test logic here
 };

  // Add a new step to the workflow
  const addWorkflowStep = (type) => {
    setWorkflow([...workflow, { type, id: '', name: type === 'trigger' ? 'Select Trigger' : 'Select Action' }]);
  };

  // Save the automation
  const saveAutomation = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setShowSaveModal(false);
      // Reset to templates view
      setShowTemplates(true);
      setIsBuilding(false);
    }, 1500);
  };

  // Template Card Component
  const TemplateCard = ({ template, onClick }) => (
    <div 
      className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onClick(template)}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-medium text-gray-900">{template.name}</h3>
        {template.popularity === 'high' && (
          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">Popular</span>
        )}
      </div>
      <p className="text-sm text-gray-600 mb-3">{template.description}</p>
      <div className="flex gap-2 mt-2">
        {template.triggers.map(trigger => (
          <span key={trigger} className="bg-sky-100 text-sky-800 text-xs px-2 py-1 rounded-full">
            {availableTriggers.find(t => t.id === trigger)?.name || trigger}
          </span>
        ))}
      </div>
    </div>
  );

  // Workflow Step Component
  const WorkflowStep = ({ step, index }) => {
    const [isOpen, setIsOpen] = useState(false);
    const items = step.type === 'trigger' ? availableTriggers : availableActions;
    
    const selectItem = (item) => {
      const newWorkflow = [...workflow];
      newWorkflow[index] = { ...step, id: item.id, name: item.name };
      setWorkflow(newWorkflow);
      setIsOpen(false);
    };
    
    const Icon = items.find(item => item.id === step.id)?.icon || (step.type === 'trigger' ? Zap : Mail);
    
    return (
      <div className="relative">
        <div className="flex items-center mb-2">
          <div className="h-8 w-8 rounded-full bg-sky-100 flex items-center justify-center text-sky-700 font-bold">
            {index + 1}
          </div>
          <div className="ml-2 text-sm text-gray-500">{step.type === 'trigger' ? 'Trigger' : 'Action'}</div>
        </div>
        
        <div 
          className="border rounded-lg p-4 mb-4 cursor-pointer hover:border-sky-500 transition-colors"
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="mr-3 text-gray-500">
                <Icon size={20} />
              </div>
              <div>
                <div className="font-medium">{step.id ? step.name : `Select ${step.type === 'trigger' ? 'Trigger' : 'Action'}`}</div>
                {step.id ? (
                  <div className="text-sm text-gray-500">
                    {items.find(item => item.id === step.id)?.description || ''}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">
                    {step.type === 'trigger' ? 'Choose what starts your automation' : 'Choose what happens next'}
                  </div>
                )}
              </div>
            </div>
            <ChevronDown size={20} className={`text-gray-500 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} />
          </div>
        </div>
        
        {/* Dropdown Selection */}
        {isOpen && (
          <div className="absolute z-10 w-full bg-white border rounded-lg shadow-lg mt-1 max-h-96 overflow-y-auto">
            <div className="p-3 border-b">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                <input
                  type="text"
                  placeholder={`Search ${step.type === 'trigger' ? 'triggers' : 'actions'}`}
                  className="pl-8 pr-4 py-2 w-full border rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>
            <div className="p-1">
              {items.map(item => (
                <div
                  key={item.id}
                  className="flex items-center p-3 hover:bg-gray-100 rounded-md cursor-pointer"
                  onClick={() => selectItem(item)}
                >
                  <div className="mr-3 text-gray-500">
                    <item.icon size={20} />
                  </div>
                  <div>
                    <div className="font-medium">{item.name}</div>
                    <div className="text-sm text-gray-500">{item.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Connector Line */}
        {index < workflow.length - 1 && (
          <div className="flex justify-center my-2">
            <div className="h-8 border-l-2 border-dashed border-gray-300"></div>
          </div>
        )}
      </div>
    );
  };

  // Save Modal Component
  const SaveModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Save Automation</h3>
          <button onClick={() => setShowSaveModal(false)} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1" htmlFor="automation-name">
            Automation Name
          </label>
          <input
            id="automation-name"
            type="text"
            value={automationName}
            onChange={(e) => setAutomationName(e.target.value)}
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
            placeholder="Enter a name for your automation"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1" htmlFor="automation-description">
            Description (optional)
          </label>
          <textarea
            id="automation-description"
            value={automationDescription}
            onChange={(e) => setAutomationDescription(e.target.value)}
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 min-h-[80px]"
            placeholder="Briefly describe what this automation does"
          />
        </div>
        
        <div className="flex justify-end gap-2">
          <button
            onClick={() => setShowSaveModal(false)}
            className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={saveAutomation}
            disabled={isSaving || !automationName}
            className="px-4 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isSaving ? (
              <>
                <Loader2 size={16} className="mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save size={16} className="mr-2" />
                Save
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-screen bg-gray-50">
    {/* Header <<<< 2. REPLACE OLD HEADER WITH NEW COMPONENT */}
    <AutomationHeader
      isBuilding={isBuilding}
      setIsBuilding={setIsBuilding}
      initialAutomationName={automationName} // `automationName` is set by startBlank/startFromTemplate
      setShowSaveModal={setShowSaveModal}
      // This prop in AutomationHeader is called `setAutomationNameForSave`
      // We map it to `setAutomationName` so the header directly updates the parent's state
      // before opening the modal.
      setAutomationNameForSave={setAutomationName}
      setShowTemplates={setShowTemplates} // Used by header's "Cancel" button
      startBlankAutomation={() => startBlankAutomation("New Automation")} // Ensure "New Automation" is passed
      // You can add a specific test handler if the header component expects one like `onTest`
      // For the provided header, its internal `handleTest` calls alert.
      // If you wanted the parent to handle it:
      // onTest={handleTestAutomation}
    />
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6">
        {showTemplates ? (
          <div>
           {/* Tabs */}
         <div className="mb-6 border-b">
           <div className="flex space-x-8">
             <button
               onClick={() => setActiveTab('templates')}
               className={`pb-4 px-1 font-medium text-sm ${activeTab === 'templates'
                 ? 'text-sky-600 border-b-2 border-sky-600'
                 : 'text-gray-500 hover:text-gray-700'}`}
             >
               Templates
             </button>
             <button
               onClick={() => setActiveTab('my-automations')}
               className={`pb-4 px-1 font-medium text-sm ${activeTab === 'my-automations'
                 ? 'text-sky-600 border-b-2 border-sky-600'
                 : 'text-gray-500 hover:text-gray-700'}`}
             >
               My Automations
             </button>
           </div>
         </div>

         {/* Search and Filter */}
         <div className="mb-6 flex flex-wrap gap-4">
           <div className="relative flex-grow max-w-md shadow-none">
             <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
             <input
               type="text"
               placeholder="Search templates"
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               className="pl-10 pr-4 py-2 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
             />
           </div>

           <div className="relative">
             <select
               value={categoryFilter}
               onChange={(e) => setCategoryFilter(e.target.value)}
               className="appearance-none pl-4 pr-10 py-2 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
             >
               <option value="All">All Categories</option>
               <option value="Finance">Finance</option>
               <option value="Lead Generation">Lead Generation</option>
               <option value="Nurturing">Nurturing</option>
             </select>
             <Filter className="absolute right-3 top-2.5 h-5 w-5 text-gray-400 pointer-events-none" />
           </div>
         </div>

         {activeTab === 'templates' ? (
           <>
             <h2 className="text-lg font-semibold mb-4">Finance Industry Templates</h2>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 shadown-none">
               {filteredTemplates.map(template => (
                 <TemplateCard
                   key={template.id}
                   template={template}
                   onClick={startFromTemplate}
                 />
               ))}
             </div>

             <div className="mt-8">
               <h2 className="text-lg font-semibold mb-4">Start from Scratch</h2>
               <button
                 onClick={() => startBlankAutomation("New Automation")} // Ensure correct name
                 className="border-2 border-dashed border-gray-300 rounded-lg p-4 w-full md:w-64 h-32 flex items-center justify-center hover:border-sky-500 hover:text-sky-600 transition-colors"
               >
                 <div className="text-center">
                   <Plus size={24} className="mx-auto mb-2" />
                   <span className="font-medium">Blank Automation</span>
                 </div>
               </button>
             </div>
           </>
         ) : (
           <div className="text-center py-12">
             <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
               <Zap size={24} className="text-gray-400" />
             </div>
             <h3 className="text-lg font-medium mb-2">No automations yet</h3>
             <p className="text-gray-500 mb-6">Create your first automation to start automating your workflow</p>
             <button
               onClick={() => startBlankAutomation("New Automation")}
                  className="px-4 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700 inline-flex items-center"
                >
                  <Plus size={16} className="mr-2" /> Create Automation
                </button>
              </div>
            )}
          </div>
        ) : (
          <AutomationFlow 
          
         
        
        />
      )}
      </div>
      
      {/* Save Modal */}
      {showSaveModal && <SaveModal />}
    </div>
  );
}