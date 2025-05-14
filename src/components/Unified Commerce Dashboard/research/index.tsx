"use client"; // Add this if you're using Next.js App Router and calling server actions

import React, { useState, useEffect } from 'react';
import { CheckCircle, ChevronRight, Filter, MessageSquare, ArrowRightCircle, Settings, Search, Trash2, RefreshCw, UserPlus, X } from 'lucide-react';
import { processRedditDataForLeads, generateSalesScript, generateKeyTalkingPoints } from '@/lib/actions';

// Import server actions - adjust path as necessary
// Assuming your actions.ts is in a directory like 'app/actions.ts' or 'lib/actions.ts'
// Make sure these functions are exported from your actions.ts file
 // Adjust path

// Define Lead type matching UI and PotentialLead from actions
interface Lead {
  id: string | number; // Allow string for new leads from Reddit, number for existing sample
  subreddit: string;
  username: string;
  content: string;
  date: string;
  sentiment: string; // Keep as string for flexibility with LLM outputs
  status: 'new' | 'contacted' | 'interested' | 'converted' | 'not_interested';
  score: number;
  url: string;
  reasoning?: string;
}
interface OrangeSalesAgentProps {
  userQuery?: string;
}

// Main application component
const OrangeSalesAgent: React.FC<OrangeSalesAgentProps> = ({ userQuery }) => {
  // State for multi-step form
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    subreddits: [
      { name: 'charlottenc', category: 'location', selected: true },
      { name: 'Charlotte', category: 'location', selected: true },
      { name: 'NorthCarolina', category: 'location', selected: false },
      { name: 'fitness', category: 'fitness', selected: true },
      { name: 'workout', category: 'fitness', selected: false },
      { name: 'yoga', category: 'fitness', selected: false },
      { name: 'weightloss', category: 'fitness', selected: true },
      { name: 'running', category: 'fitness', selected: false },
      { name: 'crossfit', category: 'fitness', selected: false },
      { name: 'gym', category: 'fitness', selected: true },
    ],
    customSubreddit: '',
    keywords: ['orange theory', 'fitness', 'workout', 'HIIT', 'gym', 'weight loss', 'Charlotte', 'recommendation', 'new to area', 'classes'],
    customKeyword: '',
    scanFrequency: 'daily', // hourly, daily, weekly
    notificationType: 'email', // email, teams, none
    emailAddress: '',
    teamsWebhook: '',
    contentFilter: {
      seekingRecommendations: true,
      newToArea: true,
      complaining: true,
      priceDiscussion: true,
      weightLossGoals: true
    }
  });
  // Initialize search term from userQuery if provided
  const [searchTerm, setSearchTerm] = useState('');
  // Sample leads data - updated to match Lead interface
  const [leads, setLeads] = useState<Lead[]>([
    {
      id: 1,
      subreddit: 'charlottenc',
      username: 'user123 EXAMPLE',
      content: "Just moved to Charlotte and looking for a good gym in the South End area. Preferably something with classes as I'm not good at motivating myself.",
      date: '2025-05-10T14:22:00Z',
      sentiment: 'seeking_recommendation',
      status: 'new',
      score: 92,
      url: 'https://reddit.com/r/charlottenc/comments/abc123'
    },
    {
      id: 2,
      subreddit: 'fitness',
      username: 'fit_for_life EXAMPLE',
      content: "I've tried several HIIT workouts but can't find one that works with my schedule in Charlotte. Ideally looking for something near Uptown with early morning and late evening classes.",
      date: '2025-05-11T09:17:00Z',
      sentiment: 'pain_point',
      status: 'contacted',
      score: 87,
      url: 'https://reddit.com/r/fitness/comments/def456'
    },
  ]);


  const [filterStatus, setFilterStatus] = useState('all');
  const [isProcessing, setIsProcessing] = useState(false); // Renamed from isScanning for broader use

  // State for script generation modal
  const [scriptModalOpen, setScriptModalOpen] = useState(false);
  const [selectedLeadForScript, setSelectedLeadForScript] = useState<Lead | null>(null);
  const [generatedScript, setGeneratedScript] = useState('');
  const [generatedTalkingPoints, setGeneratedTalkingPoints] = useState<string[]>([]);
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);


  // Function to handle form submission (Start Monitoring)
  const handleSubmitConfiguration = async () => {
    console.log('Form submitted for monitoring:', formData);
    setIsProcessing(true);
    try {
      const newLeads = await processRedditDataForLeads(
        formData.subreddits,
        formData.keywords,
        formData.contentFilter,
        formData.scanFrequency
      );
      // Add new leads, ensuring no duplicates by ID, and mapping to UI Lead type
      setLeads(prevLeads => {
        const incomingLeadsMapped: Lead[] = newLeads.map(nl => ({
            ...nl,
            id: nl.id.toString(), // Ensure ID is string for consistency if needed
            status: 'new' as 'new' // Cast status
        }));
        const existingLeadIds = new Set(prevLeads.map(l => l.id.toString()));
        const uniqueNewLeads = incomingLeadsMapped.filter(nl => !existingLeadIds.has(nl.id.toString()));
        return [...uniqueNewLeads, ...prevLeads];
      });
      setCurrentStep(4); // Move to leads view
      // TODO: Here you would also save formData configuration to your backend
      console.log("Configuration submitted, simulated scan complete.");
    } catch (error) {
      console.error("Error starting monitoring process:", error);
      alert("Failed to start monitoring. Please check console for errors.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Function to handle manual scan for new leads
  const handleManualScan = async () => {
    console.log('Manual scan triggered with current config:', formData);
    setIsProcessing(true);
    try {
      const newLeads = await processRedditDataForLeads(
        formData.subreddits,
        formData.keywords,
        formData.contentFilter,
        formData.scanFrequency // Could be a different 'manual' frequency if needed
      );
      setLeads(prevLeads => {
        const incomingLeadsMapped: Lead[] = newLeads.map(nl => ({
            ...nl,
            id: nl.id.toString(),
            status: 'new' as 'new'
        }));
        const existingLeadIds = new Set(prevLeads.map(l => l.id.toString()));
        const uniqueNewLeads = incomingLeadsMapped.filter(nl => !existingLeadIds.has(nl.id.toString()));
        // Add to top, ensuring most recent are visible
        return [...uniqueNewLeads, ...prevLeads];
      });
      console.log("Manual scan complete, new leads (if any) added.");
      if (newLeads.length > 0) {
        alert(`${newLeads.length} new potential leads found!`);
      } else {
        alert("No new potential leads found in this scan.");
      }
    } catch (error) {
      console.error("Error during manual scan:", error);
      alert("Manual scan failed. Please check console for errors.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Function to handle changes in form fields
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Function to handle subreddit checkbox changes
  const handleSubredditChange = (index: number) => {
    const updatedSubreddits = [...formData.subreddits];
    updatedSubreddits[index].selected = !updatedSubreddits[index].selected;
    setFormData(prev => ({ ...prev, subreddits: updatedSubreddits }));
  };

  // Function to add custom subreddit
  const handleAddSubreddit = () => {
    if (formData.customSubreddit.trim() !== '') {
      setFormData(prev => ({
        ...prev,
        subreddits: [
          ...prev.subreddits,
          { name: formData.customSubreddit.trim(), category: 'custom', selected: true }
        ],
        customSubreddit: ''
      }));
    }
  };

  // Function to add custom keyword
  const handleAddKeyword = () => {
    if (formData.customKeyword.trim() !== '' && !formData.keywords.includes(formData.customKeyword.trim())) {
      setFormData(prev => ({
        ...prev,
        keywords: [...prev.keywords, formData.customKeyword.trim()],
        customKeyword: ''
      }));
    }
  };

  // Function to remove keyword
  const handleRemoveKeyword = (keywordToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      keywords: prev.keywords.filter(k => k !== keywordToRemove)
    }));
  };

  // Function to handle content filter changes
  const handleContentFilterToggle = (filterName: keyof typeof formData.contentFilter) => {
    setFormData(prev => ({
      ...prev,
      contentFilter: {
        ...prev.contentFilter,
        [filterName]: !prev.contentFilter[filterName]
      }
    }));
  };

  // Function to handle lead status changes
  const handleLeadStatusChange = (id: string | number, newStatus: Lead['status']) => {
    setLeads(prevLeads => prevLeads.map(lead =>
      lead.id === id ? { ...lead, status: newStatus } : lead
    ));
  };

  // Filtered leads based on search term and status filter
  const filteredLeads = leads.filter(lead => {
    const searchTermLower = searchTerm.toLowerCase();
    const matchesSearch = lead.content.toLowerCase().includes(searchTermLower) ||
      lead.username.toLowerCase().includes(searchTermLower) ||
      lead.subreddit.toLowerCase().includes(searchTermLower) ||
      (lead.reasoning && lead.reasoning.toLowerCase().includes(searchTermLower));

    const matchesStatus = filterStatus === 'all' || lead.status === filterStatus;
    return matchesSearch && matchesStatus;
  }).sort((a, b) => b.score - a.score); // Sort by newest first


  const openScriptModalForLead = async (lead: Lead) => {
    setSelectedLeadForScript(lead);
    setScriptModalOpen(true);
    setIsGeneratingScript(true);
    setGeneratedScript('');
    setGeneratedTalkingPoints([]);

    try {
      // Use lead.content or a combination of title/content for queryContext
      const queryContextForScript = `User u/${lead.username} posted in r/${lead.subreddit}: "${lead.content}". Sentiment: ${lead.sentiment}. Match score: ${lead.score}%. Reasoning: ${lead.reasoning || 'N/A'}`;
      
      const script = await generateSalesScript({
        scriptType: 'email', // Or 'call', can be a UI choice
        clientName: lead.username,
        queryContext: queryContextForScript,
        businessName: "Orange Theory Fitness Charlotte",
        // contactLogs: [] // Provide if you have contact history for this user
      });
      setGeneratedScript(script);

      if (script) {
        const points = await generateKeyTalkingPoints(script);
        setGeneratedTalkingPoints(points);
      }
    } catch (error) {
      console.error("Error generating script/talking points:", error);
      setGeneratedScript("Error: Could not generate script. " + (error instanceof Error ? error.message : "Please try again."));
      setGeneratedTalkingPoints(["Failed to load talking points."]);
    } finally {
      setIsGeneratingScript(false);
    }
  };


  // Step components
  const renderStepOne = () => (
    <div className="bg-white rounded-lg p-6 shadow-lg">
      <h2 className="text-xl font-bold mb-4">1. Select Subreddits to Monitor</h2>
      {['location', 'fitness', 'custom'].map(category => {
        const categorySubreddits = formData.subreddits.filter(sr => sr.category === category);
        if (category === 'custom' && categorySubreddits.length === 0 && !formData.customSubreddit) return null; // Don't show empty custom initially unless typing
        if (category !== 'custom' && categorySubreddits.length === 0) return null;

        return (
          <div key={category} className="mb-6">
            <h3 className="font-semibold mb-2 capitalize">{category}-related Subreddits</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {formData.subreddits
                .map((subreddit, index) => ({ ...subreddit, originalIndex: index })) // Keep original index
                .filter(sr => sr.category === category)
                .map((subreddit) => (
                  <div key={`${subreddit.name}-${subreddit.originalIndex}`} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`subreddit-${subreddit.originalIndex}`}
                      checked={subreddit.selected}
                      onChange={() => handleSubredditChange(subreddit.originalIndex)}
                      className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                    <label htmlFor={`subreddit-${subreddit.originalIndex}`} className="text-gray-700">
                      r/{subreddit.name}
                    </label>
                  </div>
                ))
              }
            </div>
          </div>
        );
      })}
      
      <div className="mb-6">
        <h3 className="font-semibold mb-2">Add Custom Subreddit</h3>
        <div className="flex space-x-2">
          <input
            type="text"
            name="customSubreddit"
            value={formData.customSubreddit}
            onChange={handleChange}
            placeholder="Enter subreddit name (e.g., entrepreneurs)"
            className="flex-1 p-2 border border-gray-300 rounded focus:ring-orange-500 focus:border-orange-500"
          />
          <button
            onClick={handleAddSubreddit}
            className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 transition-colors"
          >
            Add
          </button>
        </div>
      </div>
      
      <div className="flex justify-end mt-8">
        <button
          onClick={() => setCurrentStep(2)}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 flex items-center transition-colors"
        >
          Next <ChevronRight className="ml-2 h-5 w-5" />
        </button>
      </div>
    </div>
  );

  const renderStepTwo = () => (
    <div className="bg-white rounded-lg p-6 shadow-lg">
      <h2 className="text-xl font-bold mb-4">2. Keywords and Content Filters</h2>
      <div className="mb-6">
        <h3 className="font-semibold mb-2">Keywords to Track</h3>
        <div className="mb-4">
          <div className="flex flex-wrap gap-2 mb-3">
            {formData.keywords.map(keyword => (
              <span key={keyword} className="bg-gray-100 px-3 py-1 rounded-full flex items-center text-sm">
                {keyword}
                <button 
                  onClick={() => handleRemoveKeyword(keyword)}
                  className="ml-2 text-gray-500 hover:text-red-500"
                  aria-label={`Remove ${keyword}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex space-x-2">
            <input
              type="text"
              name="customKeyword"
              value={formData.customKeyword}
              onChange={handleChange}
              placeholder="Add keyword (e.g., gym motivation)"
              className="flex-1 p-2 border border-gray-300 rounded focus:ring-orange-500 focus:border-orange-500"
            />
            <button
              onClick={handleAddKeyword}
              className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 transition-colors"
            >
              Add
            </button>
          </div>
        </div>
      </div>
      
      <div className="mb-6">
        <h3 className="font-semibold mb-2">Content Filters</h3>
        <p className="text-sm text-gray-500 mb-3">Select types of content to prioritize:</p>
        <div className="space-y-2">
          {(Object.keys(formData.contentFilter) as Array<keyof typeof formData.contentFilter>).map(filterKey => (
            <div key={filterKey} className="flex items-center space-x-2">
              <input
                type="checkbox"
                id={`filter-${filterKey}`}
                checked={formData.contentFilter[filterKey]}
                onChange={() => handleContentFilterToggle(filterKey)}
                className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <label htmlFor={`filter-${filterKey}`} className="text-gray-700 capitalize">
                {filterKey.replace(/([A-Z])/g, ' $1').toLowerCase()}
              </label>
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex justify-between mt-8">
        <button
          onClick={() => setCurrentStep(1)}
          className="border border-gray-300 text-gray-700 px-6 py-2 rounded hover:bg-gray-100 transition-colors"
        >
          Back
        </button>
        <button
          onClick={() => setCurrentStep(3)}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 flex items-center transition-colors"
        >
          Next <ChevronRight className="ml-2 h-5 w-5" />
        </button>
      </div>
    </div>
  );

  const renderStepThree = () => (
    <div className="bg-white rounded-lg p-6 shadow-lg">
      <h2 className="text-xl font-bold mb-4">3. Scanning & Notification Settings</h2>
      <div className="mb-6">
        <h3 className="font-semibold mb-2">Scan Frequency</h3>
        <select
          name="scanFrequency"
          value={formData.scanFrequency}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded focus:ring-orange-500 focus:border-orange-500"
        >
          <option value="hourly">Hourly</option>
          <option value="daily">Daily (Recommended)</option>
          <option value="weekly">Weekly</option>
        </select>
      </div>
      
      <div className="mb-6">
        <h3 className="font-semibold mb-2">Notification Preferences</h3>
        <div className="space-y-3">
          {['email', 'teams', 'none'].map(type => (
            <div key={type}>
              <label className="inline-flex items-center mb-1">
                <input
                  type="radio"
                  name="notificationType"
                  value={type}
                  checked={formData.notificationType === type}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="ml-2 capitalize">{type === 'none' ? 'No notifications (check dashboard manually)' : `${type} notifications`}</span>
              </label>
              {formData.notificationType === 'email' && type === 'email' && (
                <input
                  type="email"
                  name="emailAddress"
                  value={formData.emailAddress}
                  onChange={handleChange}
                  placeholder="Enter email address"
                  className="w-full mt-1 p-2 border border-gray-300 rounded focus:ring-orange-500 focus:border-orange-500"
                />
              )}
              {formData.notificationType === 'teams' && type === 'teams' && (
                <input
                  type="text" // Should be 'url' but 'text' is fine for placeholder
                  name="teamsWebhook"
                  value={formData.teamsWebhook}
                  onChange={handleChange}
                  placeholder="Enter Teams webhook URL"
                  className="w-full mt-1 p-2 border border-gray-300 rounded focus:ring-orange-500 focus:border-orange-500"
                />
              )}
            </div>
          ))}
        </div>
      </div>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-blue-800 mb-2">Configuration Summary</h3>
        <div className="text-sm text-blue-700 space-y-1">
          <p><strong>Selected Subreddits:</strong> {formData.subreddits.filter(sr => sr.selected).map(sr => `r/${sr.name}`).join(', ') || 'None'}</p>
          <p><strong>Keywords:</strong> {formData.keywords.join(', ') || 'None'}</p>
          <p><strong>Scan Frequency:</strong> {formData.scanFrequency}</p>
          <p><strong>Notification Method:</strong> {formData.notificationType === 'none' ? 'Manual Dashboard Check' : formData.notificationType}</p>
        </div>
      </div>
      
      <div className="flex justify-between mt-8">
        <button
          onClick={() => setCurrentStep(2)}
          className="border border-gray-300 text-gray-700 px-6 py-2 rounded hover:bg-gray-100 transition-colors"
        >
          Back
        </button>
        <button
          onClick={handleSubmitConfiguration}
          disabled={isProcessing}
          className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 flex items-center disabled:bg-gray-400 transition-colors"
        >
          {isProcessing ? (
            <>
              <RefreshCw className="animate-spin mr-2 h-5 w-5" />
              Processing...
            </>
          ) : (
            <>
              Start Monitoring <ArrowRightCircle className="ml-2 h-5 w-5" />
            </>
          )}
        </button>
      </div>
    </div>
  );

  const renderLeadsDashboard = () => (
    <div className="bg-white rounded-lg p-6 shadow-lg">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-xl font-bold">Potential Leads Dashboard</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setCurrentStep(1)} // Go back to step 1 for full reconfig
            className="border border-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-100 flex items-center transition-colors text-sm"
          >
            <Settings className="mr-2 h-4 w-4" />
            Configure
          </button>
          <button
            onClick={handleManualScan}
            disabled={isProcessing}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center disabled:bg-blue-400 transition-colors text-sm"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isProcessing ? 'animate-spin' : ''}`} />
            {isProcessing ? 'Scanning...' : 'Scan for New Leads'}
          </button>
        </div>
      </div>

      <div className="mb-6 flex flex-col md:flex-row md:items-center md:space-x-4 space-y-2 md:space-y-0">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search leads (content, user, subreddit, reasoning)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
          </div>
          <div className="flex space-x-2 items-center">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-gray-300 rounded p-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="all">All Statuses</option>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="interested">Interested</option>
              <option value="converted">Converted</option>
              <option value="not_interested">Not Interested</option>
            </select>
            <div className="flex items-center text-gray-500 text-sm whitespace-nowrap">
              <Filter className="mr-1 h-4 w-4" />
              {filteredLeads.length} leads
            </div>
          </div>
        </div>
      
      <div className="space-y-4">
        {filteredLeads.length > 0 ? (
          filteredLeads.map(lead => (
            <div key={lead.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <div className="flex space-x-2 items-center mb-2 sm:mb-0">
                  <div className={`rounded-full h-3 w-3 ${
                    lead.status === 'new' ? 'bg-blue-500' :
                    lead.status === 'contacted' ? 'bg-yellow-500' :
                    lead.status === 'interested' ? 'bg-teal-500' :
                    lead.status === 'converted' ? 'bg-green-600' :
                    'bg-red-500' // not_interested
                  }`}></div>
                  <h3 className="font-semibold text-gray-800">u/{lead.username}</h3>
                  <span className="text-sm text-gray-500">r/{lead.subreddit}</span>
                  <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full">
                    {new Date(lead.date).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center space-x-1 text-sm text-white font-medium">
                  <span className={`px-2 py-1 rounded-md text-xs ${
                    lead.score >= 80 ? 'bg-green-600' :
                    lead.score >= 60 ? 'bg-yellow-500 text-black' :
                    lead.score >= 40 ? 'bg-orange-500' :
                    'bg-gray-400'
                  }`}>
                    {lead.score}% Match
                  </span>
                </div>
              </div>
              
              <p className="my-3 text-gray-700 text-sm">{lead.content}</p>
              {lead.reasoning && <p className="text-xs text-gray-500 italic mt-1">Reasoning: {lead.reasoning}</p>}
              
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-3 gap-2">
                <a 
                  href={lead.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-sm flex items-center"
                >
                  View Reddit Post <ArrowRightCircle className="ml-1 h-4 w-4" />
                </a>
                <div className="flex space-x-2">
                  <select
                    value={lead.status}
                    onChange={(e) => handleLeadStatusChange(lead.id, e.target.value as Lead['status'])}
                    className="text-sm border border-gray-300 rounded p-1 focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="new">Set New</option>
                    <option value="contacted">Mark Contacted</option>
                    <option value="interested">Mark Interested</option>
                    <option value="converted">Mark Converted</option>
                    <option value="not_interested">Not Interested</option>
                  </select>
                  <button
                    onClick={() => openScriptModalForLead(lead)}
                    className="bg-orange-500 text-white text-sm px-3 py-1 rounded hover:bg-orange-600 flex items-center transition-colors"
                  >
                    <MessageSquare className="mr-1 h-4 w-4" />
                    Outreach
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <Search className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">No leads found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || filterStatus !== 'all' ? 'Try adjusting your search or filters, or ' : ''}
              {currentStep === 4 ? 'scan for new leads or adjust your configuration.' : 'configure your agent and start monitoring.'}
            </p>
            {currentStep === 4 && leads.length === 0 && !isProcessing && (
                 <button
                    onClick={handleManualScan}
                    className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center mx-auto"
                >
                    <RefreshCw className="mr-2 h-4 w-4" /> Scan for Leads Now
                </button>
            )}
          </div>
        )}
      </div>
    </div>
  );

  // Script generation modal
  const renderScriptModal = () => {
    if (!scriptModalOpen || !selectedLeadForScript) return null;

    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50 transition-opacity duration-300">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-start">
              <h2 className="text-xl font-bold text-gray-800">Outreach Script for u/{selectedLeadForScript.username}</h2>
              <button
                onClick={() => setScriptModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Close modal"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>
          
          <div className="p-6 overflow-y-auto flex-grow">
            {isGeneratingScript ? (
              <div className="flex flex-col items-center justify-center h-64">
                <RefreshCw className="h-12 w-12 text-orange-500 animate-spin" />
                <p className="mt-4 text-gray-600">Generating script and talking points...</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <div className="mb-6">
                    <h3 className="font-semibold text-sm uppercase text-gray-500 mb-2">Generated Script</h3>
                    <div 
                        className="border border-gray-200 rounded-lg p-4 bg-gray-50 whitespace-pre-line text-sm text-gray-700 min-h-[200px]"
                        contentEditable // Basic editability
                        suppressContentEditableWarning
                        onBlur={(e) => setGeneratedScript(e.currentTarget.innerText)} // Update state on blur
                    >
                      {generatedScript}
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => openScriptModalForLead(selectedLeadForScript)} // Re-calls generation
                      className="flex-1 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-50 text-sm transition-colors"
                    >
                      Regenerate
                    </button>
                    {/* <button className="flex-1 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-50 text-sm transition-colors">
                      Suggest Edits (Future)
                    </button> */}
                    <button 
                        className="flex-1 bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 flex items-center justify-center text-sm transition-colors"
                        onClick={() => alert("Send DM functionality not implemented yet.")}
                    >
                      <UserPlus className="mr-2 h-4 w-4" />
                      Send DM (Simulated)
                    </button>
                  </div>
                </div>
                
                <div className="md:col-span-1">
                  <div className="mb-6">
                    <h3 className="font-semibold text-sm uppercase text-gray-500 mb-2">Key Talking Points</h3>
                    {generatedTalkingPoints.length > 0 ? (
                        <ul className="space-y-2">
                        {generatedTalkingPoints.map((point, index) => (
                            <li key={index} className="flex items-start">
                            <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-gray-700">{point}</span>
                            </li>
                        ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-gray-500">No talking points generated or available.</p>
                    )}
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-sm uppercase text-gray-500 mb-2">Original Post Context</h3>
                    <div className="border border-gray-200 rounded p-3 bg-gray-50 text-xs text-gray-600 max-h-48 overflow-y-auto">
                      <p className="font-medium">u/{selectedLeadForScript.username} in r/{selectedLeadForScript.subreddit}</p>
                      <p className="mt-1">{selectedLeadForScript.content}</p>
                      <div className="mt-2 text-gray-500">
                        Posted: {new Date(selectedLeadForScript.date).toLocaleDateString()}
                      </div>
                       {selectedLeadForScript.reasoning && <p className="mt-1 italic">AI Reasoning: {selectedLeadForScript.reasoning}</p>}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Render the current step
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: return renderStepOne();
      case 2: return renderStepTwo();
      case 3: return renderStepThree();
      case 4: return renderLeadsDashboard();
      default: return renderStepOne();
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 font-sans">
      <div className="max-w-5xl mx-auto mb-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center">
            <div className="bg-orange-500 text-white font-bold text-xl p-2 rounded-md">OTF</div>
            <h1 className="text-2xl font-bold ml-3 text-gray-800">Orange Theory Charlotte</h1>
            <div className="ml-4 text-gray-500 hidden md:block">Reddit Sales Agent</div>
          </div>

          {currentStep < 4 && (
            <div className="flex items-center">
              <div className="hidden sm:flex space-x-1 items-center">
                {[1, 2, 3].map(step => (
                  <React.Fragment key={step}>
                    <div className={`h-2.5 w-2.5 rounded-full transition-colors ${currentStep >= step ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
                    {step < 3 && <div className={`h-1 w-8 transition-colors ${currentStep > step ? 'bg-blue-600' : 'bg-gray-300'}`}></div>}
                  </React.Fragment>
                ))}
              </div>
              <span className="ml-3 text-sm text-gray-600">Step {currentStep} of 3</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="max-w-5xl mx-auto">
        {renderCurrentStep()}
      </div>
      
      {scriptModalOpen && renderScriptModal()}
    </div>
  );
};

export default OrangeSalesAgent;