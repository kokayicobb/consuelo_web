const mongoose = require('mongoose');

const scenarioSchema = new mongoose.Schema({
  scenario_id: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  llmPrompt: {
    type: String,
    required: true
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

scenarioSchema.index({ scenario_id: 1 });
scenarioSchema.index({ is_active: 1 });
scenarioSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.models.Scenario || mongoose.model('Scenario', scenarioSchema);