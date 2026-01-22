import mongoose from 'mongoose';

const vendorSchema = new mongoose.Schema({
  vendor_name: {
    type: String,
    required: true,
    trim: true
  },
  contact_person: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  payment_terms: {
    type: String,
    enum: ['net_15', 'net_30', 'net_45', 'net_60', 'due_on_receipt', 'custom'],
    default: 'net_30'
  },
  vendor_category: {
    type: String,
    enum: ['demolition', 'disposal', 'transportation', 'equipment_rental', 'materials', 'subcontractor', 'other'],
    default: 'other'
  },
  tax_id: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  },
  vendor_status: {
    type: String,
    enum: ['active', 'archived'],
    default: 'active'
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
vendorSchema.index({ user_id: 1, vendor_status: 1 });
vendorSchema.index({ vendor_name: 1 });

export default mongoose.models.Vendor || mongoose.model('Vendor', vendorSchema);