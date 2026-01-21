import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema({
  job_id: { type: String, required: true, unique: true },
  job_name: { type: String, required: true },
  customer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  customer_name: { type: String, required: true },
  estimate_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Estimate', required: true },
  estimate_number: { type: String, required: true },
  job_location_id: { type: String },
  scheduled_date: { type: Date },
  actual_start_date: { type: Date },
  actual_completion_date: { type: Date },
  destruction_method: { 
    type: String, 
    enum: ['mechanical_destruction', 'chemical_destruction', 'incineration', 'shredding', 'other'],
    default: 'mechanical_destruction'
  },
  destruction_description: { type: String },
  requires_affidavit: { type: Boolean, default: false },
  special_handling_notes: { type: String },
  job_status: { 
    type: String, 
    enum: ['scheduled', 'in_progress', 'completed', 'archived'],
    default: 'scheduled'
  },
}, {
  timestamps: true
});

export default mongoose.models.Job || mongoose.model('Job', jobSchema);