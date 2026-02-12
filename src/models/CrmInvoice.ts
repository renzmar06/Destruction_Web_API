import mongoose from 'mongoose';

const crmInvoiceSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  customer_id: { type: String, required: true },
  crm_estimate_id: { type: mongoose.Schema.Types.ObjectId, ref: 'CrmEstimate' },
  invoice_number: { type: String, required: true, unique: true },
  items: [{
    description: { type: String, required: true },
    quantity: { type: Number, required: true },
    unit_price: { type: Number, required: true },
    total: { type: Number, required: true }
  }],
  subtotal: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
  status: { 
    type: String, 
    enum: ['draft', 'sent', 'paid', 'overdue', 'cancelled'], 
    default: 'draft' 
  },
  payment_status: {
    type: String,
    enum: ['paid', 'unpaid', 'partial'],
    default: 'unpaid'
  },
  issue_date: { type: Date, required: true },
  due_date: { type: Date },
  notes: { type: String },
  payment_terms: { type: String },
  created_date: { type: Date, default: Date.now }
}, {
  timestamps: true
});

export default mongoose.models.CrmInvoice || mongoose.model('CrmInvoice', crmInvoiceSchema);
