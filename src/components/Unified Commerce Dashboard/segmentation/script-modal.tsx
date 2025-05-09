// components/ScriptModal.tsx
import { Dialog } from "@headlessui/react"
import { Fragment, useState } from "react"
import { X, Copy, Check, ChevronDown, ChevronUp } from "lucide-react"

export default function ScriptModal({ 
  isOpen, 
  onClose, 
  scriptType, 
  clientName,
  script 
}: {
  isOpen: boolean
  onClose: () => void
  scriptType: "email" | "call"
  clientName?: string
  script: string
}) {
  const [isCopied, setIsCopied] = useState(false)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    talking_points: true,
    script: false
  })

  // Parse script into more structured format - dynamically extract talking points from the script
  const formatScript = (rawScript: string) => {
    // Default categories we want to extract
    const categories = {
      intro: {
        title: "Introduction & Context",
        patterns: ["introduction", "hi", "hello", "calling from", "reaching out", "contact information", "noticed that you"],
        points: []
      },
      history: {
        title: "Client History & Context",
        patterns: ["last time", "previously", "mentioned", "contact log", "your history", "when you joined", "your account", "your membership", "your recent", "your previous"],
        points: []
      },
      valueProps: {
        title: "Value Proposition",
        patterns: ["theory fitness", "community", "not just a gym", "we offer", "benefits", "value", "our unique", "approach", "heart-rate", "monitored", "measurable results", "trainers"],
        points: []
      },
      personalNote: {
        title: "Personalization Points",
        patterns: ["specifically for you", "noticed you're interested", "based on your", "thought you might", "your goals", "fitness journey", "your schedule", "your workout", "your preferences"],
        points: []
      },
      action: {
        title: "Call-to-Action",
        patterns: ["schedule", "invite you", "session", "visit", "complimentary", "introductory", "book", "available times", "sign up", "next steps", "call back", "would you like"],
        points: []
      }
    };
    
    // Split the script into lines and remove empty ones
    const lines = rawScript.split(/\r?\n/)
      .map(line => line.trim())
      .filter(line => line.length > 0);
    
    // For each line, check which category it belongs to
    lines.forEach(line => {
      for (const [key, category] of Object.entries(categories)) {
        // See if the line matches any of the patterns for this category
        const matchesPattern = category.patterns.some(pattern => 
          line.toLowerCase().includes(pattern.toLowerCase())
        );
        
        if (matchesPattern) {
          // Clean up the line to make it a good bullet point
          let point = line;
          
          // Remove common spoken transitions
          point = point.replace(/^\s*[\\r\\n]+|[\\r\\n]+\s*$/g, ""); // Remove newlines at start/end
          point = point.replace(/^(um|uh|so|and|but|also|now),?\s*/i, ""); // Remove filler words
          point = point.replace(/\\n\\n/g, " "); // Replace double newlines with spaces
          
          // Make sure first letter is uppercase
          if (point.length > 0) {
            point = point.charAt(0).toUpperCase() + point.slice(1);
          }
          
          // Add the point if we haven't already
          if (!category.points.includes(point) && point.length > 15) { // Only add substantial points
            category.points.push(point);
          }
          
          break; // Once we've categorized this line, move to the next one
        }
      }
    });
    
    // Prepare client-specific information
    const clientSpecificNotes = {
      category: "Client Information",
      points: [
        `Client Name: ${clientName || "N/A"}`,
        "Membership Type: Orange 60 - Tornado"
      ]
    };
    
    // If script mentions specific attributes, extract them
    if (rawScript.toLowerCase().includes("fitness goals")) {
      const goalMatch = rawScript.match(/fitness goals[:\s]+(.*?)[\.\n]/i);
      if (goalMatch && goalMatch[1]) {
        clientSpecificNotes.points.push(`Fitness Goals: ${goalMatch[1].trim()}`);
      }
    }
    
    // Compile the final talking points - filter out categories with no points
    const talkingPoints = [
      clientSpecificNotes,
      ...Object.values(categories)
        .filter(category => category.points.length > 0)
        .map(category => ({
          category: category.title,
          points: category.points.slice(0, 4) // Limit to 4 points per category to keep it manageable
        }))
    ];
    
    return {
      talkingPoints,
      fullScript: rawScript
    };
  };

  const { talkingPoints, fullScript } = formatScript(script);

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(script)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000) // Reset after 2 seconds
  }

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  }

  return (
    <Dialog as={Fragment} open={isOpen} onClose={onClose}>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <Dialog.Panel className="bg-white rounded-lg shadow-lg w-full max-w-3xl p-0 relative max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header with title */}
          <div className="p-4 bg-orange-50 border-b border-orange-100 flex justify-between items-center sticky top-0">
            <Dialog.Title className="text-xl font-semibold text-gray-900">
              {scriptType === "email" ? "Email" : "Call"} Script {clientName ? `for ${clientName}` : ""}
            </Dialog.Title>
            <button 
              onClick={onClose} 
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
          </div>
          
          {/* Main content with scrollable area */}
          <div className="overflow-y-auto p-5 flex-grow">
            {/* Talking Points Section - Always visible at the top */}
            <div className="mb-5">
              <div 
                className="flex items-center justify-between cursor-pointer bg-gray-50 p-3 rounded-t-lg border border-gray-200"
                onClick={() => toggleSection('talking_points')}
              >
                <h3 className="font-medium text-lg text-gray-800">Key Talking Points</h3>
                {expandedSections.talking_points ? 
                  <ChevronUp className="h-5 w-5 text-gray-500" /> : 
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                }
              </div>
              
              {expandedSections.talking_points && (
                <div className="bg-white p-4 rounded-b-lg border-x border-b border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {talkingPoints.map((section, idx) => (
                      <div key={idx} className="bg-gray-50 p-3 rounded-lg">
                        <h4 className="font-medium text-orange-700 mb-2">{section.category}</h4>
                        <ul className="list-disc pl-5 space-y-1">
                          {section.points.map((point, pointIdx) => (
                            <li key={pointIdx} className="text-sm text-gray-700">{point}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Full Script Section */}
            <div className="mb-3">
              <div 
                className="flex items-center justify-between cursor-pointer bg-gray-50 p-3 rounded-t-lg border border-gray-200"
                onClick={() => toggleSection('script')}
              >
                <h3 className="font-medium text-lg text-gray-800">Full Script</h3>
                {expandedSections.script ? 
                  <ChevronUp className="h-5 w-5 text-gray-500" /> : 
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                }
              </div>
              
              {expandedSections.script && (
                <div className="bg-white p-4 rounded-b-lg border-x border-b border-gray-200">
                  <div className="bg-gray-50 p-4 rounded-md whitespace-pre-wrap text-sm leading-relaxed">
                    {fullScript}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Footer with actions */}
          <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end">
            <button
              onClick={handleCopyToClipboard}
              className="bg-orange-100 text-orange-700 px-4 py-2 rounded-md hover:bg-orange-200 transition-colors flex items-center gap-2"
            >
              {isCopied ? (
                <>
                  <Check className="h-4 w-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy Full Script
                </>
              )}
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  )
}