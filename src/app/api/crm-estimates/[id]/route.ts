import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import CrmEstimate from '@/models/CrmEstimate';
import { getUserFromRequest } from '@/lib/auth';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { userId } = getUserFromRequest(request);
    const body = await request.json();
    const { id } = await params;
    
    if (!userId) {
      return NextResponse.json({ 
        success: false, 
        message: 'Authentication required',
        data: null 
      }, { status: 401 });
    }

    const estimate = await CrmEstimate.findOneAndUpdate(
      { _id: id, user_id: userId },
      body,
      { new: true }
    );

    if (!estimate) {
      return NextResponse.json({ 
        success: false, 
        message: 'Estimate not found',
        data: null 
      }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Estimate updated successfully',
      data: estimate 
    });
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to update estimate',
      data: null 
    }, { status: 500 });
  }
}
