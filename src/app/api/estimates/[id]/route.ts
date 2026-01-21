import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Estimate from '@/models/Estimate';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    const estimate = await Estimate.findById(id);
    if (!estimate) {
      return NextResponse.json({ success: false, error: 'Estimate not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: estimate });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch estimate' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json();
    const estimate = await Estimate.findByIdAndUpdate(id, body, { new: true });
    if (!estimate) {
      return NextResponse.json({ success: false, error: 'Estimate not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: estimate });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update estimate' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    const estimate = await Estimate.findByIdAndDelete(id);
    if (!estimate) {
      return NextResponse.json({ success: false, error: 'Estimate not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Estimate deleted successfully' });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete estimate' }, { status: 500 });
  }
}