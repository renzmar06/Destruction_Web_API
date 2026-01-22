import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import ProductService from '@/models/Service';
import User from '@/models/User';
import { getUserFromRequest } from '@/lib/auth';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { userId } = getUserFromRequest(request);
    
    if (!userId) {
      return NextResponse.json({ 
        success: false, 
        message: 'User authentication required',
        data: null 
      }, { status: 401 });
    }

    const data = await request.json();
    const { id } = await params;

    // Check if user is admin or owns the service
    const user = await User.findById(userId);
    const service = await ProductService.findById(id);
    
    if (!service) {
      return NextResponse.json({ 
        success: false, 
        message: 'Service not found',
        data: null 
      }, { status: 404 });
    }

    if (user?.role !== 'admin' && service.user_id.toString() !== userId) {
      return NextResponse.json({ 
        success: false, 
        message: 'Access denied',
        data: null 
      }, { status: 403 });
    }

    const updatedService = await ProductService.findByIdAndUpdate(id, data, { new: true });
    
    return NextResponse.json({ 
      success: true, 
      message: 'Service updated successfully',
      data: updatedService 
    });
  } catch (error) {
    console.error('Error updating service:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to update service',
      data: null 
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { userId } = getUserFromRequest(request);
    
    if (!userId) {
      return NextResponse.json({ 
        success: false, 
        message: 'User authentication required',
        data: null 
      }, { status: 401 });
    }

    const { id } = await params;

    // Check if user is admin or owns the service
    const user = await User.findById(userId);
    const service = await ProductService.findById(id);
    
    if (!service) {
      return NextResponse.json({ 
        success: false, 
        message: 'Service not found',
        data: null 
      }, { status: 404 });
    }

    if (user?.role !== 'admin' && service.user_id.toString() !== userId) {
      return NextResponse.json({ 
        success: false, 
        message: 'Access denied',
        data: null 
      }, { status: 403 });
    }

    await ProductService.findByIdAndDelete(id);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Service deleted successfully',
      data: null 
    });
  } catch (error) {
    console.error('Error deleting service:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to delete service',
      data: null 
    }, { status: 500 });
  }
}