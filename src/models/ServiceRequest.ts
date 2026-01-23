import mongoose, { Schema, Document } from 'mongoose';

export interface IServiceRequest extends Document {
  requestNumber: string;
  serviceType: string;
  productType: string;
  materialCondition?: string;
  estimatedWeight?: string;
  unitCount?: string;
  palletCount?: number;
  palletType?: string;
  shrinkWrapped?: boolean;
  destructionType?: string;
  certificateRequired?: boolean;
  logisticsType?: string;
  pickupAddress?: string;
  pickupHours?: string;
  truckingService?: boolean;
  palletSwap?: boolean;
  additionalLabor?: boolean;
  hazardousNotes?: string;
  timeConstraints?: string;
  preferredDate: string;
  urgency?: string;
  contactName: string;
  contactPhone: string;
  quantityBreakdown?: string;
  scheduleFrequency?: string;
  problemDescription?: string;
  attachments?: string[];
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

const ServiceRequestSchema: Schema = new Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  requestNumber: { type: String, required: true, unique: true },
  serviceType: { type: String, required: true },
  productType: { type: String, required: true },
  materialCondition: { type: String },
  estimatedWeight: { type: String },
  unitCount: { type: String },
  palletCount: { type: Number },
  palletType: { type: String },
  shrinkWrapped: { type: Boolean, default: false },
  destructionType: { type: String },
  certificateRequired: { type: Boolean, default: false },
  logisticsType: { type: String },
  pickupAddress: { type: String },
  pickupHours: { type: String },
  truckingService: { type: Boolean, default: false },
  palletSwap: { type: Boolean, default: false },
  additionalLabor: { type: Boolean, default: false },
  hazardousNotes: { type: String },
  timeConstraints: { type: String },
  preferredDate: { type: String, required: true },
  urgency: { type: String, default: 'normal' },
  contactName: { type: String, required: true },
  contactPhone: { type: String, required: true },
  quantityBreakdown: { type: String },
  scheduleFrequency: { type: String },
  problemDescription: { type: String },
  attachments: [{ type: String }],
  status: { type: String, required: true, default: 'pending' }
}, {
  timestamps: true
});

// Clear cached model to ensure schema updates
if (mongoose.models.ServiceRequest) {
  delete mongoose.models.ServiceRequest;
}

export default mongoose.model<IServiceRequest>('ServiceRequest', ServiceRequestSchema);