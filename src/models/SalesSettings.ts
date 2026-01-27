import mongoose from 'mongoose';

const salesSettingsSchema = new mongoose.Schema({
  user_id: {
    type: String,
    required: true,
    unique: true
  },
  preferred_invoice_terms: {
    type: String,
    default: 'net_30'
  },
  preferred_delivery_method: {
    type: String,
    default: 'email'
  },
  shipping_enabled: {
    type: Boolean,
    default: true
  },
  custom_fields_enabled: {
    type: Boolean,
    default: false
  },
  custom_transaction_numbers: {
    type: Boolean,
    default: true
  },
  service_date_enabled: {
    type: Boolean,
    default: false
  },
  discount_enabled: {
    type: Boolean,
    default: true
  },
  transaction_enabled: {
    type: Boolean,
    default: true
  },
  deposit_enabled: {
    type: Boolean,
    default: false
  },
  accept_tips_enabled: {
    type: Boolean,
    default: false
  },
  tags_enabled: {
    type: Boolean,
    default: true
  },
  turn_on_price_rules: {
    type: Boolean,
    default: true
  },
  accept_credit_cards: {
    type: Boolean,
    default: true
  },
  accept_ach: {
    type: Boolean,
    default: true
  },
  accept_paypal: {
    type: Boolean,
    default: false
  },
  customer_pays_fee: {
    type: Boolean,
    default: true
  },
  payment_instructions: {
    type: String,
    default: 'Please pay within the terms listed. Thank you!'
  },
  customer_financing_enabled: {
    type: Boolean,
    default: true
  },
  show_product_service_column: {
    type: Boolean,
    default: true
  },
  show_sku_column: {
    type: Boolean,
    default: true
  },
  price_rules_enabled: {
    type: Boolean,
    default: true
  },
  track_quantity_price: {
    type: Boolean,
    default: true
  },
  track_inventory: {
    type: Boolean,
    default: true
  },
  inventory_valuation_method: {
    type: String,
    enum: ['fifo', 'lifo', 'average_cost'],
    default: 'fifo'
  },
  track_inventory_sales_channels: {
    type: Boolean,
    default: false
  },
  late_fees_enabled: {
    type: Boolean,
    default: false
  },
  progress_invoicing_enabled: {
    type: Boolean,
    default: false
  },
  default_email_message: {
    type: String,
    default: 'Thank you for your order! Find your invoice attached.'
  },
  default_invoice_reminder_message: {
    type: String,
    default: 'Friendly reminder — your invoice is due soon.'
  },
  automatic_invoice_reminders: {
    type: Boolean,
    default: true
  },
  ask_work_request: {
    type: Boolean,
    default: false
  },
  ask_review_feedback: {
    type: Boolean,
    default: true
  },
  ask_referral: {
    type: Boolean,
    default: false
  },
  feedback_frequency_days: {
    type: Number,
    default: 90
  },
  online_delivery_enabled: {
    type: Boolean,
    default: true
  },
  show_aging_table: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export default mongoose.models.SalesSettings || mongoose.model('SalesSettings', salesSettingsSchema);