const mongoose = require('mongoose');

const roleplayTipSchema = new mongoose.Schema({
  session_id: {
    type: String,
    default: null
  },
  category: {
    type: String,
    required: true,
    enum: ['objection_handling', 'rapport_building', 'closing', 'discovery', 'presentation']
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  techniques: {
    type: [String],
    default: []
  },
  practice_scenarios: {
    type: [String],
    default: []
  },
  related_scenarios: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Scenario'
  }],
  difficulty_level: {
    type: String,
    required: true,
    enum: ['beginner', 'intermediate', 'advanced']
  },
  is_featured: {
    type: Boolean,
    default: false
  },
  is_active: {
    type: Boolean,
    default: true
  },
  created_by: {
    type: String,
    default: 'system'
  }
}, {
  timestamps: true
});

roleplayTipSchema.index({ category: 1, difficulty_level: 1 });
roleplayTipSchema.index({ is_featured: 1, is_active: 1 });
roleplayTipSchema.index({ createdAt: -1 });
roleplayTipSchema.index({ session_id: 1 });

module.exports = mongoose.models.RoleplayTip || mongoose.model('RoleplayTip', roleplayTipSchema);