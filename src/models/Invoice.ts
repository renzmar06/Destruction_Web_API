import mongoose from 'mongoose';

const invoiceSchema = new mongoose.Schema({
  invoice_number: { type: String, required: true, unique: true },
  customer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  customer_name: { type: String, required: true },
  customer_email: { type: String, required: true },
  job_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
  invoice_status: { 
    type: String, 
    enum: ['draft', 'sent', 'finalized', 'paid', 'void'],
    default: 'draft'
  },
  issue_date: { type: Date, required: true },
  due_date: { type: Date, required: true },
  payment_terms: { type: String, default: 'net_30' },
  bill_to_address: { type: String },
  ship_to_address: { type: String },
  total_amount: { type: Number, required: true, default: 0 },
  balance_due: { type: Number, required: true, default: 0 },
  notes_to_customer: { type: String },
  internal_notes: { type: String },
  sent_date: { type: Date },
  paid_date: { type: Date },
}, {
  timestamps: true
});

export default mongoose.models.Invoice || mongoose.model('Invoice', invoiceSchema);