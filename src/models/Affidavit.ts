import mongoose from 'mongoose';

const AffidavitSchema = new mongoose.Schema({
  affidavit_number: {
    type: String,
    required: true,
    unique: true
  },
  affidavit_status: {
    type: String,
    enum: ['pending', 'issued', 'locked', 'revoked'],
    default: 'pending'
  },
  job_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  job_reference: String,
  customer_name: String,
  description_of_materials: String,
  description_of_process: String,
  date_issued: Date,
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

export default mongoose.models.Affidavit || mongoose.model('Affidavit', AffidavitSchema);