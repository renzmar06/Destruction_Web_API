import mongoose, { Schema, Document } from 'mongoose';

export interface ICompanyInfo extends Document {
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  email: string;
  phone: string;
  website: string;
  ein_ssn: string;
  company_logo_url?: string;
  user_id: string;
  createdAt: Date;
  updatedAt: Date;
}

const CompanyInfoSchema: Schema = new Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zip: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  website: { type: String },
  ein_ssn: { type: String, required: true },
  company_logo_url: { type: String },
  user_id: { type: String, required: true, index: true },
}, {
  timestamps: true
});

export default mongoose.models.CompanyInfo || mongoose.model<ICompanyInfo>('CompanyInfo', CompanyInfoSchema);