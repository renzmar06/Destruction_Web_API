import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import CrmEstimate from '@/models/CrmEstimate';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { userId } = getUserFromRequest(request);
    
    if (!userId) {
      return NextResponse.json({ 
        success: false, 
        message: 'Authentication required',
        data: null 
      }, { status: 401 });
    }

    const estimates = await CrmEstimate.find({}).sort({ created_date: -1 });

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
    
    if (!userId) {
      return NextResponse.json({ 
        success: false, 
        message: 'Authentication required',
        data: null 
      }, { status: 401 });
    }

    const estimate = await CrmEstimate.create({ ...body, user_id: userId });
    
    return NextResponse.json({ 
      success: true, 
      message: 'Estimate created successfully',
      data: estimate 
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to create estimate',
      data: null 
    }, { status: 500 });
  }
}
