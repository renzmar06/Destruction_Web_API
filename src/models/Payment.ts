import mongoose from 'mongoose';

const PaymentSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // For regular payments
  customer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  customer_name: { type: String },
  payment_number: { type: String, sparse: true },
  payment_date: { type: Date },
  payment_amount: { type: Number },
  payment_method: { type: String },
  reference_number: { type: String },
  notes: { type: String },
  allocations: [{
    invoice_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice' },
    invoice_number: { type: String },
    amount_applied: { type: Number },
    balance_before: { type: Number },
    balance_after: { type: Number }
  }],
  
  // For Stripe payments
  invoice_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice' },
  stripe_payment_intent_id: { type: String },
  amount: { type: Number },
  currency: { type: String, default: 'usd' },
  status: { 
    type: String, 
    enum: ['pending', 'succeeded', 'failed', 'canceled'], 
    default: 'pending' 
  },
  customer_email: { type: String },
  metadata: { type: Object, default: {} }
}, { timestamps: true });

export default mongoose.models.Payment || mongoose.model('Payment', PaymentSchema);