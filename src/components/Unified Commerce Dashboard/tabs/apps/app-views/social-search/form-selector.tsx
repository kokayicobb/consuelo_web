import React, { useState } from "react";
import {
  Search,
  Users,
  Facebook,
  Globe,
  ChevronLeft,
  ArrowRight,
} from "lucide-react";
import {
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
  ChatBubbleLeftIcon,
  EllipsisHorizontalIcon,
  StarIcon,
  ChevronDoubleRightIcon,
  ChevronDoubleLeftIcon
} from '@heroicons/react/24/outline'
import FacebookGroupsSearch from "./facebook-group-search";
import RedditSearch from "./reddit";
import LeadScraperDashboard from "../scraper/lead-scraper-dashboard";

const FormSelector = ({ onClose, isFullScreen, setIsFullScreen }) => {
  const [selectedForm, setSelectedForm] = useState<"none" | "facebook-group" | "social">("none");
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleFormSelect = (form: "facebook-group" | "social") => {
    setIsTransitioning(true);
    setTimeout(() => {
      setSelectedForm(form);
      setIsTransitioning(false);
    }, 200);
  };

  const handleBack = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setSelectedForm("none");
      setIsTransitioning(false);
    }, 200);
  };

  // Temporary component definitions to match the drawer style
  const Button = ({ children, variant = "default", size = "md", className = "", ...props }) => (
    <button 
      className={`rounded-md font-medium transition-colors ${
        variant === "ghost" 
          ? "hover:bg-gray-100 text-gray-700" 
          : variant === "default"
          ? "hover:bg-gray-100 text-gray-700"
          : "bg-gray-900 text-white hover:bg-gray-800"
      } ${
        size === "sm" ? "px-3 py-1.5 text-sm" : "px-4 py-2"
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  )

  const forms = [
    {
      id: "facebook-group",
      title: "Facebook Groups",
      description: "Find and analyze content across specific groups",
      icon: <Facebook className="h-8 w-8" />,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      id: "social",
      title: "Reddit",
      description: "Discover opportunities across multiple platforms",
      icon: <Globe className="h-8 w-8" />,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main content area with animation */}
      <div className={`transition-all duration-200 ease-in-out ${
        isTransitioning ? "opacity-0 transform scale-95" : "opacity-100 transform scale-100"
      }`}>
        {selectedForm === "none" ? (
          // Form selector view - centered with constraints
          <div className="flex items-start justify-center p-4">
            <div className="w-full max-w-4xl">
              <div className="text-center mb-12">
                <h1 className="text-4xl font-semibold text-gray-900 mb-4">
                  Choose Your Platform
                </h1>
                <p className="text-lg text-gray-600">
                  Select the search platform you'd like to use
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {forms.map((form) => (
                  <div
                    key={form.id}
                    className="bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-all duration-200 hover:shadow-lg cursor-pointer group"
                    onClick={() => handleFormSelect(form.id as "facebook-group" | "social")}
                  >
                    <div className="p-8">
                      <div className={`inline-flex items-center justify-center w-16 h-16 rounded-lg ${form.bgColor} ${form.color} mb-6`}>
                        {form.icon}
                      </div>
                      
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">
                        {form.title}
                      </h3>
                      
                      <p className="text-gray-600 mb-6">
                        {form.description}
                      </p>
                      
                      <button 
                        className="w-full px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 font-medium"
                      >
                        Open Tool
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-12 text-center">
                <p className="text-sm text-gray-500">
                  More tools coming soon
                </p>
              </div>
            </div>
          </div>
        ) : (
          // Selected form view
          <div>
            {/* Back button above main content */}
            <div className="mb-4">
              <button
                onClick={handleBack}
                className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
                Back to Platform Selection
              </button>
            </div>
            
            {/* Main content */}
            <div>
              {selectedForm === "facebook-group" && <FacebookGroupsSearch />}
              {selectedForm === "social" && <RedditSearch />}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FormSelector;