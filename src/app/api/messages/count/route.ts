import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { getUserFromRequest } from '@/lib/auth';
import Message from '@/models/Message';

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

    const count = await Message.countDocuments({ conversation_id: conversationId });

    return NextResponse.json({ success: true, data: { count } });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to fetch message count' }, { status: 500 });
  }
}
