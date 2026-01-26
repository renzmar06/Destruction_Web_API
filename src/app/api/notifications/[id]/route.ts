import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Notification from '@/models/Notification';
import { getUserFromRequest } from '@/lib/auth';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  
  try {
    await connectDB();
    const { userId } = getUserFromRequest(request);
    
    if (!userId) {
      return NextResponse.json({ 
        success: false, 
        message: 'Authentication required' 
      }, { status: 401 });
    }

    const { status } = await request.json();
    const { id } = await params;
    
    const notification = await Notification.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!notification) {
      return NextResponse.json({ 
        success: false, 
        message: 'Notification not found' 
      }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      notification 
    });
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to update notification' 
    }, { status: 500 });
  }
}