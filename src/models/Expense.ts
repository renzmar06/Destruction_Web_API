import mongoose from 'mongoose';

const ExpenseSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  expense_id: {
    type: String,
    required: true,
    unique: true
  },
  expense_type: {
    type: String,
    enum: ['transport', 'packaging', 'equipment', 'labor', 'materials', 'utilities', 'other'],
    required: true
  },
  vendor_name: {
    type: String,
    required: true
  },
  expense_date: {
    type: Date,
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  description: {
    type: String,
    required: true
  },
  expense_status: {
    type: String,
    enum: ['draft', 'submitted', 'approved', 'archived'],
    default: 'draft'
  },
  payment_status: {
    type: String,
    enum: ['not_ready', 'pending', 'paid'],
    default: 'not_ready'
  },
  payment_date: {
    type: Date
  },
  payment_method: {
    type: String,
    enum: ['bank_transfer', 'check', 'cash', 'credit_card', 'other'],
    required: false
  },
  job_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job'
  },
  purchase_order_number: {
    type: String
  },
  attachments: [{
    filename: String,
    url: String,
    uploaded_at: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
});

export default mongoose.models.Expense || mongoose.model('Expense', ExpenseSchema);