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
  service_provider_name: String,
  service_provider_ein: String,
  service_provider_address: String,
  job_location: String,
  job_completion_date: String,
  destruction_method: String,
  description_of_materials: String,
  description_of_process: String,
  date_issued: Date,
  attached_documents: [{
    document_id: String,
    file_name: String,
    file_path: String,
    file_type: String,
    upload_date: { type: Date, default: Date.now }
  }],
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

export default mongoose.models.Affidavit || mongoose.model('Affidavit', AffidavitSchema);