import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Pipeline from '@/models/Pipeline';

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const body = await req.json();
    const { id } = await context.params;
    const pipeline = await Pipeline.findByIdAndUpdate(id, body, { new: true });
    if (!pipeline) {
      return NextResponse.json({ success: false, message: 'Pipeline not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: pipeline });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await context.params;
    const pipeline = await Pipeline.findByIdAndDelete(id);
    if (!pipeline) {
      return NextResponse.json({ success: false, message: 'Pipeline not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Pipeline deleted' });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
