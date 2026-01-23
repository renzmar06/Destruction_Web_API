import { NextRequest, NextResponse } from 'next/server';
import ServiceRequest from '@/models/ServiceRequest';
import User from '@/models/User';
import { connectDB } from '@/lib/mongodb';
import { getUserFromRequest } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { userId } = getUserFromRequest(request);
    
    if (!userId) {
      return NextResponse.json({ 
        success: false, 
        message: 'User authentication required' 
      }, { status: 401 });
    }

    const { id } = await params;
    const { message } = await request.json();
    
    if (!message?.trim()) {
      return NextResponse.json({ 
        success: false, 
        message: 'Message is required' 
      }, { status: 400 });
    }

    const user = await User.findById(userId);
    const serviceRequest = await ServiceRequest.findById(id);
    
    if (!serviceRequest) {
      return NextResponse.json({ 
        success: false, 
        message: 'Service request not found' 
      }, { status: 404 });
    }

    // Check if user has access to this request
    if (user?.role !== 'admin' && serviceRequest.user_id.toString() !== userId) {
      return NextResponse.json({ 
        success: false, 
        message: 'Access denied' 
      }, { status: 403 });
    }

    const newMessage = {
      message: message.trim(),
      sentBy: user?.name || user?.email || 'User',
      timestamp: new Date()
    };

    serviceRequest.messages = serviceRequest.messages || [];
    serviceRequest.messages.push(newMessage);
    await serviceRequest.save();

    return NextResponse.json({
      success: true,
      message: 'Message sent successfully',
      data: newMessage
    });

  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to send message' },
      { status: 500 }
    );
  }
}