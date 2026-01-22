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
    
    // Don't update estimate_number if it's empty
    if (body.estimate_number === '') {
      delete body.estimate_number;
    }
    
    // Convert date strings to Date objects
    if (body.estimate_date) {
      body.estimate_date = new Date(body.estimate_date);
    }
    if (body.valid_until_date) {
      body.valid_until_date = new Date(body.valid_until_date);
    }
    
    const estimate = await Estimate.findByIdAndUpdate(id, body, { new: true });
    if (!estimate) {
      return NextResponse.json({ 
        success: false, 
        message: 'Estimate not found',
        data: null 
      }, { status: 404 });
    }
    return NextResponse.json({ 
      success: true, 
      message: 'Estimate updated successfully',
      data: estimate 
    });
  } catch (error) {
    console.error('Error updating estimate:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to update estimate',
      data: null 
    }, { status: 500 });
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