import { NextRequest, NextResponse } from 'next/server';
import ServiceRequest from '@/models/ServiceRequest';
import { connectDB } from '@/lib/mongodb';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const { id } = params;
    const body = await request.json();
    
    const updatedRequest = await ServiceRequest.findByIdAndUpdate(
      id,
      { ...body, updatedAt: new Date() },
      { new: true }
    );

    if (!updatedRequest) {
      return NextResponse.json(
        { success: false, message: 'Request not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Request updated successfully',
      data: updatedRequest
    });

  } catch (error) {
    console.error('Error updating service request:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update service request' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const { id } = params;
    
    const deletedRequest = await ServiceRequest.findByIdAndDelete(id);

    if (!deletedRequest) {
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
    console.error('Error deleting service request:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete service request' },
      { status: 500 }
    );
  }
}