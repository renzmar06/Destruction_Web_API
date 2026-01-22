import mongoose from 'mongoose';

const lineItemSchema = new mongoose.Schema({
  service_id: { type: mongoose.Schema.Types.ObjectId, ref: 'ProductService' },
  service_name: { type: String, required: true },
  description: { type: String, required: true },
  quantity: { type: Number, required: true },
  pricing_unit: { type: String, required: true },
  unit_price: { type: Number, required: true },
  line_total: { type: Number, required: true },
  sort_order: { type: Number, default: 0 }
});

const operationalChargeSchema = new mongoose.Schema({
  charge_type: {
    type: String,
    enum: ['transportation', 'fuel_surcharge', 'storage', 'disposal_fee', 'credit_discount', 'other'],
    required: true
  },
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  charge_method: {
    type: String,
    enum: ['fixed', 'percentage'],
    default: 'fixed'
  },
  sort_order: { type: Number, default: 0 }
});

const estimateSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
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
  customer_notes: String,
  customer_email: String,
  bill_to_address: String,
  ship_to_address: String,
  payment_terms: String,
  line_items: [lineItemSchema],
  operational_charges: [operationalChargeSchema],
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