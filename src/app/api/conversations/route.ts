import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { getUserFromRequest } from '@/lib/auth';
import ServiceRequest from '@/models/ServiceRequest';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { userId } = getUserFromRequest(request);
    
    if (!userId) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const conversations = await ServiceRequest.find()
      .populate('user_id', 'name email phone')
      .sort({ updatedAt: -1 });

    return NextResponse.json({ success: true, data: conversations });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to fetch conversations' }, { status: 500 });
  }
}
