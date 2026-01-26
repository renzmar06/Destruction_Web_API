import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Payment from '@/models/Payment';
import { getUserFromRequest } from '@/lib/auth';
import mongoose from 'mongoose';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { userId } = getUserFromRequest(request);
    
    if (!userId) {
      return NextResponse.json({ 
        success: false, 
        message: 'Authentication required' 
      }, { status: 401 });
    }

    const payments = await Payment.find({ user_id: new mongoose.Types.ObjectId(userId) })
      .populate('customer_name', 'invoice_id')
      .sort({ createdAt: -1 });

    return NextResponse.json({ 
      success: true, 
      payments 
    });
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to fetch payments' 
    }, { status: 500 });
  }
}


