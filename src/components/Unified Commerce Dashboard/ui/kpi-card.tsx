// File: components/dashboard/KpiCard.jsx
import React from 'react';

const KpiCard = ({ title, value, change, icon, color }) => {
  const isPositive = change > 0;
  const colors = {
    indigo: {
      bg: 'bg-indigo-100',
      text: 'text-indigo-600'
    },
    green: {
      bg: 'bg-green-100',
      text: 'text-green-600'
    },
    yellow: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-600'
    },
    purple: {
      bg: 'bg-purple-100',
      text: 'text-purple-600'
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow p-5">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-gray-500 text-sm">{title}</div>
          <div className="text-2xl font-bold text-gray-800">{value}</div>
          <div className={`${isPositive ? 'text-green-500' : 'text-red-500'} text-sm font-semibold`}>
            {isPositive ? '+' : ''}{change}% vs last period
          </div>
        </div>
        <div className={`${colors[color].bg} p-3 rounded-md`}>
          <span className={colors[color].text}>{icon}</span>
        </div>
      </div>
    </div>
  );
};

export default KpiCard;
