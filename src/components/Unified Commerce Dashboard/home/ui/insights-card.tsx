// File: components/dashboard/AiInsightCard.jsx
import React from 'react';

const AiInsightCard = ({ title, description, primaryAction, secondaryAction }) => {
  return (
    <div className="bg-white bg-opacity-20 p-4 rounded-lg">
      <h3 className="font-semibold mb-2">{title}</h3>
      <p className="text-sm mb-3">{description}</p>
      <div className="flex">
        <button className="bg-white text-indigo-700 text-xs px-3 py-1 rounded-md font-medium">
          {primaryAction}
        </button>
        <button className="ml-2 bg-transparent border border-white text-white text-xs px-3 py-1 rounded-md font-medium">
          {secondaryAction}
        </button>
      </div>
    </div>
  );
};

export default AiInsightCard;
