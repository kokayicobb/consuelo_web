"use client"
// File: components/dashboard/RecentActivity.jsx
import React from 'react';
import { CheckCircle, User, AlertTriangle, Bell } from 'lucide-react';

const RecentActivity = () => {
  const activities = [
    {
      icon: <CheckCircle size={16} />,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-500',
      title: 'New order #38295',
      time: '12 min ago via Shopify'
    },
    {
      icon: <User size={16} />,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-500',
      title: 'New customer sign-up',
      time: '27 min ago via website'
    },
    {
      icon: <AlertTriangle size={16} />,
      iconBg: 'bg-yellow-100',
      iconColor: 'text-yellow-500',
      title: 'Low inventory alert',
      time: '35 min ago - Summer Breeze dress'
    },
    {
      icon: <Bell size={16} />,
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-500',
      title: 'TikTok Shop integration alert',
      time: '1 hour ago - API updated'
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow p-5">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-gray-800">Recent Activity</h3>
        <button className="text-sm text-indigo-600 font-medium">View All</button>
      </div>
      <div className="space-y-4">
        {activities.map((activity, index) => (
          <div key={index} className="flex">
            <div className={`flex-shrink-0 w-8 h-8 ${activity.iconBg} ${activity.iconColor} rounded-full flex items-center justify-center`}>
              {activity.icon}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">{activity.title}</p>
              <p className="text-xs text-gray-500">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentActivity;
