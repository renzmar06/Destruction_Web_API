import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Estimate from '@/models/Estimate';

export async function GET() {
  try {
    await connectDB(); 
    const estimates = await Estimate.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: estimates });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch estimates' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    
    // Generate estimate number if not provided
    if (!body.estimate_number) {
      const count = await Estimate.countDocuments();
      body.estimate_number = `EST-${String(count + 1).padStart(4, '0')}`;
    }
    
    const estimate = await Estimate.create(body);
    return NextResponse.json({ success: true, data: estimate }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to create estimate' }, { status: 500 });
  }
}