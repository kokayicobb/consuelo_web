const mongoose = require('mongoose');

const conversationEntrySchema = new mongoose.Schema({
  speaker: {
    type: String,
    required: true,
    enum: ['user', 'character', 'system']
  },
  message: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  metadata: {
    type: Object,
    default: {}
  }
}, { _id: false });

const metadataSchema = new mongoose.Schema({
  ip_address: String,
  user_agent: String,
  session_quality: {
    type: String,
    enum: ['excellent', 'good', 'fair', 'poor'],
    default: 'good'
  }
}, { _id: false });

const roleplaySessionSchema = new mongoose.Schema({
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
  character_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Character',
    default: null
  },
  user_id: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'paused', 'ended'],
    default: 'active'
  },
  start_time: {
    type: Date,
    default: Date.now
  },
  end_time: {
    type: Date,
    default: null
  },
  total_duration: {
    type: Number,
    default: 0
  },
  conversation: [conversationEntrySchema],
  voice_enabled: {
    type: Boolean,
    default: false
  },
  metadata: {
    type: metadataSchema,
    default: {}
  }
}, {
  timestamps: true
});

roleplaySessionSchema.index({ user_id: 1, createdAt: -1 });
roleplaySessionSchema.index({ session_id: 1 });
roleplaySessionSchema.index({ status: 1 });
roleplaySessionSchema.index({ scenario_id: 1 });

module.exports = mongoose.models.RoleplaySession || mongoose.model('RoleplaySession', roleplaySessionSchema);