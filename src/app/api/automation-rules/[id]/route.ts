import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import AutomationRule from '@/models/AutomationRule';
import { getUserFromRequest } from '@/lib/auth';
import mongoose from 'mongoose';

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { userId } = getUserFromRequest(req);
    
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const params = await context.params;
    const body = await req.json();
    const rule = await AutomationRule.findOneAndUpdate(
      { _id: params.id, user_id: userId },
      body,
      { new: true }
    );
    
    if (!rule) {
      return NextResponse.json({ success: false, error: 'Rule not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, data: rule });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { userId } = getUserFromRequest(req);
    
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const params = await context.params;
    const rule = await AutomationRule.findById(params.id);
    
    if (!rule) {
      return NextResponse.json({ success: false, error: 'Rule not found' }, { status: 404 });
    }

    if (rule.user_id.toString() !== userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    await AutomationRule.findByIdAndDelete(params.id);
    
    return NextResponse.json({ success: true, data: rule });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { userId } = getUserFromRequest(req);
    
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const params = await context.params;
    const rule = await AutomationRule.findOneAndUpdate(
      { _id: params.id, user_id: userId },
      { $inc: { run_count: 1 } },
      { new: true }
    );
    
    if (!rule) {
      return NextResponse.json({ success: false, error: 'Rule not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, data: rule, message: 'Rule executed successfully' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
