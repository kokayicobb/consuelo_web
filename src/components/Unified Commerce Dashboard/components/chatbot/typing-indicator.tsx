import React from 'react';

const TypingIndicator: React.FC = () => {
  return (
    <div className="flex items-center space-x-2 p-2">
      <div className="w-4 h-4 rounded-full border-2 border-gray-300 border-t-gray-500 animate-spin"></div>
      <span className="text-gray-500 text-sm">thinking</span>
    </div>
  );
};

export default TypingIndicator;