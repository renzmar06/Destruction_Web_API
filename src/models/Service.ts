import mongoose from 'mongoose';

const productServiceSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  service_name: { type: String, required: true },
  item_type: { type: String, enum: ['service', 'adjustment'], default: 'service' },
  service_category: { type: String, required: true },
  description: { type: String },
  pricing_unit: { type: String, required: true },
  default_rate: { type: Number, required: true, default: 0 },
  packaging_type: { type: String },
  estimated_cost_per_unit: { type: Number, default: 0 },
  expected_margin_percent: { type: Number, default: 0 },
  internal_notes: { type: String },
  is_taxable: { type: Boolean, default: true },
  include_by_default_on_estimates: { type: Boolean, default: false },
  allow_price_override_on_invoice: { type: Boolean, default: true },
  service_status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  sku: { type: String },
  image_url: { type: String },
  i_sell_service: { type: Boolean, default: true },
  i_purchase_service: { type: Boolean, default: false },
  income_account: { type: String, required: true },
  sales_tax_category: { type: String, default: 'taxable_standard' },
}, {
  timestamps: true
});

export default mongoose.models.ProductService || mongoose.model('ProductService', productServiceSchema);