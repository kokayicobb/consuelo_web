"use client"; // Ensure this is at the top

import { Dialog } from "@headlessui/react";
import { Fragment, useState, useEffect, useRef, useCallback } from "react";
import {
  X,
  Copy,
  Check,
  Phone,
  Mail,
  Clock,
  FileText,
  User,
  CreditCard,
  Calendar,
  ChevronRight,
  MessageSquare,
  Tag,
  Loader2,
  AlertTriangle,
  Save,
  Sparkles,
  Edit,
} from "lucide-react";
import type { OtfContactLog, OtfClient } from "@/types/otf";
import { generateSalesScript, generateKeyTalkingPoints, generateScriptEdits } from "@/lib/actions";

// Define suggestion type
interface ScriptSuggestion {
  original?: string;
  suggested: string;
  type: 'tone' | 'clarity' | 'structure' | 'enhancement';
  reason?: string;
}

// Define the ClientScriptData interface
interface ClientScriptData {
  clientInfo?: Partial<OtfClient>;
  contactLogs?: OtfContactLog[];
  membershipType?: string;
  coach?: string;
  joinDate?: string;
  lastVisit?: string;
}

export default function ScriptModal({
  isOpen,
  onClose,
  scriptType,
  clientName,
  script: initialScript,
  contactLogs,
  queryContext,
  clientData,
  onScriptUpdate,
}: {
  isOpen: boolean;
  onClose: () => void;
  scriptType: "email" | "call";
  clientName?: string;
  script?: string;
  contactLogs?: OtfContactLog[];
  queryContext?: string;
  clientData?: ClientScriptData;
  onScriptUpdate?: (newScript: string) => void;
}) {
  const [isCopied, setIsCopied] = useState(false);
  const [script, setScript] = useState(initialScript || "");
  const [isGeneratingScript, setIsGeneratingScript] = useState(!initialScript);
  const [activeTab, setActiveTab] = useState(scriptType);
  const [expandedLogs, setExpandedLogs] = useState(false);
  const [editableScript, setEditableScript] = useState(script || '');
  const [isApplyingSuggestion, setIsApplyingSuggestion] = useState(false);
  const [hoveredSuggestion, setHoveredSuggestion] = useState<ScriptSuggestion | null>(null);
  const [talkingPoints, setTalkingPoints] = useState<string[]>([]);
  const [isGeneratingPoints, setIsGeneratingPoints] = useState(false);
  const [pointsError, setPointsError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [scriptSuggestions, setScriptSuggestions] = useState<ScriptSuggestion[]>([]);
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);
  const [expandedSuggestions, setExpandedSuggestions] = useState(false);
  const [lastAnalyzedScript, setLastAnalyzedScript] = useState<string>("");
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Extract client information
  const client = {
    name: clientName || clientData?.clientInfo?.Client || "Unknown Client",
    email: clientData?.clientInfo?.Email || clientData?.clientInfo?.email || "",
    phone: clientData?.clientInfo?.Phone || clientData?.clientInfo?.phone || "",
    lastVisit: clientData?.lastVisit || clientData?.clientInfo?.["Last Visit"] || "",
    membershipType: clientData?.membershipType || 
                   clientData?.clientInfo?.["Pricing Option"] || 
                   clientData?.clientInfo?.["pricing option"] || 
                   "Prospect",
    expirationDate: clientData?.clientInfo?.["Expiration Date"] || "",
    id: clientData?.clientInfo?.["Client ID"] || "",
    visits: clientData?.clientInfo?.["# Visits"] || "",
  };

  // Extract first name for personalized display
  const firstName = client.name?.split(", ")[1] || client.name || clientName || "";
  const lastName = client.name?.split(", ")[0] || "";

  // Calculate days since last visit
  const daysSinceLastVisit = calculateDaysSince(client.lastVisit);

  // Determine if membership is expiring soon (within 30 days)
  const isExpiringSoon = isDateWithinDays(client.expirationDate, 30);

  // Helper function to find text to highlight
  const findTextToHighlight = useCallback((suggestion: ScriptSuggestion, text: string): { start: number, end: number } | null => {
    // If suggestion has original text, use that
    if (suggestion.original && text.includes(suggestion.original)) {
      const start = text.indexOf(suggestion.original);
      return {
        start,
        end: start + suggestion.original.length
      };
    }
    
    // Otherwise use intelligent matching based on suggestion type
    if (suggestion.type === 'tone' && (
      suggestion.suggested.startsWith("Hello") || 
      suggestion.suggested.includes("greeting") || 
      suggestion.suggested.includes("introduction")
    )) {
      // For openings, try to match first sentence or line
      const firstSentenceMatch = text.match(/^[^.!?]+[.!?]/);
      const firstLineMatch = text.match(/^[^\n]+/);
      
      if (firstSentenceMatch) {
        return {
          start: 0,
          end: firstSentenceMatch[0].length
        };
      } else if (firstLineMatch) {
        return {
          start: 0,
          end: firstLineMatch[0].length
        };
      }
    }
    
    // For closing lines
    if (suggestion.suggested.includes("thank") || 
        suggestion.suggested.includes("look forward") || 
        suggestion.suggested.toLowerCase().includes("call to action")) {
      // Try to match last sentence or line
      const lastSentenceMatch = text.match(/[^.!?]+[.!?]$/);
      const lastLineMatch = text.match(/[^\n]+$/);
      
      if (lastSentenceMatch) {
        const start = text.lastIndexOf(lastSentenceMatch[0]);
        return {
          start,
          end: start + lastSentenceMatch[0].length
        };
      } else if (lastLineMatch) {
        const start = text.lastIndexOf(lastLineMatch[0]);
        return {
          start,
          end: start + lastLineMatch[0].length
        };
      }
    }
    
    return null; // Nothing to highlight
  }, []);

  // Improved adjust textarea height function
  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    // Store the current scroll position
    const scrollTop = textarea.scrollTop;
    
    // Reset height to auto to get the correct scrollHeight
    textarea.style.height = 'auto';
    
    // Set the height to the scrollHeight plus a small buffer
    const newHeight = `${Math.max(textarea.scrollHeight + 5, 200)}px`;
    textarea.style.height = newHeight;
    
    // Update any parent container heights if needed
    const scriptContentParent = textarea.closest('.relative');
    if (scriptContentParent && scriptContentParent instanceof HTMLElement) {
      scriptContentParent.style.minHeight = newHeight;
    }
    
    // Restore scroll position
    textarea.scrollTop = scrollTop;
    
    console.log("Adjusted textarea height to:", textarea.style.height);
  }, []);

  // Helper function to fetch talking points
  const fetchTalkingPoints = useCallback(async (scriptToAnalyze: string) => {
    if (!scriptToAnalyze || scriptToAnalyze.trim().length < 20) {
      setTalkingPoints([]);
      setIsGeneratingPoints(true);
      setPointsError(null);
      return;
    }
    setIsGeneratingPoints(true);
    setPointsError(null);
    try {
      console.log("Requesting talking points for script:", scriptToAnalyze.substring(0, 50) + "...");
      const points = await generateKeyTalkingPoints(scriptToAnalyze);
      console.log("Received talking points:", points);
      setTalkingPoints(points);
    } catch (error) {
      console.error("Error generating talking points:", error);
      setPointsError("Could not generate talking points.");
      setTalkingPoints([]);
    } finally {
      setIsGeneratingPoints(false);
    }
  }, []);

  // Generate script suggestions
  const generateScriptSuggestions = useCallback(async (scriptToAnalyze: string) => {
    if (!scriptToAnalyze || scriptToAnalyze.trim().length < 30) {
      setScriptSuggestions([]);
      setIsGeneratingSuggestions(false);
      return;
    }
    
    // Skip if the script hasn't changed enough
    if (scriptToAnalyze === lastAnalyzedScript) {
      return;
    }
    
    setIsGeneratingSuggestions(true);
    
    try {
      console.log("Generating suggestions for script...");
      const suggestions = await generateScriptEdits(scriptToAnalyze);
      setScriptSuggestions(suggestions);
      setLastAnalyzedScript(scriptToAnalyze);
    } catch (error) {
      console.error("Error generating script suggestions:", error);
      setScriptSuggestions([]);
    } finally {
      setIsGeneratingSuggestions(false);
    }
  }, [lastAnalyzedScript]);

  // Handle script generation
  const handleGenerateScript = useCallback(async (newScriptType: "call" | "email") => {
    setIsGeneratingScript(true);
    setScript("");
    setEditableScript("");
    setTalkingPoints([]);
    setIsGeneratingPoints(false);
    setPointsError(null);
    setLastAnalyzedScript("");
    setScriptSuggestions([]);

    try {
      console.log(`Requesting ${newScriptType} script for ${firstName}`);
      const generatedScript = await generateSalesScript({
        contactLogs: contactLogs || [],
        scriptType: newScriptType,
        clientName: firstName,
        queryContext,
        businessName: "Orange Theory Fitness",
      });
      console.log("Generated script received:", generatedScript.substring(0, 50) + "...");

      setScript(generatedScript);
      setEditableScript(generatedScript);
      
      // Use a sequence of timeouts for more reliable behavior
      setTimeout(() => {
        adjustTextareaHeight();
        
        setTimeout(() => {
          fetchTalkingPoints(generatedScript);
        }, 100);
      }, 50);
      
    } catch (error) {
      console.error(`Error generating ${newScriptType} script:`, error);
      const errorMessage = `Error generating ${newScriptType} script. Please try again or refresh.`;
      setScript(errorMessage);
      setEditableScript(errorMessage);
      setTalkingPoints([]);
      setPointsError(null);
    } finally {
      setIsGeneratingScript(false);
    }
  }, [adjustTextareaHeight, contactLogs, fetchTalkingPoints, firstName, queryContext]);

  // Apply a suggestion to the script
  const applySuggestion = useCallback((suggestion: ScriptSuggestion) => {
    // Flag that we're applying a suggestion to prevent immediate regeneration
    setIsApplyingSuggestion(true);
    
    setEditableScript((current) => {
      // If we have original text, replace it
      if (suggestion.original && current.includes(suggestion.original)) {
        return current.replace(suggestion.original, suggestion.suggested);
      }
      
      // If there's no original but it's a tone/clarity suggestion, try intelligent insertion
      if (!suggestion.original && (suggestion.type === 'tone' || suggestion.type === 'clarity')) {
        // For opening lines (typically tone suggestions):
        if (suggestion.type === 'tone' && (suggestion.suggested.startsWith("Hello") || 
            suggestion.suggested.includes("greeting") || 
            suggestion.suggested.includes("introduction"))) {
          // Try to replace the first sentence or line
          const firstSentenceMatch = current.match(/^[^.!?]+[.!?]/);
          const firstLineMatch = current.match(/^[^\n]+/);
          
          if (firstSentenceMatch) {
            return current.replace(firstSentenceMatch[0], suggestion.suggested);
          } else if (firstLineMatch) {
            return current.replace(firstLineMatch[0], suggestion.suggested);
          }
        }
        
        // For closing lines:
        if (suggestion.suggested.includes("thank") || 
            suggestion.suggested.includes("look forward") || 
            suggestion.suggested.toLowerCase().includes("call to action")) {
          // Try to replace the last sentence or line
          const lastSentenceMatch = current.match(/[^.!?]+[.!?]$/);
          const lastLineMatch = current.match(/[^\n]+$/);
          
          if (lastSentenceMatch) {
            return current.replace(lastSentenceMatch[0], suggestion.suggested);
          } else if (lastLineMatch) {
            return current.replace(lastLineMatch[0], suggestion.suggested);
          }
        }
      }
      
      // Otherwise append it with a newline if needed
      return current + (current.endsWith('\n') ? '' : '\n\n') + suggestion.suggested;
    });
    
    // After applying the suggestion, adjust the textarea height
    setTimeout(() => {
      adjustTextareaHeight();
      // Then reset the flags after a delay
      setTimeout(() => {
        setLastAnalyzedScript(editableScript);
        setIsApplyingSuggestion(false);
      }, 500);
    }, 50);
  }, [adjustTextareaHeight, editableScript]);

  // Function to save script changes
  const handleSaveScript = useCallback(() => {
    setScript(editableScript);
    if (onScriptUpdate) {
      onScriptUpdate(editableScript);
    }
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
    
    if (editableScript !== script) {
      fetchTalkingPoints(editableScript);
      setLastAnalyzedScript("");
    }
  }, [editableScript, fetchTalkingPoints, onScriptUpdate, script]);

  // Copy to clipboard handler
  const handleCopyToClipboard = useCallback(() => {
    navigator.clipboard.writeText(editableScript || script || "");
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  }, [editableScript, script]);

  // Tab change handler
  const handleTabChange = useCallback((tab: "call" | "email") => {
    if (tab !== activeTab) {
      console.log("Changing tab to:", tab);
      setActiveTab(tab);
      
      // Generate new script and points for the selected tab
      handleGenerateScript(tab);
      
      // Force resize after tab change
      setTimeout(adjustTextareaHeight, 100);
    }
  }, [activeTab, adjustTextareaHeight, handleGenerateScript]);

  // Effect for handling script suggestions
  useEffect(() => {
    // Skip empty scripts or when already generating
    if (!editableScript || editableScript.trim().length < 30 || isGeneratingSuggestions) {
      return;
    }
    
    // Skip if script hasn't changed significantly OR if it was just set by applySuggestion
    if ((Math.abs(editableScript.length - lastAnalyzedScript.length) < 10 && 
        editableScript.includes(lastAnalyzedScript.substring(0, 30))) ||
        isApplyingSuggestion) {
      return;
    }
    
    console.log("Debouncing script suggestions...");
    const debounceTimer = setTimeout(() => {
      generateScriptSuggestions(editableScript);
    }, 2000); // 2 second delay to avoid too many calls

    return () => clearTimeout(debounceTimer);
  }, [editableScript, isGeneratingSuggestions, generateScriptSuggestions, lastAnalyzedScript, isApplyingSuggestion]);

  // Effect for handling initial load and tab selection
  useEffect(() => {
    if (isOpen) {
      setActiveTab(scriptType);

      if (initialScript) {
        if (initialScript !== script) {
          console.log("Using initial script prop");
          setScript(initialScript);
          setEditableScript(initialScript);
          
          setTimeout(() => {
            fetchTalkingPoints(initialScript);
            adjustTextareaHeight();
          }, 50);
          
          setIsGeneratingScript(false);
        }
      } else if (!script && !isGeneratingScript) {
        console.log("No initial script, generating new one for initial tab:", scriptType);
        handleGenerateScript(scriptType);
      }
    }
  }, [isOpen, initialScript, scriptType, script, isGeneratingScript, fetchTalkingPoints, adjustTextareaHeight, handleGenerateScript]);

  // Effect for textarea height on content change
  useEffect(() => {
    adjustTextareaHeight();
  }, [editableScript, adjustTextareaHeight]);

  // Effect for adjusting height on tab changes
  useEffect(() => {
    if (!isGeneratingScript && editableScript) {
      const timer1 = setTimeout(() => {
        adjustTextareaHeight();
        
        const timer2 = setTimeout(adjustTextareaHeight, 300);
        return () => clearTimeout(timer2);
      }, 50);
      
      return () => clearTimeout(timer1);
    }
  }, [activeTab, isGeneratingScript, editableScript, adjustTextareaHeight]);

  // Effect to sync highlight view with textarea when hovering
  useEffect(() => {
    // When hovering state changes, make sure heights stay synced
    if (hoveredSuggestion) {
      // When entering hover state, set the highlight container height to match textarea
      const textarea = textareaRef.current;
      if (textarea) {
        const highlightContainer = textarea.parentElement?.querySelector('.absolute.inset-0');
        if (highlightContainer && highlightContainer instanceof HTMLElement) {
          highlightContainer.style.height = `${textarea.scrollHeight}px`;
          highlightContainer.scrollTop = textarea.scrollTop;
        }
      }
    }
  }, [hoveredSuggestion]);

  return (
    <Dialog as={Fragment} open={isOpen} onClose={onClose}>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
        <Dialog.Panel className="bg-white rounded-lg shadow-xl w-full max-w-4xl p-0 relative max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="p-4 bg-sky-50 border-b border-sky-100 flex justify-between items-center sticky top-0 z-10">
            <Dialog.Title className="text-xl font-semibold text-gray-900">
              Client Communication Script
            </Dialog.Title>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-sky-500 rounded"
            >
              <X size={24} />
            </button>
          </div>

          {/* Main content */}
          <div className="overflow-y-auto p-5 flex-grow">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Client Information Panel */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden h-full flex flex-col">
                  <div className="bg-gradient-to-r from-sky-50 to-sky-100 p-4 border-b border-gray-200">
                    <h3 className="flex items-center text-lg font-semibold text-gray-800">
                      <User className="h-5 w-5 mr-2 text-sky-600" />
                      <span>{firstName} {lastName}</span>
                    </h3>
                    <p className="text-sm text-gray-600">
                      Client ID: {client.id || "N/A"}
                    </p>
                  </div>

                  <div className="p-4 space-y-5 flex-grow flex flex-col">
                    {/* Contact Information */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Contact Info
                      </h4>
                      <div className="grid grid-cols-1 gap-2">
                        {client.phone && (
                          <div className="flex items-center group">
                            <Phone className="h-4 w-4 mr-2 text-gray-400 group-hover:text-sky-600 transition-colors" />
                            <a href={`tel:${client.phone}`} className="text-sm text-gray-700 hover:text-sky-600 hover:underline">
                              {client.phone}
                            </a>
                          </div>
                        )}
                        {client.email && (
                          <div className="flex items-center group">
                            <Mail className="h-4 w-4 mr-2 text-gray-400 group-hover:text-sky-600 transition-colors" />
                             <a href={`mailto:${client.email}`} className="text-sm text-gray-700 hover:text-sky-600 hover:underline truncate" title={client.email}>
                              {client.email}
                            </a>
                          </div>
                        )}
                        {!client.phone && !client.email && (
                           <p className="text-sm text-gray-500 italic">No contact info available.</p>
                        )}
                      </div>
                    </div>

                    {/* Membership Status */}
                    <div className="space-y-2">
                       <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Membership
                      </h4>
                      <div className="grid grid-cols-1 gap-2">
                        {client.membershipType && client.membershipType !== 'Prospect' && (
                          <div className="flex items-center">
                            <CreditCard className="h-4 w-4 mr-2 text-gray-400" />
                            <span className="text-sm text-gray-700">{client.membershipType}</span>
                          </div>
                        )}
                         {client.membershipType === 'Prospect' && (
                          <div className="flex items-center">
                            <User className="h-4 w-4 mr-2 text-gray-400" />
                            <span className="text-sm text-gray-700">{client.membershipType}</span>
                          </div>
                        )}
                        {client.expirationDate && (
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                            <span className="text-sm text-gray-700">
                              Expires: {client.expirationDate}
                            </span>
                            {isExpiringSoon && (
                              <span className="ml-2 px-2 py-0.5 text-xs bg-amber-100 text-amber-800 rounded-full border border-amber-200 font-medium">
                                Soon
                              </span>
                            )}
                          </div>
                        )}
                        {client.lastVisit && (
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-2 text-gray-400" />
                            <span className="text-sm text-gray-700">
                              Last Visit: {client.lastVisit}
                            </span>
                             {daysSinceLastVisit > 0 && (
                               <span className={`ml-2 px-2 py-0.5 text-xs rounded-full border font-medium ${
                                 daysSinceLastVisit > 60 ? 'bg-red-100 text-red-800 border-red-200' :
                                 daysSinceLastVisit > 30 ? 'bg-amber-100 text-amber-800 border-amber-200' :
                                 'bg-green-100 text-green-800 border-green-200'
                               }`}>
                                 {daysSinceLastVisit}d ago
                               </span>
                             )}
                          </div>
                        )}
                         {client.visits !== '' && client.visits !== null && (
                            <div className="flex items-center">
                               <FileText className="h-4 w-4 mr-2 text-gray-400" />
                               <span className="text-sm text-gray-700">
                                  Total Visits: {client.visits}
                               </span>
                            </div>
                         )}
                      </div>
                    </div>

                    {/* Contact History */}
                    {contactLogs && contactLogs.length > 0 && (
                      <div className="space-y-2">
                        <div
                          className="flex items-center justify-between cursor-pointer group"
                          onClick={() => setExpandedLogs(!expandedLogs)}
                        >
                          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1 group-hover:text-sky-600 transition-colors">
                            <MessageSquare className="h-4 w-4" />
                            Contact History ({contactLogs.length})
                          </h4>
                          <ChevronRight
                            className={`h-4 w-4 text-gray-400 transition-transform group-hover:text-sky-600 ${
                              expandedLogs ? "rotate-90" : ""
                            }`}
                          />
                        </div>

                        {expandedLogs && (
                          <div className="space-y-3 max-h-40 overflow-y-auto pr-2 mt-2 border-l-2 border-gray-100 pl-3">
                            {contactLogs.map((log, index) => (
                              <div key={index} className="py-1 relative">
                                <div className="flex justify-between items-start mb-0.5">
                                  <span className="text-xs font-medium text-gray-700">
                                    {log["Log Date"]}
                                  </span>
                                  <span className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded">
                                    {log["Contact Method"]}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-600 leading-relaxed">
                                  {log["Contact Log"]}
                                </p>
                                {log["Log Type"] && (
                                  <div className="flex items-center mt-1 gap-1 text-xs text-gray-500">
                                    <Tag className="h-3 w-3" />
                                    {log["Log Type"]}
                                    {log["Sub Type"] ? ` / ${log["Sub Type"]}` : ""}
                                  </div>
                                )}
                                {index < contactLogs.length - 1 && <hr className="mt-2 border-gray-100" />}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* AI Script Suggestions */}
                    <div className="space-y-2 mt-4 flex-grow flex flex-col h-full">
                      <div
                        className="flex items-center justify-between cursor-pointer group"
                        onClick={() => setExpandedSuggestions(!expandedSuggestions)}
                      >
                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1 group-hover:text-sky-600 transition-colors">
                          <Sparkles className="h-4 w-4 text-sky-500" />
                          AI Script Suggestions
                          {isGeneratingSuggestions && <Loader2 className="h-3 w-3 ml-1 animate-spin text-sky-500" />}
                        </h4>
                        <ChevronRight
                          className={`h-4 w-4 text-gray-400 transition-transform group-hover:text-sky-600 ${
                            expandedSuggestions ? "rotate-90" : ""
                          }`}
                        />
                      </div>

                      {expandedSuggestions && (
                        <div className="flex-grow overflow-y-auto pr-2 mt-2 border-l-2 border-sky-100 pl-3 space-y-3" style={{ minHeight: '200px' }}>
                          {isGeneratingSuggestions ? (
                            <div className="space-y-2 py-2">
                              <div className="h-3 bg-sky-50 rounded w-3/4 animate-pulse"></div>
                              <div className="h-3 bg-sky-50 rounded w-5/6 animate-pulse"></div>
                              <div className="h-3 bg-sky-50 rounded w-1/2 animate-pulse"></div>
                            </div>
                          ) : scriptSuggestions.length > 0 ? (
                            scriptSuggestions.map((suggestion, index) => (
                              <div 
                                key={index} 
                                className="py-2 relative group cursor-pointer hover:bg-sky-50 rounded px-2 transition-colors"
                                onClick={() => applySuggestion(suggestion)}
                                onMouseEnter={() => {
                                  // Capture current textarea dimensions before switching views
                                  const textarea = textareaRef.current;
                                  if (textarea) {
                                    textarea.style.height = `${textarea.scrollHeight}px`;
                                  }
                                  setHoveredSuggestion(suggestion);
                                }}
                                onMouseLeave={() => {
                                  setHoveredSuggestion(null);
                                  // After switching back, ensure dimensions are preserved
                                  setTimeout(adjustTextareaHeight, 10);
                                }}
                              >
                                <div className="flex items-start mb-0.5 justify-between">
                                  <div className="flex items-center">
                                    <Edit className="h-3.5 w-3.5 mr-1.5 text-sky-600 flex-shrink-0" />
                                    <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                                      suggestion.type === 'tone' ? 'bg-blue-50 text-blue-700' :
                                      suggestion.type === 'clarity' ? 'bg-green-50 text-green-700' :
                                      suggestion.type === 'structure' ? 'bg-purple-50 text-purple-700' :
                                      'bg-amber-50 text-amber-700'
                                    }`}>
                                      {suggestion.type.charAt(0).toUpperCase() + suggestion.type.slice(1)}
                                    </span>
                                  </div>
                                  <span className="opacity-0 group-hover:opacity-100 text-xs text-sky-600 bg-sky-50 px-1.5 py-0.5 rounded transition-opacity">
                                    Apply
                                  </span>
                                </div>
                                <p className="text-xs text-gray-700 leading-relaxed border-l-2 border-sky-200 pl-2 ml-1 mt-1.5">
                                  "{suggestion.suggested}"
                                </p>
                                {suggestion.reason && (
                                  <p className="text-xs text-gray-500 italic mt-1">
                                    {suggestion.reason}
                                  </p>
                                )}
                                {index < scriptSuggestions.length - 1 && <hr className="mt-2 border-sky-100" />}
                              </div>
                            ))
                          ) : (
                            <p className="text-xs text-gray-500 italic py-2">
                              {editableScript && editableScript.length > 20 
                                ? "No suggestions available. Your script looks good!" 
                                : "Add more content to your script to get AI suggestions."}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Script Generator Panel */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                  <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        Communication Script
                      </h3>
                      <p className="text-sm text-gray-500">
                        AI-generated script based on client history
                      </p>
                    </div>
                    {client.membershipType && (
                      <span className={`px-2.5 py-1 text-xs font-medium rounded border ${
                        client.membershipType === 'Prospect'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-sky-50 text-sky-700 border-sky-200'
                      }`}>
                        {client.membershipType}
                      </span>
                    )}
                  </div>

                  <div className="p-4">
                    {/* Tabs */}
                    <div className="border-b border-gray-200 mb-4">
                      <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                        <button
                          onClick={() => handleTabChange("call")}
                          className={`whitespace-nowrap pb-3 px-1 border-b-2 flex items-center text-sm font-medium transition-colors duration-150 ease-in-out ${
                            activeTab === "call"
                              ? "border-sky-500 text-sky-600"
                              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                          }`}
                          aria-current={activeTab === "call" ? "page" : undefined}
                        >
                          <Phone className="h-4 w-4 mr-2" />
                          Call Script
                        </button>
                        <button
                          onClick={() => handleTabChange("email")}
                           className={`whitespace-nowrap pb-3 px-1 border-b-2 flex items-center text-sm font-medium transition-colors duration-150 ease-in-out ${
                            activeTab === "email"
                              ? "border-sky-500 text-sky-600"
                              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                          }`}
                          aria-current={activeTab === "email" ? "page" : undefined}
                        >
                          <Mail className="h-4 w-4 mr-2" />
                          Email Template
                        </button>
                      </nav>
                    </div>

                    {/* Key Talking Points Section */}
                    <div className="bg-gradient-to-r from-sky-50 to-sky-100 p-4 rounded-lg border border-sky-100 mb-5 shadow-sm">
                       <h4 className="text-sm font-semibold text-sky-800 mb-3 flex items-center">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-sky-600" viewBox="0 0 20 20" fill="currentColor">
                           <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                         </svg>
                         Key Talking Points
                         {isGeneratingPoints && <Loader2 className="h-4 w-4 ml-2 animate-spin text-sky-500" />}
                      </h4>
                      {isGeneratingPoints ? (
                        <div className="space-y-2">
                          <div className="h-3 bg-sky-100 rounded w-3/4 animate-pulse"></div>
                          <div className="h-3 bg-sky-100 rounded w-5/6 animate-pulse"></div>
                          <div className="h-3 bg-sky-100 rounded w-1/2 animate-pulse"></div>
                        </div>
                      ) : pointsError ? (
                         <div className="flex items-center text-sm text-red-700 bg-red-100 p-3 rounded border border-red-200">
                            <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0 text-red-600" />
                            {pointsError}
                         </div>
                      ) : talkingPoints.length > 0 ? (
                        <ul className="space-y-2">
                          {talkingPoints.map((point, pointIdx) => (
                            <li key={pointIdx} className="flex items-start">
                              <Check className="h-4 w-4 mr-2 mt-0.5 text-sky-500 flex-shrink-0" />
                              <span className="text-sm text-gray-700">{point}</span>
                            </li>
                          ))}
                        </ul>
                      ) : !isGeneratingScript ? (
                         <p className="text-sm text-gray-500 italic">No key talking points generated for this script.</p>
                      ) : null}
                    </div>

                    {/* Context line */}
                    <div className="mb-3 flex justify-between items-center text-xs text-gray-500">
                      <div>
                        {activeTab === "call" ? "Phone Script" : "Email Template"} • For{" "}
                        <span className="font-medium text-gray-700">{firstName || "Client"}</span>
                      </div>
                      {contactLogs && contactLogs.length > 0 && (
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          Last contact: {contactLogs[0]["Log Date"]}
                        </div>
                      )}
                    </div>

                    {/* Script Content Area - THIS IS THE UPDATED PART */}
                    <div className="bg-white border border-gray-200 rounded-md relative shadow-inner">
                      <div className="p-4 min-h-[250px]">
                        {isGeneratingScript ? (
                          <div className="space-y-3 py-4">
                            <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                            <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                            <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse"></div>
                            <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                            <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse"></div>
                            <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                            <div className="h-4 bg-gray-200 rounded w-4/5 animate-pulse"></div>
                          </div>
                        ) : (
                          <div className="relative min-h-[200px]">
                            <button
                              onClick={handleCopyToClipboard}
                              className="absolute top-0 right-0 mt-1 mr-1 p-1.5 text-gray-400 hover:text-sky-600 hover:bg-sky-100 rounded-full transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-sky-300 z-10"
                              title="Copy script"
                            >
                              {isCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                            </button>
                            
                            {/* Always maintain the textarea for consistent height and scrolling */}
                            <textarea
                              ref={textareaRef}
                              value={editableScript}
                              onChange={(e) => setEditableScript(e.target.value)}
                              className={`w-full text-sm text-gray-800 leading-relaxed pt-8 pr-8 border-none focus:ring-0 focus:outline-none resize-none bg-transparent ${
                                hoveredSuggestion ? 'opacity-0 absolute inset-0' : ''
                              }`}
                              placeholder={isGeneratingScript ? 'Generating script...' : 'No script generated. Type here to create one.'}
                              spellCheck={true}
                              style={{ minHeight: '200px' }}
                            />
                            
                            {/* Show highlighted text overlay when hovering over a suggestion */}
                            {hoveredSuggestion && (
                              <div 
                                className="absolute inset-0 pt-8 pr-8 overflow-auto text-sm text-gray-800 leading-relaxed"
                                style={{ minHeight: '200px' }}
                              >
                                {(() => {
                                  const highlightInfo = findTextToHighlight(hoveredSuggestion, editableScript);
                                  
                                  if (highlightInfo) {
                                    const beforeText = editableScript.substring(0, highlightInfo.start);
                                    const highlightedText = editableScript.substring(highlightInfo.start, highlightInfo.end);
                                    const afterText = editableScript.substring(highlightInfo.end);
                                    
                                    return (
                                      <>
                                        <span className="whitespace-pre-wrap">{beforeText}</span>
                                        <span className="whitespace-pre-wrap bg-sky-100 border-b-2 border-sky-400">{highlightedText}</span>
                                        <span className="whitespace-pre-wrap">{afterText}</span>
                                      </>
                                    );
                                  } else {
                                    return <span className="whitespace-pre-wrap">{editableScript}</span>;
                                  }
                                })()}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Save button */}
                    {!isGeneratingScript && (
                      <div className="mt-3 flex justify-end">
                        <button
                          onClick={handleSaveScript}
                          className="px-3 py-1.5 bg-sky-100 text-sky-700 hover:bg-sky-200 rounded-md text-sm font-medium transition-colors duration-150 flex items-center"
                        >
                          {isSaved ? (
                            <>
                              <Check className="h-4 w-4 mr-1.5 text-green-600" />
                              Saved
                            </>
                          ) : (
                            <>
                              <Save className="h-4 w-4 mr-1.5" />
                              Save Changes
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}

// Helper functions
function calculateDaysSince(dateString?: string): number {
  if (!dateString || isNaN(new Date(dateString).getTime())) return 0;
  try {
      const date = new Date(dateString);
      const now = new Date();
      date.setHours(0, 0, 0, 0);
      now.setHours(0, 0, 0, 0);
      const diffTime = Math.abs(now.getTime() - date.getTime());
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  } catch (e) {
      console.error("Error calculating days since:", e);
      return 0;
  }
}

function isDateWithinDays(dateString?: string, days = 30): boolean {
   if (!dateString || isNaN(new Date(dateString).getTime())) return false;
    try {
      const date = new Date(dateString);
      const now = new Date();
      date.setHours(0, 0, 0, 0);
      now.setHours(0, 0, 0, 0);
      const diffTime = date.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays <= days;
   } catch (e) {
       console.error("Error checking date within days:", e);
       return false;
   }
}