import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { getUserFromRequest } from '@/lib/auth';
import Message from '@/models/Message';
import ServiceRequest from '@/models/ServiceRequest';
import User from '@/models/User';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { userId } = getUserFromRequest(request);
    
    if (!userId) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversation_id');

    if (!conversationId) {
      return NextResponse.json({ success: false, message: 'Conversation ID required' }, { status: 400 });
    }

    const messages = await Message.find({ conversation_id: conversationId })
      .populate('sender_id', 'name email')
      .sort({ createdAt: 1 });

    return NextResponse.json({ success: true, data: messages });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to fetch messages' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { userId } = getUserFromRequest(request);
    
    if (!userId) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { conversation_id, content } = await request.json();

    if (!conversation_id || !content) {
      return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
    }

    const user = await User.findById(userId);
    const serviceRequest = await ServiceRequest.findById(conversation_id);
    
    if (!serviceRequest) {
      return NextResponse.json({ success: false, message: 'Conversation not found' }, { status: 404 });
    }

    const newMessage = await Message.create({
      conversation_id,
      sender_id: userId,
      sender_type: user?.role === 'admin' ? 'agent' : 'customer',
      content
    });

    await newMessage.populate('sender_id', 'name email');

    return NextResponse.json({ success: true, data: newMessage });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to send message' }, { status: 500 });
  }
}
