import React from 'react';
import {
  RoleplayTip,
  ViewType
} from '../types';

interface TipsViewProps {
  recentTips: RoleplayTip[];
  loading: boolean;
  onNavigateBack: () => void;
  onChangeView: (view: ViewType) => void;
}

export const TipsView: React.FC<TipsViewProps> = ({
  recentTips,
  loading,
  onNavigateBack,
  onChangeView
}) => {
  return (
    <>
      <div className="flex items-center border-b border-gray-200 dark:border-gray-700 px-3">
        <button
          onClick={onNavigateBack}
          className="mr-2 p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded text-white dark:text-gray-100"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex h-14 w-full items-center py-4 text-base font-medium text-white dark:text-gray-100">
          Recent Tips
          {loading && <span className="ml-2 text-sm text-white/70 dark:text-gray-300">Loading...</span>}
        </div>
      </div>
      <div className="max-h-96 overflow-y-auto p-3">
        {recentTips.length === 0 && !loading ? (
          <div className="py-6 text-center text-sm text-white/70 dark:text-gray-300">
            No recent tips found.
          </div>
        ) : (
          <div className="space-y-4">
            {recentTips.map((tip) => (
              <div key={tip.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white/10 dark:bg-gray-800/50">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-white dark:text-gray-100 text-sm">
                    {tip.title}
                  </h3>
                  <div className="flex items-center space-x-2">
                    <span className={`
                      px-2 py-1 rounded text-xs font-medium
                      ${tip.category === 'objection_handling' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                        tip.category === 'rapport_building' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                        tip.category === 'closing' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                        tip.category === 'discovery' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                        'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'}
                    `}>
                      {tip.category.replace('_', ' ')}
                    </span>
                    <span className={`
                      px-2 py-1 rounded text-xs font-medium
                      ${tip.difficulty_level === 'beginner' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                        tip.difficulty_level === 'intermediate' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                        'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}
                    `}>
                      {tip.difficulty_level}
                    </span>
                  </div>
                </div>
                
                <p className="text-sm text-white/90 dark:text-gray-100 leading-relaxed mb-3">
                  {tip.content}
                </p>
                
                {tip.techniques.length > 0 && (
                  <div className="mb-3">
                    <h4 className="font-medium text-white dark:text-gray-100 text-xs mb-2">Techniques:</h4>
                    <ul className="space-y-1">
                      {tip.techniques.slice(0, 2).map((technique, index) => (
                        <li key={index} className="text-sm text-white/90 dark:text-gray-100 leading-relaxed">
                          • {technique}
                        </li>
                      ))}
                      {tip.techniques.length > 2 && (
                        <li className="text-xs text-white/60 dark:text-gray-400 italic">
                          +{tip.techniques.length - 2} more techniques...
                        </li>
                      )}
                    </ul>
                  </div>
                )}
                
                {tip.practice_scenarios.length > 0 && (
                  <div>
                    <h4 className="font-medium text-white dark:text-gray-100 text-xs mb-2">Practice In:</h4>
                    <div className="flex flex-wrap gap-1">
                      {tip.practice_scenarios.slice(0, 3).map((scenario, index) => (
                        <span key={index} className="text-xs bg-white/20 dark:bg-gray-700 px-2 py-1 rounded text-white/80 dark:text-gray-300">
                          {scenario}
                        </span>
                      ))}
                      {tip.practice_scenarios.length > 3 && (
                        <span className="text-xs text-white/60 dark:text-gray-400">
                          +{tip.practice_scenarios.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};