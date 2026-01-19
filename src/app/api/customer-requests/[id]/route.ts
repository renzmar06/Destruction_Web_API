import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// GET - Get single customer request
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const db = await connectDB();
    const requests = db.collection('customer_requests');
    
    const customerRequest = await requests.findOne({ _id: new ObjectId(params.id) });
    
    if (!customerRequest) {
      return NextResponse.json(
        { success: false, message: 'Request not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: customerRequest
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to fetch request' },
      { status: 500 }
    );
  }
}

// PUT - Update customer request
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    
    const db = await connectDB();
    const requests = db.collection('customer_requests');
    
    const updateData = {
      ...body,
      updated_date: new Date().toISOString()
    };
    
    const result = await requests.updateOne(
      { _id: new ObjectId(params.id) },
      { $set: updateData }
    );
    
    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, message: 'Request not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Request updated successfully'
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to update request' },
      { status: 500 }
    );
  }
}

// DELETE - Delete customer request
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const db = await connectDB();
    const requests = db.collection('customer_requests');
    
    const result = await requests.deleteOne({ _id: new ObjectId(params.id) });
    
    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, message: 'Request not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Request deleted successfully'
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to delete request' },
      { status: 500 }
    );
  }
}