import mongoose from 'mongoose';

const customerTaskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['to_do', 'in_progress', 'completed', 'cancelled'],
    default: 'to_do'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  customer_id: {
    type: String,
    required: true
  },

  assigned_to: {
    type: String,
    default: ''
  },
  due_date: {
    type: Date
  },
  completed_date: {
    type: Date
  },
  tags: {
    type: String,
    default: ''
  },
  related_to: {
    type: String,
    enum: ['none', 'customer', 'estimate', 'job', 'invoice'],
    default: 'none'
  },
  customer: {
    type: String,
    default: ''
  },
  estimate: {
    type: String,
    default: ''
  },
  job: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

export default mongoose.models.CustomerTask || mongoose.model('CustomerTask', customerTaskSchema);