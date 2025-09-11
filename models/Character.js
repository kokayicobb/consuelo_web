const mongoose = require('mongoose');

const characterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    required: true,
    trim: true
  },
  personality: {
    type: String,
    required: true
  },
  background: {
    type: String,
    required: true
  },
  objections: {
    type: [String],
    default: []
  },
  voice_id: {
    type: String,
    default: null
  },
  scenario_ids: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Scenario'
  }],
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

characterSchema.index({ scenario_ids: 1 });
characterSchema.index({ is_active: 1 });
characterSchema.index({ role: 1 });

module.exports = mongoose.models.Character || mongoose.model('Character', characterSchema);