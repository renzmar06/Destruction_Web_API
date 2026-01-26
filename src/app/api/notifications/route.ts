import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Notification from '@/models/Notification';
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

    const notifications = await Notification.find({ customerId: new mongoose.Types.ObjectId(userId) })
      .populate('serviceRequestId', 'title status')
      .sort({ createdAt: -1 });

    return NextResponse.json({ 
      success: true, 
      notifications 
    });
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to fetch notifications' 
    }, { status: 500 });
  }
}