import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Vendor from '@/models/Vendor';
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
    const { id: vendorId } = await params;

    // Check if user is admin or owns the vendor
    const user = await User.findById(userId);
    const vendor = await Vendor.findById(vendorId);

    if (!vendor) {
      return NextResponse.json({ 
        success: false, 
        message: 'Vendor not found',
        data: null 
      }, { status: 404 });
    }

    if (user?.role !== 'admin' && vendor.user_id.toString() !== userId) {
      return NextResponse.json({ 
        success: false, 
        message: 'Access denied',
        data: null 
      }, { status: 403 });
    }

    const updatedVendor = await Vendor.findByIdAndUpdate(
      vendorId,
      data,
      { new: true, runValidators: true }
    );

    return NextResponse.json({ 
      success: true, 
      message: 'Vendor updated successfully',
      data: updatedVendor 
    });
  } catch (error) {
    console.error('Error updating vendor:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to update vendor',
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

    const { id: vendorId } = await params;

    // Check if user is admin or owns the vendor
    const user = await User.findById(userId);
    const vendor = await Vendor.findById(vendorId);

    if (!vendor) {
      return NextResponse.json({ 
        success: false, 
        message: 'Vendor not found',
        data: null 
      }, { status: 404 });
    }

    if (user?.role !== 'admin' && vendor.user_id.toString() !== userId) {
      return NextResponse.json({ 
        success: false, 
        message: 'Access denied',
        data: null 
      }, { status: 403 });
    }

    await Vendor.findByIdAndDelete(vendorId);

    return NextResponse.json({ 
      success: true, 
      message: 'Vendor deleted successfully',
      data: null 
    });
  } catch (error) {
    console.error('Error deleting vendor:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to delete vendor',
      data: null 
    }, { status: 500 });
  }
}