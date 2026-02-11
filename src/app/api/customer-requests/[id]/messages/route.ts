import { NextRequest, NextResponse } from 'next/server';
import ServiceRequest from '@/models/ServiceRequest';
import Message from '@/models/Message';
import User from '@/models/User';
import { connectDB } from '@/lib/mongodb';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { userId } = getUserFromRequest(request);
    
    if (!userId) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const messages = await Message.find({ conversation_id: id })
      .populate('sender_id', 'name email')
      .sort({ createdAt: 1 });

    return NextResponse.json({ success: true, data: messages });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to fetch messages' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { userId } = getUserFromRequest(request);
    
    if (!userId) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { message } = await request.json();
    
    if (!message?.trim()) {
      return NextResponse.json({ success: false, message: 'Message is required' }, { status: 400 });
    }

    const user = await User.findById(userId);
    const serviceRequest = await ServiceRequest.findById(id);
    
    if (!serviceRequest) {
      return NextResponse.json({ success: false, message: 'Service request not found' }, { status: 404 });
    }

    if (user?.role !== 'admin' && serviceRequest.user_id.toString() !== userId) {
      return NextResponse.json({ success: false, message: 'Access denied' }, { status: 403 });
    }

    const newMessage = await Message.create({
      conversation_id: id,
      sender_id: userId,
      sender_type: user?.role === 'admin' ? 'agent' : 'customer',
      content: message.trim()
    });

    await newMessage.populate('sender_id', 'name email');

    return NextResponse.json({ success: true, message: 'Message sent successfully', data: newMessage });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to send message' }, { status: 500 });
  }
}