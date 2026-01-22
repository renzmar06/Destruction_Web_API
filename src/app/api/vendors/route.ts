import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Vendor from '@/models/Vendor';
import User from '@/models/User';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
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

    // Check if user is admin
    const user = await User.findById(userId);
    let vendors;
    
    if (user?.role === 'admin') {
      // Admin can see all vendors
      vendors = await Vendor.find().sort({ createdAt: -1 });
    } else {
      // Regular users see only their vendors
      vendors = await Vendor.find({ user_id: userId }).sort({ createdAt: -1 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Vendors fetched successfully',
      data: vendors 
    });
  } catch (error) {
    console.error('Error fetching vendors:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to fetch vendors',
      data: null 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
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
    
    const vendor = new Vendor({ ...data, user_id: userId });
    const savedVendor = await vendor.save();
    
    return NextResponse.json({ 
      success: true, 
      message: 'Vendor created successfully',
      data: savedVendor 
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating vendor:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to create vendor',
      data: null 
    }, { status: 500 });
  }
}