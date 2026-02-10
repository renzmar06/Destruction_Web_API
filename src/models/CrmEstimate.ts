import mongoose from 'mongoose';

const crmEstimateSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  customer_id: { type: String, required: true },
  estimate_number: { type: String, required: true, unique: true },
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
    enum: ['draft', 'sent', 'accepted', 'declined', 'expired'], 
    default: 'draft' 
  },
  valid_until: { type: Date },
  notes: { type: String },
  terms: { type: String },
  created_date: { type: Date, default: Date.now }
}, {
  timestamps: true
});

export default mongoose.models.CrmEstimate || mongoose.model('CrmEstimate', crmEstimateSchema);
