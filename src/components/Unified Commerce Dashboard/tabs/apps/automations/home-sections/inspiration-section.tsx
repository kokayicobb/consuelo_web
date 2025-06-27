// InspirationSection component with functional buttons
import React from "react";
import {
  UserPlus,
  Heart,
  Bot,
  Zap,
  ChevronRight,
  TrendingUp,
  Layout
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface InspirationSectionProps {
  handleCreateAutomation: () => void;
  handleUseTemplate: (template: any) => void;
  setActiveTab: (tab: string) => void;
}

function InspirationSection({ 
  handleCreateAutomation, 
  handleUseTemplate, 
  setActiveTab 
}: InspirationSectionProps) {
  // Community templates for the section
  const communityTemplates = [
    {
      id: "ct1",
      name: "Social Media Lead Cohort Automation",
      description: "Automatically group and engage leads from LinkedIn and Twitter",
      category: "Lead Generation",
      apps: ["LinkedIn", "Twitter", "CRM"],
      icon: "UserPlus",
      popular: true,
      aiPowered: true,
      estimatedTime: "7 min",
      useCase: "Organize social leads into targeted cohorts",
      triggerType: "webhook",
      actions: ["cohort_assign", "email", "crm_update"],
    },
    {
      id: "ct2",
      name: "Client Retention Cohort Analyzer",
      description: "Identify at-risk clients and trigger personalized AI outreach",
      category: "Client Retention",
      apps: ["CRM", "Analytics", "Email"],
      icon: "Heart",
      popular: false,
      aiPowered: true,
      estimatedTime: "5 min",
      useCase: "Prevent churn with targeted retention campaigns",
      triggerType: "schedule",
      actions: ["analytics_check", "cohort_assign", "email"],
    },
    {
      id: "ct3",
      name: "AI Sales Agent Deployment",
      description: "Deploy AI agents that understand your brand voice and client history",
      category: "Sales Automation",
      apps: ["CRM", "AI", "Chat"],
      icon: "Bot",
      popular: true,
      aiPowered: true,
      estimatedTime: "10 min",
      useCase: "Increase conversion with personalized AI interactions",
      triggerType: "webhook",
      actions: ["ai_response", "crm_update", "notification"],
    },
  ];

  // Function to get the icon component
  const getIconComponent = (iconName: string) => {
    const icons: { [key: string]: any } = {
      UserPlus,
      Heart,
      Bot,
      Zap,
      TrendingUp,
      Layout
    };
    return icons[iconName] || Zap;
  };

  // Navigate to templates tab
  const navigateToTemplates = () => {
    setActiveTab("templates");
  };

  return (
    <div className="space-y-8 my-8">
      {/* Featured Guides Section - similar to Zapier's left column */}
      <div className="rounded-xl border border-neutral-200 bg-white p-8 shadow-sm">
        <h2 className="mb-6 text-xl font-semibold text-neutral-900">
          Automation inspiration
        </h2>
        
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* First Guide */}
          <div 
            className="relative rounded-lg border border-neutral-200 overflow-hidden group cursor-pointer"
            onClick={handleCreateAutomation}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/20 z-10"></div>
            <img 
              src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80" 
              alt="Using Salesforce with Consuelo" 
              className="w-full h-48 object-cover transition-transform group-hover:scale-105"
            />
            <div className="absolute bottom-0 left-0 p-4 z-20">
              <span className="text-xs font-medium text-blue-300 mb-1 block">INTEGRATIONS</span>
              <h3 className="text-white font-medium mb-2">Using Salesforce with Consuelo</h3>
              <p className="text-white/80 text-sm">Connect your Salesforce data to supercharge your AI-native CRM</p>
            </div>
          </div>
          
          {/* Second Guide */}
          <div 
            className="relative rounded-lg border border-neutral-200 overflow-hidden group cursor-pointer"
            onClick={handleCreateAutomation}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/20 z-10"></div>
            <img 
              src="https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80" 
              alt="Automated AI Messaging Campaigns" 
              className="w-full h-48 object-cover transition-transform group-hover:scale-105"
            />
            <div className="absolute bottom-0 left-0 p-4 z-20">
              <span className="text-xs font-medium text-blue-300 mb-1 block">OUTREACH</span>
              <h3 className="text-white font-medium mb-2">Automated AI Messaging Campaigns</h3>
              <p className="text-white/80 text-sm">Create personalized messaging using AI sales agents that know your business</p>
            </div>
          </div>
          
          {/* Third Guide */}
          <div 
            className="relative rounded-lg border border-neutral-200 overflow-hidden group cursor-pointer"
            onClick={handleCreateAutomation}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/20 z-10"></div>
            <img 
              src="https://images.unsplash.com/photo-1553877522-43269d4ea984?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80" 
              alt="Getting Started with Consuelo" 
              className="w-full h-48 object-cover transition-transform group-hover:scale-105"
            />
            <div className="absolute bottom-0 left-0 p-4 z-20">
              <span className="text-xs font-medium text-blue-300 mb-1 block">BEGINNER</span>
              <h3 className="text-white font-medium mb-2">Getting Started with Consuelo</h3>
              <p className="text-white/80 text-sm">Learn the basics of automating your workflow with our AI-native CRM</p>
            </div>
          </div>
        </div>
      </div>

      {/* From the Community Section - replacing "Unfinished Zaps" */}
      <div className="rounded-xl border border-neutral-200 bg-white shadow-sm">
        <div className="border-b border-neutral-200 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-neutral-900">
              From the Community
            </h2>
            <button 
              onClick={navigateToTemplates}
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              View all templates
            </button>
          </div>
        </div>

        <div className="divide-y divide-neutral-200">
          {/* Template 1 */}
          {communityTemplates.map((template) => {
            const Icon = getIconComponent(template.icon);
            return (
							<div 
							key={template.id} 
							className="p-6 transition-colors hover:bg-neutral-50 cursor-pointer" 
							onClick={() => handleUseTemplate(template)}
						>
                <div className="flex items-center justify-between">
                  <div className="flex flex-grow cursor-pointer items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                      <Icon className="h-5 w-5 text-slate-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-neutral-900">
                        {template.name}
                      </h3>
                      <p className="mt-1 text-sm text-neutral-600">
                        {template.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {template.popular && (
                      <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
                        Popular
                      </span>
                    )}
                    {template.aiPowered && (
                      <div className="flex items-center gap-1">
                        <img
                          src="/apple-touch-icon.png"
                          alt="Company Logo"
                          className="h-3 w-3"
                        />
                        <span className="text-xs font-medium text-slate-600">
                          AI
                        </span>
                      </div>
                    )}
                    <span className="text-sm text-neutral-500">
                      {template.estimatedTime}
                    </span>
                    <button 
                      onClick={() => handleUseTemplate(template)}
                      className="text-sm font-medium text-blue-600 hover:text-blue-700"
                    >
                      Use template
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default InspirationSection;