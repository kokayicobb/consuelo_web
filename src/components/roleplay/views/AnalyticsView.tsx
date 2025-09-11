import React from 'react';
import {
  SessionAnalytics,
  Scenario,
  ViewType
} from '../types';

interface AnalyticsViewProps {
  analytics: SessionAnalytics[];
  scenarios: Scenario[];
  loading: boolean;
  selectedAnalytics: SessionAnalytics | null;
  onSelectAnalytics: (analytics: SessionAnalytics) => void;
  onNavigateBack: () => void;
  onChangeView: (view: ViewType) => void;
}

interface AnalyticsDetailViewProps {
  selectedAnalytics: SessionAnalytics;
  onNavigateBack: () => void;
}

// Analytics summary view component
const AnalyticsSummaryView: React.FC<Omit<AnalyticsViewProps, 'selectedAnalytics'>> = ({
  analytics,
  scenarios,
  loading,
  onNavigateBack,
  onSelectAnalytics,
  onChangeView
}) => (
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
        Performance Analytics
        {loading && <span className="ml-2 text-sm text-white/70 dark:text-gray-300">Loading...</span>}
      </div>
    </div>
    <div className="max-h-96 overflow-y-auto p-3">
      {analytics.length === 0 && !loading ? (
        <div className="py-6 text-center text-sm text-white/70 dark:text-gray-300">
          No analytics available. Complete some roleplay sessions to see your performance data.
        </div>
      ) : (
        <div className="space-y-3">
          {analytics.map((analyticsItem) => {
            const scenario = scenarios.find(s => s.id === analyticsItem.scenario_id);
            
            return (
              <div
                key={analyticsItem.id}
                className="
                  flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700
                  hover:bg-gray-200/30 dark:hover:bg-gray-600 cursor-pointer transition-colors
                "
                onClick={() => {
                  onSelectAnalytics(analyticsItem);
                  onChangeView('analytics_detail');
                }}
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 dark:bg-gray-700">
                      <svg className="h-5 w-5 text-white/70 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium text-white dark:text-gray-100">
                        {scenario?.title || 'Session Analysis'}
                      </span>
                      <div className="flex items-center space-x-2 text-xs text-white/70 dark:text-gray-300">
                        <span>Overall Score: {analyticsItem.overall_score}/10</span>
                        <span>•</span>
                        <span>{new Date(analyticsItem.created_at).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400 mt-1">
                        <span>Communication: {analyticsItem.communication_score}/10</span>
                        <span>•</span>
                        <span>Objection Handling: {analyticsItem.objection_handling_score}/10</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                      analyticsItem.overall_score >= 8 ? 'bg-green-500 text-white' :
                      analyticsItem.overall_score >= 6 ? 'bg-yellow-500 text-white' :
                      'bg-red-500 text-white'
                    }`}>
                      {analyticsItem.overall_score}
                    </div>
                    <span className="text-xs text-white/70 dark:text-gray-300 mt-1">Score</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  </>
);

// Analytics detail view component
const AnalyticsDetailView: React.FC<AnalyticsDetailViewProps> = ({
  selectedAnalytics,
  onNavigateBack
}) => (
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
        Session Analysis
      </div>
    </div>
    <div className="max-h-96 overflow-y-auto p-3">
      <div className="space-y-4">
        {/* Score Overview */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white/10 dark:bg-gray-800/50">
          <h3 className="font-semibold text-white dark:text-gray-100 text-sm mb-3">Performance Scores</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center">
              <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center font-bold ${
                selectedAnalytics.overall_score >= 8 ? 'bg-green-500 text-white' :
                selectedAnalytics.overall_score >= 6 ? 'bg-yellow-500 text-white' :
                'bg-red-500 text-white'
              }`}>
                {selectedAnalytics.overall_score}
              </div>
              <div className="text-xs text-white/70 dark:text-gray-300 mt-1">Overall</div>
            </div>
            <div className="text-center">
              <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center font-bold ${
                selectedAnalytics.communication_score >= 8 ? 'bg-green-500 text-white' :
                selectedAnalytics.communication_score >= 6 ? 'bg-yellow-500 text-white' :
                'bg-red-500 text-white'
              }`}>
                {selectedAnalytics.communication_score}
              </div>
              <div className="text-xs text-white/70 dark:text-gray-300 mt-1">Communication</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-3">
            <div className="text-center">
              <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center font-bold ${
                selectedAnalytics.objection_handling_score >= 8 ? 'bg-green-500 text-white' :
                selectedAnalytics.objection_handling_score >= 6 ? 'bg-yellow-500 text-white' :
                'bg-red-500 text-white'
              }`}>
                {selectedAnalytics.objection_handling_score}
              </div>
              <div className="text-xs text-white/70 dark:text-gray-300 mt-1">Objections</div>
            </div>
            <div className="text-center">
              <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center font-bold ${
                selectedAnalytics.rapport_building_score >= 8 ? 'bg-green-500 text-white' :
                selectedAnalytics.rapport_building_score >= 6 ? 'bg-yellow-500 text-white' :
                'bg-red-500 text-white'
              }`}>
                {selectedAnalytics.rapport_building_score}
              </div>
              <div className="text-xs text-white/70 dark:text-gray-300 mt-1">Rapport</div>
            </div>
          </div>
        </div>

        {/* Conversation Analysis */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white/10 dark:bg-gray-800/50">
          <h3 className="font-semibold text-white dark:text-gray-100 text-sm mb-2">Analysis Summary</h3>
          <p className="text-sm text-white/90 dark:text-gray-100 leading-relaxed">{selectedAnalytics.conversation_flow_analysis}</p>
        </div>

        {/* Strengths */}
        {selectedAnalytics.strengths.length > 0 && (
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white/10 dark:bg-gray-800/50">
            <h3 className="font-semibold text-white dark:text-gray-100 text-sm mb-2">Strengths</h3>
            <ul className="space-y-1">
              {selectedAnalytics.strengths.slice(0, 3).map((strength, index) => (
                <li key={index} className="text-sm text-white/90 dark:text-gray-100 leading-relaxed">
                  ✅ {strength}
                </li>
              ))}
              {selectedAnalytics.strengths.length > 3 && (
                <li className="text-xs text-white/60 dark:text-gray-400 italic">
                  +{selectedAnalytics.strengths.length - 3} more strengths...
                </li>
              )}
            </ul>
          </div>
        )}

        {/* Areas for Improvement */}
        {selectedAnalytics.areas_for_improvement.length > 0 && (
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white/10 dark:bg-gray-800/50">
            <h3 className="font-semibold text-white dark:text-gray-100 text-sm mb-2">Areas for Improvement</h3>
            <ul className="space-y-1">
              {selectedAnalytics.areas_for_improvement.slice(0, 3).map((area, index) => (
                <li key={index} className="text-sm text-white/90 dark:text-gray-100 leading-relaxed">
                  🔄 {area}
                </li>
              ))}
              {selectedAnalytics.areas_for_improvement.length > 3 && (
                <li className="text-xs text-white/60 dark:text-gray-400 italic">
                  +{selectedAnalytics.areas_for_improvement.length - 3} more areas...
                </li>
              )}
            </ul>
          </div>
        )}

        {/* Coaching Recommendations */}
        {selectedAnalytics.coaching_recommendations.length > 0 && (
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white/10 dark:bg-gray-800/50">
            <h3 className="font-semibold text-white dark:text-gray-100 text-sm mb-2">Coaching Recommendations</h3>
            <ul className="space-y-1">
              {selectedAnalytics.coaching_recommendations.slice(0, 3).map((rec, index) => (
                <li key={index} className="text-sm text-white/90 dark:text-gray-100 leading-relaxed">
                  💡 {rec}
                </li>
              ))}
              {selectedAnalytics.coaching_recommendations.length > 3 && (
                <li className="text-xs text-white/60 dark:text-gray-400 italic">
                  +{selectedAnalytics.coaching_recommendations.length - 3} more recommendations...
                </li>
              )}
            </ul>
          </div>
        )}

        {/* Next Steps */}
        {selectedAnalytics.next_steps_suggestions.length > 0 && (
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white/10 dark:bg-gray-800/50">
            <h3 className="font-semibold text-white dark:text-gray-100 text-sm mb-2">Next Steps</h3>
            <ul className="space-y-1">
              {selectedAnalytics.next_steps_suggestions.map((step, index) => (
                <li key={index} className="text-sm text-white/90 dark:text-gray-100 leading-relaxed">
                  📋 {step}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  </>
);

// Main Analytics View component
export const AnalyticsView: React.FC<AnalyticsViewProps> = (props) => {
  if (props.selectedAnalytics) {
    return (
      <AnalyticsDetailView
        selectedAnalytics={props.selectedAnalytics}
        onNavigateBack={props.onNavigateBack}
      />
    );
  }

  return (
    <AnalyticsSummaryView
      analytics={props.analytics}
      scenarios={props.scenarios}
      loading={props.loading}
      onNavigateBack={props.onNavigateBack}
      onSelectAnalytics={props.onSelectAnalytics}
      onChangeView={props.onChangeView}
    />
  );
};