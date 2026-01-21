import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Estimate from '@/models/Estimate';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { estimateId, action, customerResponse } = await request.json();

    const estimate = await Estimate.findById(estimateId);
    if (!estimate) {
      return NextResponse.json({ success: false, error: 'Estimate not found' }, { status: 404 });
    }

    // Update estimate status based on action
    const status = action === 'accept' ? 'accepted' : 'rejected';
    await Estimate.findByIdAndUpdate(estimateId, {
      estimate_status: status,
      customer_response: customerResponse || '',
      response_date: new Date()
    });

    return NextResponse.json({ 
      success: true, 
      message: `Estimate ${status} successfully` 
    });

  } catch (error) {
    console.error('Error updating estimate:', error);
    return NextResponse.json({ success: false, error: 'Failed to update estimate' }, { status: 500 });
  }
}