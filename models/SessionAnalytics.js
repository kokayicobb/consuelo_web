const mongoose = require('mongoose');

const keyMomentSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  score_impact: {
    type: Number,
    min: -10,
    max: 10
  }
}, { _id: false });

const sessionAnalyticsSchema = new mongoose.Schema({
  session_id: {
    type: String,
    required: true,
    unique: true
  },
  scenario_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Scenario',
    required: true
  },
  user_id: {
    type: String,
    required: true
  },
  overall_score: {
    type: Number,
    min: 1,
    max: 10,
    required: true
  },
  communication_score: {
    type: Number,
    min: 1,
    max: 10,
    required: true
  },
  objection_handling_score: {
    type: Number,
    min: 1,
    max: 10,
    required: true
  },
  rapport_building_score: {
    type: Number,
    min: 1,
    max: 10,
    required: true
  },
  closing_technique_score: {
    type: Number,
    min: 1,
    max: 10,
    required: true
  },
  strengths: {
    type: [String],
    default: []
  },
  areas_for_improvement: {
    type: [String],
    default: []
  },
  objections_encountered: {
    type: [String],
    default: []
  },
  objections_handled_well: {
    type: [String],
    default: []
  },
  missed_opportunities: {
    type: [String],
    default: []
  },
  coaching_recommendations: {
    type: [String],
    default: []
  },
  next_steps_suggestions: {
    type: [String],
    default: []
  },
  key_moments: [keyMomentSchema],
  conversation_flow_analysis: {
    type: String,
    required: true
  },
  analyzed_at: {
    type: Date,
    default: Date.now
  },
  analysis_version: {
    type: String,
    default: '1.0'
  }
}, {
  timestamps: true
});

sessionAnalyticsSchema.index({ user_id: 1, createdAt: -1 });
sessionAnalyticsSchema.index({ session_id: 1 });
sessionAnalyticsSchema.index({ overall_score: -1 });
sessionAnalyticsSchema.index({ scenario_id: 1 });

module.exports = mongoose.models.SessionAnalytics || mongoose.model('SessionAnalytics', sessionAnalyticsSchema);