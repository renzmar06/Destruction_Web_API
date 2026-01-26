import mongoose from 'mongoose';

const VendorPaymentSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  payment_number: { type: String, required: true },
  vendor_name: { type: String, required: true },
  payment_amount: { type: Number, required: true },
  payment_date: { type: Date, required: true },
  payment_status: { 
    type: String, 
    enum: ['pending', 'scheduled', 'sent', 'cleared'], 
    default: 'pending' 
  },
  payment_method: { 
    type: String, 
    enum: ['bank_transfer', 'check', 'ach', 'wire', 'cash'], 
    required: true 
  },
  reference_number: { type: String },
  notes: { type: String }
}, { timestamps: true });

export default mongoose.models.VendorPayment || mongoose.model('VendorPayment', VendorPaymentSchema);