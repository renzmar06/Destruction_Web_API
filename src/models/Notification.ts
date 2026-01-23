import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  customerId: mongoose.Types.ObjectId;
  title: string;
  message: string;
  type: 'service_request_update' | 'general' | 'system';
  status: 'unread' | 'read';
  serviceRequestId?: mongoose.Types.ObjectId;
  sentVia: 'email' | 'system' | 'both';
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema: Schema = new Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['service_request_update', 'general', 'system'], default: 'service_request_update' },
  status: { type: String, enum: ['unread', 'read'], default: 'unread' },
  serviceRequestId: { type: mongoose.Schema.Types.ObjectId, ref: 'ServiceRequest' },
  sentVia: { type: String, enum: ['email', 'system', 'both'], default: 'both' }
}, {
  timestamps: true
});

// Clear cached model to ensure schema updates
if (mongoose.models.Notification) {
  delete mongoose.models.Notification;
}

export default mongoose.model<INotification>('Notification', NotificationSchema);