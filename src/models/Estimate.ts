import mongoose from 'mongoose';

const estimateSchema = new mongoose.Schema({
  estimate_number: { type: String, required: true, unique: true },
  customer_id: { type: String, required: true },
  customer_name: { type: String, required: true },
  estimate_status: { type: String, enum: ['draft', 'sent', 'accepted', 'expired', 'cancelled'], default: 'draft' },
  estimate_date: { type: Date, required: true },
  valid_until_date: { type: Date, required: true },
  destruction_type: String,
  primary_service_location_id: String,
  job_reference: String,
  internal_notes: String,
  estimated_volume_weight: String,
  allowed_variance: { type: Number, default: 0 },
  what_is_included: String,
  what_is_excluded: String,
  note_to_customer: String,
  memo_on_statement: String,
  subtotal: { type: Number, default: 0 },
  discount_amount: { type: Number, default: 0 },
  discount_type: { type: String, enum: ['percentage', 'fixed'], default: 'percentage' },
  discount_value: { type: Number, default: 0 },
  taxable_subtotal: { type: Number, default: 0 },
  tax_amount: { type: Number, default: 0 },
  tax_rate: { type: Number, default: 0 },
  shipping_amount: { type: Number, default: 0 },
  total_amount: { type: Number, default: 0 },
  sent_date: Date,
  accepted_date: Date,
  created_by: String,
  updated_by: String
}, {
  timestamps: true
});

export default mongoose.models.Estimate || mongoose.model('Estimate', estimateSchema);