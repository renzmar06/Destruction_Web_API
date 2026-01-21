import mongoose from 'mongoose';

const mailConfigSchema = new mongoose.Schema({
  driver: { type: String, required: true },
  host: { type: String, required: true },
  port: { type: Number, required: true },
  username: { type: String, required: true },
  password: { type: String, required: true },
  encryption: { type: String, required: true },
  from_address: { type: String, required: true },
  from_name: { type: String, required: true },
  is_active: { type: Boolean, default: true },
}, {
  timestamps: true
});

export default mongoose.models.MailConfig || mongoose.model('MailConfig', mailConfigSchema);