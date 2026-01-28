import mongoose from 'mongoose';

const ExpenseSettingsSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  show_items_table: {
    type: Boolean,
    default: false
  },
  show_tags_field: {
    type: Boolean,
    default: false
  },
  track_by_customer: {
    type: Boolean,
    default: false
  },
  make_billable: {
    type: Boolean,
    default: false
  },
  markup_enabled: {
    type: Boolean,
    default: false
  },
  markup_rate: {
    type: Number,
    default: 0,
    min: 0
  },
  track_as_income: {
    type: Boolean,
    default: false
  },
  income_account_type: {
    type: String,
    enum: ['single', 'multiple'],
    default: 'single'
  },
  charge_sales_tax: {
    type: Boolean,
    default: false
  },
  default_bill_payment_terms: {
    type: String,
    enum: ['net_15', 'net_30', 'net_45', 'net_60', 'due_on_receipt'],
    default: 'net_30'
  },
  use_purchase_orders: {
    type: Boolean,
    default: false
  },
  custom_transaction_numbers: {
    type: Boolean,
    default: false
  },
  default_po_message: {
    type: String,
    default: ''
  },
  po_email_use_greeting: {
    type: Boolean,
    default: false
  },
  po_email_greeting: {
    type: String,
    enum: ['Dear', 'Hi', 'Hello'],
    default: 'Dear'
  },
  po_email_name_format: {
    type: String,
    enum: ['[first][last]', '[Title][first]', '[First]', '[full name]', '[Company name]', '[Display name]'],
    default: '[First]'
  },
  po_email_subject: {
    type: String,
    default: ''
  },
  po_email_message: {
    type: String,
    default: ''
  },
  po_email_copy_me: {
    type: Boolean,
    default: false
  },
  po_email_cc: {
    type: String,
    default: ''
  },
  po_email_bcc: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

export default mongoose.models.ExpenseSettings || mongoose.model('ExpenseSettings', ExpenseSettingsSchema);