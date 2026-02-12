import mongoose from 'mongoose';

const automationRuleSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  description: { type: String },
  trigger_type: { 
    type: String, 
    enum: ['new_message', 'new_customer', 'new_conversation', 'keyword_match', 'no_reply_timeout', 'tag_added'],
    required: true 
  },
  actions: [{
    type: { type: String, required: true },
    params: { type: mongoose.Schema.Types.Mixed }
  }],
  is_active: { type: Boolean, default: true },
  priority: { type: Number, default: 0 },
  run_count: { type: Number, default: 0 },
  created_date: { type: Date, default: Date.now }
}, {
  timestamps: true
});

export default mongoose.models.AutomationRule || mongoose.model('AutomationRule', automationRuleSchema);
