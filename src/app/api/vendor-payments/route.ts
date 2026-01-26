import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import VendorPayment from '@/models/VendorPayment';
import User from '@/models/User';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { userId } = getUserFromRequest(request);
    
    if (!userId) {
      return NextResponse.json({ 
        success: false, 
        message: 'User authentication required',
        data: null 
      }, { status: 401 });
    }

    const payments = await VendorPayment.find({ user_id: userId }).sort({ createdAt: -1 });

    return NextResponse.json({ 
      success: true, 
      message: 'Vendor payments fetched successfully',
      data: payments 
    });
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to fetch vendor payments',
      data: null 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { userId } = getUserFromRequest(request);
    const body = await request.json();
    
    // Generate payment number
    const count = await VendorPayment.countDocuments({ user_id: userId });
    const paymentNumber = `VP-${new Date().getFullYear()}-${String(count + 1).padStart(3, '0')}`;
    
    const payment = new VendorPayment({
      ...body,
      user_id: userId,
      payment_number: paymentNumber
    });
    
    await payment.save();
    
    return NextResponse.json({ 
      success: true, 
      message: 'Vendor payment recorded successfully',
      data: payment 
    }, { status: 201 });
  } catch (error) {
    console.error('Error recording vendor payment:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to record vendor payment',
      data: null 
    }, { status: 500 });
  }
}