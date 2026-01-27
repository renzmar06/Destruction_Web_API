import mongoose from 'mongoose';

const DocumentVerificationSchema = new mongoose.Schema({
  document_id: {
    type: String,
    required: true,
    unique: true
  },
  affidavit_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Affidavit',
    required: true
  },
  job_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  customer_email: {
    type: String,
    required: true
  },
  verification_status: {
    type: String,
    enum: ['pending', 'sent', 'verified'],
    default: 'pending'
  },
  email_sent_date: Date,
  verified_date: Date,
  verification_token: String,
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

export default mongoose.models.DocumentVerification || mongoose.model('DocumentVerification', DocumentVerificationSchema);