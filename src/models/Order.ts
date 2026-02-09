import mongoose, { Schema, Document } from 'mongoose';

export interface IOrder extends Document {
  order_number: string;
  customer_id: string;
  status: string;
  payment_status: string;
  total: number;
  subtotal: number;
  discount: number;
  shipping_fee: number;
  tracking_number?: string;
  items: Array<{
    name: string;
    quantity: number;
    unit_price: number;
    total: number;
  }>;
  shipping_address?: {
    name: string;
    address: string;
    city: string;
    country: string;
    phone: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema: Schema = new Schema(
  {
    order_number: { type: String, required: true, unique: true },
    customer_id: { type: String, required: true },
    status: { type: String, default: 'pending' },
    payment_status: { type: String, default: 'unpaid' },
    total: { type: Number, default: 0 },
    subtotal: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    shipping_fee: { type: Number, default: 0 },
    tracking_number: { type: String },
    items: [{
      name: String,
      quantity: Number,
      unit_price: Number,
      total: Number
    }],
    shipping_address: {
      name: String,
      address: String,
      city: String,
      country: String,
      phone: String
    }
  },
  { timestamps: true }
);

export default mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);
