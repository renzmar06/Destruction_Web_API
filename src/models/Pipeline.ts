import mongoose, { Schema, Document } from 'mongoose';

export interface IPipeline extends Document {
  title: string;
  customer_id: string;
  value: number;
  probability: number;
  pipeline_id: number;
  stage_id: string;
  status: string;
  expected_close_date_from?: string;
  expected_close_date_to?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PipelineSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    customer_id: { type: String, required: true },
    value: { type: Number, default: 0 },
    probability: { type: Number, default: 50 },
    pipeline_id: { type: Number, default: 1 },
    stage_id: { type: String, required: true },
    status: { type: String, default: 'open' },
    expected_close_date_from: { type: String },
    expected_close_date_to: { type: String },
    notes: { type: String }
  },
  { timestamps: true }
);

export default mongoose.models.Pipeline || mongoose.model<IPipeline>('Pipeline', PipelineSchema);
