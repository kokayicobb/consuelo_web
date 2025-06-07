// src/components/SidePanel.jsx
import React from 'react';
import { ChevronLeft, Maximize, Minimize } from 'lucide-react';

export function SidePanel({
  isOpen,
  onClose,
  children,
  title = "Details",
  isFullScreen,
  onToggleFullScreen
}) {
  return (
    <>
      <div
        className={`fixed top-0 right-0 h-full shadow-xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col
          bg-slate-50 
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
          ${isFullScreen ? 'w-full' : 'w-full md:w-1/2'} 
        `}
        aria-modal="true"
        role="dialog"
        aria-labelledby="side-panel-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white bg-white flex-shrink-0 shadow-none">
          <div className="flex items-center">
            <button
              onClick={onClose}
              className="p-2 rounded-md hover:bg-slate-100 transition-colors duration-200 focus:outline-none" // Removed focus:ring-2 focus:ring-blue-500
              aria-label="Close Panel"
            >
              <ChevronLeft className="h-5 w-5 text-slate-600" />
            </button>
            <h2 id="side-panel-title" className="text-lg font-semibold ml-2 text-slate-800">{title}</h2>
          </div>
          
          <button
            onClick={onToggleFullScreen}
            className="p-2 rounded-md hover:bg-slate-100 transition-colors duration-200 focus:outline-none" // Removed focus:ring-2 focus:ring-blue-500
            aria-label={isFullScreen ? "Exit Full Screen" : "Enter Full Screen"}
          >
            {isFullScreen ? (
              <Minimize className="h-5 w-5 text-slate-600" />
            ) : (
              <Maximize className="h-5 w-5 text-slate-600" />
            )}
          </button>
        </div>

        {/* Content Area */}
        <div className={`overflow-y-auto flex-grow bg-white shadow-none ${isFullScreen ? '' : 'p-4 md:p-6'}`}>
          {children}
        </div>
      </div>
    </>
  );
}