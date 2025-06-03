import React, { useState, useEffect } from 'react';
import { Plus, Save, Send, PlayCircle, XCircle, Edit3 } from 'lucide-react'; // Added more icons

// Props this component might expect:
// - isBuilding: boolean
// - setIsBuilding: function
// - initialAutomationName: string | null (the name from DB, or null for new)
// - onSave: function(name: string, type: 'draft' | 'publish') -> This would typically show the save modal
// - onCancel: function
// - onTest: function
// - onStartNewAutomation: function

// For the sake of this example, let's define how onSave might work with setShowSaveModal
// In your parent component, you'd have something like:
// const [showSaveModal, setShowSaveModal] = useState(false);
// const [nameToSave, setNameToSave] = useState('');
// const [saveType, setSaveType] = useState('draft');

// const handleSaveTrigger = (name, type) => {
//   setNameToSave(name);
//   setSaveType(type);
//   setShowSaveModal(true);
// };
// And your modal would use nameToSave and saveType

export default function AutomationHeader({
  isBuilding,
  setIsBuilding, // To control the building state
  initialAutomationName, // Name loaded from DB or "New Automation" for new
  setShowSaveModal, // To trigger the save modal
  setAutomationNameForSave, // A function to set the name that the modal will use
  setShowTemplates, // From your original code
  startBlankAutomation, // From your original code
  // You might want more specific handlers from the parent:
  // onTestClick,
}) {
  const [editableTitle, setEditableTitle] = useState("New Automation");
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  useEffect(() => {
    if (isBuilding) {
      // When entering building mode, set the title
      // If it's a truly new automation, startBlankAutomation should have set initialAutomationName to "New Automation"
      // or if initialAutomationName is provided (e.g. loading an existing draft)
      setEditableTitle(initialAutomationName || "New Automation");
      setIsEditingTitle(false); // Start in non-editing display mode for the title
    }
  }, [isBuilding, initialAutomationName]);

  const handleTitleChange = (e) => {
    setEditableTitle(e.target.value);
  };

  const handleTitleBlur = () => {
    setIsEditingTitle(false);
    if (!editableTitle.trim()) {
      setEditableTitle("Untitled Automation"); // Fallback if empty
    }
    // Here you might want to auto-save the title change as a draft immediately
    // or simply let the main "Save Draft" / "Publish" buttons handle it.
  };

  const handleTitleClick = () => {
    setIsEditingTitle(true);
  };
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === 'Escape') {
      e.preventDefault(); // Prevent form submission if it's in a form
      setIsEditingTitle(false);
      if (!editableTitle.trim()) {
        setEditableTitle("Untitled Automation");
      }
      e.target.blur(); // Remove focus from input
    }
  };

  const handleSaveAction = (type) => {
    // Pass the current editableTitle to the parent to be used by the modal
    if (setAutomationNameForSave) {
      setAutomationNameForSave(editableTitle);
    }
    setShowSaveModal(true);
    // You might also want to pass 'type' ('draft' or 'publish') to the modal
    // For example, by setting another state in the parent that the modal reads.
    console.log(`Action: ${type} for automation: ${editableTitle}`);
  };

  const handleCancelBuilding = () => {
    setIsBuilding(false);
    if (setShowTemplates) setShowTemplates(true); // Go back to templates view or dashboard
  };

  const handleTest = () => {
    alert(`Testing: ${editableTitle}`);
    // if (onTestClick) onTestClick(editableTitle);
  };

  return (
    <div className="bg-white border-b px-6 py-4 sticky top-0 z-10">
      <div className="flex justify-between items-center">
        {/* Left Side */}
        <div className="flex items-center">
          {isBuilding ? (
            <div className="flex items-center group">
              {isEditingTitle ? (
                <input
                  type="text"
                  value={editableTitle}
                  onChange={handleTitleChange}
                  onBlur={handleTitleBlur}
                  onKeyDown={handleKeyDown}
                  className="text-xl font-semibold text-gray-900 bg-transparent border-b-2 border-sky-500 focus:outline-none focus:ring-0 p-0"
                  autoFocus
                  onFocus={(e) => e.target.select()}
                />
              ) : (
                <div onClick={handleTitleClick} className="flex items-center cursor-pointer p-1 -ml-1 rounded hover:bg-gray-100">
                  <h1 className="text-xl font-semibold text-gray-900 mr-2">
                    {editableTitle}
                  </h1>
                  <Edit3 size={16} className="text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              )}
            </div>
          ) : (
            <h1 className="text-xl font-semibold text-gray-900">Automations</h1>
          )}
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-3">
          {isBuilding ? (
            <>
              <button
                onClick={handleCancelBuilding}
                className="px-3 py-1.5 border border-gray-300 rounded-md text-gray-700 text-sm hover:bg-gray-100 flex items-center gap-1.5"
              >
                <XCircle size={16} /> Cancel
              </button>
              <button
                onClick={() => handleSaveAction('draft')}
                className="px-3 py-1.5 border border-gray-300 rounded-md text-gray-700 text-sm hover:bg-gray-100 flex items-center gap-1.5"
              >
                <Save size={16} /> Save Draft
              </button>
              <button
                onClick={handleTest}
                className="px-3 py-1.5 border border-sky-500 text-sky-600 rounded-md text-sm hover:bg-sky-50 flex items-center gap-1.5"
              >
                <PlayCircle size={16} /> Test
              </button>
              <button
                onClick={() => handleSaveAction('publish')}
                className="px-3 py-1.5 bg-sky-600 text-white rounded-md text-sm hover:bg-sky-700 flex items-center gap-1.5"
              >
                <Send size={16} /> Publish
              </button>
            </>
          ) : (
            <button
              onClick={() => {
                // When starting a blank automation, explicitly set its initial name
                // The parent component's startBlankAutomation should handle setting isBuilding=true
                // and potentially setting a default name state that gets passed as initialAutomationName
                if (startBlankAutomation) startBlankAutomation("New Automation");
              }}
              className="px-3 py-1.5 bg-sky-600 text-white rounded-md text-sm hover:bg-sky-700 flex items-center"
            >
              <Plus size={16} className="mr-2" /> New Automation
            </button>
          )}
        </div>
      </div>
    </div>
  );
}