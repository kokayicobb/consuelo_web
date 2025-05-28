"use client"
import React from 'react';

const InventoryStatus = () => {
  const inventoryItems = [
    { label: 'Low Stock Items', count: 12, color: 'bg-red-500' },
    { label: 'Moderate Stock Items', count: 45, color: 'bg-yellow-500' },
    { label: 'Healthy Stock Items', count: 87, color: 'bg-green-500' },
    { label: 'Overstock Items', count: 23, color: 'bg-gray-500' },
  ];

  return (
    <div className="bg-white rounded-lg shadow p-5">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-gray-800">Inventory Status</h3>
        <button className="text-sm text-indigo-600 font-medium">Full Report</button>
      </div>
      <div className="space-y-3">
        {inventoryItems.map((item, index) => (
          <div key={index} className="flex justify-between items-center">
            <div className="flex items-center">
              <div className={`w-2 h-2 ${item.color} rounded-full mr-2`}></div>
              <span className="text-sm text-gray-700">{item.label}</span>
            </div>
            <span className="text-sm font-medium">{item.count} items</span>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-4 border-t">
        <div className="flex justify-between mb-1">
          <span className="text-sm font-medium text-gray-700">Average Days of Stock</span>
          <span className="text-sm font-medium text-gray-900">42 days</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-green-500 h-2 rounded-full" style={{ width: '65%' }}></div>
        </div>
      </div>
    </div>
  );
};

export default InventoryStatus;
