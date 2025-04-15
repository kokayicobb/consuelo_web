// File: components/layout/Header.jsx
"use client";

import React from 'react';
import { Search, Bell, HelpCircle } from 'lucide-react';

const Header = ({ title }) => {
  return (
    <header className="bg-background border-b border-border">
      <div className="flex justify-between items-center px-6 py-4">
        <div className="flex items-center">
          <h1 className="text-xl font-semibold text-foreground">{title}</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
              <Search size={18} className="text-muted-foreground" />
            </span>
            <input 
              className="pl-10 pr-4 py-2 border rounded-md bg-background border-input focus:ring-ring focus:border-ring sm:text-sm" 
              type="text" 
              placeholder="Search all..." 
            />
          </div>
          
          <button className="relative p-2 text-muted-foreground rounded-full hover:text-foreground hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring">
            <span className="sr-only">Notifications</span>
            <Bell size={20} />
            <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-destructive"></span>
          </button>
          
          <button className="p-2 text-muted-foreground rounded-full hover:text-foreground hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring">
            <span className="sr-only">Help</span>
            <HelpCircle size={20} />
          </button>
          
          <div className="hidden md:flex items-center border-l pl-4 ml-4 border-border">
            <button className="flex items-center text-sm font-medium rounded-md text-foreground hover:text-accent focus:outline-none focus:ring-2 focus:ring-ring">
              <span className="mr-1">Quick Actions</span>
              <svg className="h-5 w-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Optional: Breadcrumbs or secondary navigation */}
      <div className="px-6 py-2 border-t border-border">
        <nav className="flex" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2 text-sm text-muted-foreground">
            <li>
              <a href="#" className="hover:text-foreground">Home</a>
            </li>
            <li className="flex items-center">
              <svg className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <span className="ml-2 text-foreground font-medium">{title}</span>
            </li>
          </ol>
        </nav>
      </div>
    </header>
  );
};

export default Header;