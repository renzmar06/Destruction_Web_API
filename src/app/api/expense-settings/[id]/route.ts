import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import ExpenseSettings from '@/models/ExpenseSettings';
import { getUserFromToken } from '@/lib/getUserFromToken';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    
    const settings = await ExpenseSettings.findOneAndUpdate(
      { _id: id, user_id: user.id },
      { ...body, user_id: user.id },
      { new: true }
    );

    if (!settings) {
      return NextResponse.json({ success: false, message: 'Settings not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: settings });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const settings = await ExpenseSettings.findOneAndDelete({ _id: id, user_id: user.id });

    if (!settings) {
      return NextResponse.json({ success: false, message: 'Settings not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Settings deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}