import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { getUserFromRequest } from '@/lib/auth';
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

    const serviceRequest = await ServiceRequest.findById(conversationId);
    
    if (!serviceRequest) {
      return NextResponse.json({ success: false, message: 'Conversation not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: serviceRequest.messages || [] });
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

    const newMessage = {
      message: content,
      sentBy: user?.name || user?.email || 'Agent',
      timestamp: new Date()
    };

    serviceRequest.messages = serviceRequest.messages || [];
    serviceRequest.messages.push(newMessage);
    await serviceRequest.save();

    return NextResponse.json({ success: true, data: newMessage });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to send message' }, { status: 500 });
  }
}
