import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Pipeline from '@/models/Pipeline';

export async function GET() {
  try {
    await connectDB();
    const pipelines = await Pipeline.find().sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: pipelines });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const pipeline = await Pipeline.create(body);
    return NextResponse.json({ success: true, data: pipeline }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
