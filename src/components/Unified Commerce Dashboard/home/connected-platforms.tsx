// File: components/dashboard/ConnectedPlatforms.jsx
"use client"
import React from 'react';

const ConnectedPlatforms = () => {
  const platforms = [
    {
      name: 'Shopify',
      icon: '🛍️',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-600',
      status: 'Connected',
      statusColor: 'bg-green-500'
    },
    {
      name: 'TikTok Shop',
      icon: '📱',
      bgColor: 'bg-pink-100',
      textColor: 'text-pink-600',
      status: 'API Update Required',
      statusColor: 'bg-yellow-500'
    },
    {
      name: 'Klaviyo',
      icon: '📧',
      bgColor: 'bg-purple-100',
      textColor: 'text-purple-600',
      status: 'Connected',
      statusColor: 'bg-green-500'
    },
    {
      name: 'Facebook Ads',
      icon: '📊',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-600',
      status: 'Connected',
      statusColor: 'bg-green-500'
    }
  ];

  return (
    <div className="mt-6 bg-white rounded-lg shadow p-5">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-gray-800">Connected Platforms</h3>
        <button className="text-sm text-indigo-600 font-medium">Add Integration</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {platforms.map((platform, index) => (
          <div key={index} className="border rounded-lg p-4 flex items-center">
            <div className={`w-10 h-10 ${platform.bgColor} rounded-full flex items-center justify-center mr-3`}>
              <span className={`${platform.textColor} text-lg`}>{platform.icon}</span>
            </div>
            <div>
              <div className="font-medium text-gray-800">{platform.name}</div>
              <div className="flex items-center">
                <div className={`w-2 h-2 ${platform.statusColor} rounded-full mr-2`}></div>
                <span className="text-xs text-gray-500">{platform.status}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConnectedPlatforms;