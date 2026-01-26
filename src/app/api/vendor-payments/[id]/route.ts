import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import VendorPayment from '@/models/VendorPayment';
import { getUserFromRequest } from '@/lib/auth';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { userId } = getUserFromRequest(request);
    const { id } = await params;
    const body = await request.json();
    
    const payment = await VendorPayment.findOneAndUpdate(
      { _id: id, user_id: userId },
      body,
      { new: true }
    );
    
    if (!payment) {
      return NextResponse.json({ 
        success: false, 
        message: 'Payment not found',
        data: null 
      }, { status: 404 });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Vendor payment updated successfully',
      data: payment 
    });
  } catch (error) {
    console.error('Error updating vendor payment:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to update vendor payment',
      data: null 
    }, { status: 500 });
  }
}