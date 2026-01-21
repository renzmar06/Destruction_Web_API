import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import MailConfig from '@/models/MailConfig';

export async function GET() {
  try {
    await connectDB();
    const config = await MailConfig.findOne({ isActive: true });
    return NextResponse.json({ success: true, data: config });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch mail config' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    
    // Deactivate existing configs
    await MailConfig.updateMany({}, { isActive: false });
    
    // Create new config
    const config = await MailConfig.create({
      ...body,
      isActive: true
    });
    
    return NextResponse.json({ success: true, data: config });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to create mail config' }, { status: 500 });
  }
}