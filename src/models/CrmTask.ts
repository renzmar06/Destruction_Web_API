import mongoose from 'mongoose';

const crmTaskSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { 
    type: String, 
    enum: ['task', 'call', 'email', 'meeting', 'follow_up', 'note'], 
    default: 'task' 
  },
  title: { type: String, required: true },
  description: { type: String },
  customer_id: { type: String },
  due_date_from: { type: Date },
  due_date_to: { type: Date },
  completed: { type: Boolean, default: false },
  completed_at: { type: Date },
  created_date: { type: Date, default: Date.now }
}, {
  timestamps: true
});

export default mongoose.models.CrmTask || mongoose.model('CrmTask', crmTaskSchema);
