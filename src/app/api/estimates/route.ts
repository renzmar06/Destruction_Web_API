import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Estimate from '@/models/Estimate';
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
    let estimates;
    
    if (user?.role === 'admin') {
      // Admin can see all estimates
      estimates = await Estimate.find().sort({ createdAt: -1 });
    } else {
      // Regular users see only their estimates
      estimates = await Estimate.find({ user_id: userId }).sort({ createdAt: -1 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Estimates fetched successfully',
      data: estimates 
    });
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to fetch estimates',
      data: null 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { userId } = getUserFromRequest(request);
    const body = await request.json();
    
    // Generate unique estimate number if not provided
    if (!body.estimate_number) {
      let estimateNumber;
      let isUnique = false;
      let counter = 1;
      
      while (!isUnique) {
        estimateNumber = `EST-${String(counter).padStart(4, '0')}`;
        const existing = await Estimate.findOne({ estimate_number: estimateNumber });
        if (!existing) {
          isUnique = true;
        } else {
          counter++;
        }
      }
      
      body.estimate_number = estimateNumber;
    }
    
    // Convert date strings to Date objects
    if (body.estimate_date) {
      body.estimate_date = new Date(body.estimate_date);
    }
    if (body.valid_until_date) {
      body.valid_until_date = new Date(body.valid_until_date);
    }
    
    const estimate = await Estimate.create({ ...body, user_id: userId });
    return NextResponse.json({ 
      success: true, 
      message: 'Estimate created successfully',
      data: estimate 
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating estimate:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to create estimate',
      data: null 
    }, { status: 500 });
  }
}