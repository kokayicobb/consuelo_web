"use client"

// File: components/layout/Header.jsx
import React from 'react';
import { Search, Bell, HelpCircle } from 'lucide-react';

const Header = ({ title }) => {
  return (
    <header className="bg-white shadow-sm">
      <div className="flex justify-between items-center px-6 py-4">
        <div className="flex items-center">
          <h1 className="text-xl font-semibold text-gray-800">{title}</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
              <Search size={18} className="text-gray-400" />
            </span>
            <input 
              className="pl-10 pr-4 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" 
              type="text" 
              placeholder="Search all..." 
            />
          </div>
          
          <button className="relative p-2 text-gray-400 rounded-full hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <span className="sr-only">Notifications</span>
            <Bell size={20} />
            <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
          </button>
          
          <button className="p-2 text-gray-400 rounded-full hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <span className="sr-only">Help</span>
            <HelpCircle size={20} />
          </button>
          
          <div className="hidden md:flex items-center border-l pl-4 ml-4 border-gray-200">
            <button className="flex items-center text-sm font-medium rounded-md text-gray-700 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <span className="mr-1">Quick Actions</span>
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Optional: Breadcrumbs or secondary navigation */}
      <div className="px-6 py-2 border-t border-gray-200">
        <nav className="flex" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2 text-sm text-gray-500">
            <li>
              <a href="#" className="hover:text-gray-700">Home</a>
            </li>
            <li className="flex items-center">
              <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <span className="ml-2 text-gray-700 font-medium">{title}</span>
            </li>
          </ol>
        </nav>
      </div>
    </header>
  );
};

export default Header;