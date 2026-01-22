import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import ProductService from '@/models/Service';
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
    let services;
    
    if (user?.role === 'admin') {
      // Admin can see all services
      services = await ProductService.find().sort({ createdAt: -1 });
    } else {
      // Regular users see only their services
      services = await ProductService.find({ user_id: userId }).sort({ createdAt: -1 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Services fetched successfully',
      data: services 
    });
  } catch (error) {
    console.error('Error fetching services:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to fetch services',
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
    
    const service = new ProductService({ ...data, user_id: userId });
    const savedService = await service.save();
    
    return NextResponse.json({ 
      success: true, 
      message: 'Service created successfully',
      data: savedService 
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating service:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to create service',
      data: null 
    }, { status: 500 });
  }
}