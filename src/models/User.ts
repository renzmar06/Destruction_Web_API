import mongoose from 'mongoose';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: number;
  // Customer fields
  title?: string;
  first_name?: string;
  middle_name?: string;
  last_name?: string;
  suffix?: string;
  legal_company_name?: string;
  display_name?: string;
  phone?: string;
  cc_email?: string;
  bcc_email?: string;
  mobile?: string;
  fax?: string;
  other_contact?: string;
  website?: string;
  print_on_check_name?: string;
  is_sub_customer?: boolean;
  email_marketing_consent?: boolean;
  billing_street_1?: string;
  billing_street_2?: string;
  billing_city?: string;
  billing_state?: string;
  billing_zip?: string;
  billing_country?: string;
  shipping_same_as_billing?: boolean;
  shipping_street_1?: string;
  shipping_street_2?: string;
  shipping_city?: string;
  shipping_state?: string;
  shipping_zip?: string;
  shipping_country?: string;
  primary_payment_method?: string;
  payment_terms?: string;
  delivery_method?: string;
  invoice_language?: string;
  credit_limit?: number;
  customer_type?: string;
  tax_exempt?: boolean;
  tax_rate_id?: string;
  opening_balance?: number;
  opening_balance_date?: string;
  customer_role?: string;
  primary_product_type?: string;
  requires_certificate?: boolean;
  requires_affidavit?: boolean;
  requires_photo_video_proof?: boolean;
  witness_required?: boolean;
  scrap_resale_allowed?: boolean;
  special_handling_notes?: string;
  internal_notes?: string;
  customer_status?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: function() { return this.role === 'admin'; }
  },
  role: {
    type: String,
    enum: ['admin', 'customer'],
    default: 'customer',
  },
  resetPasswordToken: {
    type: String,
  },
  resetPasswordExpires: {
    type: Number,
  },
  // Customer fields
  title: { type: String, default: '' },
  first_name: { type: String },
  middle_name: { type: String, default: '' },
  last_name: { type: String },
  suffix: { type: String, default: '' },
  legal_company_name: { type: String, default: '' },
  display_name: { type: String },
  phone: { type: String, default: '' },
  cc_email: { type: String, default: '' },
  bcc_email: { type: String, default: '' },
  mobile: { type: String, default: '' },
  fax: { type: String, default: '' },
  other_contact: { type: String, default: '' },
  website: { type: String, default: '' },
  print_on_check_name: { type: String, default: '' },
  is_sub_customer: { type: Boolean, default: false },
  email_marketing_consent: { type: Boolean, default: false },
  billing_street_1: { type: String, default: '' },
  billing_street_2: { type: String, default: '' },
  billing_city: { type: String, default: '' },
  billing_state: { type: String, default: '' },
  billing_zip: { type: String, default: '' },
  billing_country: { type: String, default: 'USA' },
  shipping_same_as_billing: { type: Boolean, default: true },
  shipping_street_1: { type: String, default: '' },
  shipping_street_2: { type: String, default: '' },
  shipping_city: { type: String, default: '' },
  shipping_state: { type: String, default: '' },
  shipping_zip: { type: String, default: '' },
  shipping_country: { type: String, default: 'USA' },
  primary_payment_method: { type: String, default: '' },
  payment_terms: { type: String, default: '' },
  delivery_method: { type: String, default: '' },
  invoice_language: { type: String, default: 'English' },
  credit_limit: { type: Number, default: 0 },
  customer_type: { type: String, default: '' },
  tax_exempt: { type: Boolean, default: false },
  tax_rate_id: { type: String, default: '' },
  opening_balance: { type: Number, default: 0 },
  opening_balance_date: { type: String, default: '' },
  customer_role: { type: String, default: '' },
  primary_product_type: { type: String, default: '' },
  requires_certificate: { type: Boolean, default: false },
  requires_affidavit: { type: Boolean, default: false },
  requires_photo_video_proof: { type: Boolean, default: false },
  witness_required: { type: Boolean, default: false },
  scrap_resale_allowed: { type: Boolean, default: false },
  special_handling_notes: { type: String, default: '' },
  internal_notes: { type: String, default: '' },
  customer_status: { 
    type: String, 
    enum: ['active', 'on_hold', 'archived'], 
    default: 'active' 
  }
}, {
  timestamps: true,
});

export default mongoose.models.User || mongoose.model('User', UserSchema);

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role?: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  user?: User;
  token?: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  user?: User;
}