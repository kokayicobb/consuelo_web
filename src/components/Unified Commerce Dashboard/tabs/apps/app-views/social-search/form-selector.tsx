import React, { useState } from "react";
import {
  Search,
  Users,
  Facebook,
  Globe,
  ChevronLeft,
  ArrowRight,
} from "lucide-react";
import FacebookGroupsSearch from "./facebook-group-search";
import OrangeSalesAgent from "./reddit-search";

const FormSelector = () => {
  const [selectedForm, setSelectedForm] = useState<"none" | "facebook" | "social">("none");
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleFormSelect = (form: "facebook" | "social") => {
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



  const forms = [
    {
      id: "facebook",
      title: "Facebook",
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
		<div className="min-h-screen bg-gray-50 flex items-start justify-center p-4">
      {/* Header with back button */}
      {selectedForm !== "none" && (
        <div className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center h-16">
              <button
                onClick={handleBack}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
                Back
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main content area with animation */}
      <div className={`transition-all duration-200 ease-in-out ${
        isTransitioning ? "opacity-0 transform scale-95" : "opacity-100 transform scale-100"
      }`}>
        {selectedForm === "none" ? (
          // Form selector view
					<div>
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
                    onClick={() => handleFormSelect(form.id as "facebook" | "social")}
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
          // Selected form view with padding for fixed header
          <div className="pt-16">
            {selectedForm === "facebook" && <FacebookGroupsSearch />}
            {selectedForm === "social" && <OrangeSalesAgent />}
          </div>
        )}
      </div>
    </div>
  );
};

export default FormSelector;