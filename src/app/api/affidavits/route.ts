import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Affidavit from '@/models/Affidavit';
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
    let affidavits;
    
    if (user?.role === 'admin') {
      // Admin can see all affidavits
      affidavits = await Affidavit.find().populate('job_id').sort({ createdAt: -1 });
    } else {
      // Regular users see only their affidavits
      affidavits = await Affidavit.find({ user_id: userId }).populate('job_id').sort({ createdAt: -1 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Affidavits fetched successfully',
      data: affidavits 
    });
  } catch (error) {
    console.error('Error fetching affidavits:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to fetch affidavits',
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
    
    // Generate unique affidavit number
    let affidavitNumber;
    let isUnique = false;
    let counter = 1;
    
    while (!isUnique) {
      affidavitNumber = `AFF-${String(counter).padStart(4, '0')}`;
      const existing = await Affidavit.findOne({ affidavit_number: affidavitNumber });
      if (!existing) {
        isUnique = true;
      } else {
        counter++;
      }
    }
    
    const affidavit = new Affidavit({
      ...data,
      affidavit_number: affidavitNumber,
      user_id: userId
    });
    
    const savedAffidavit = await affidavit.save();
    
    return NextResponse.json({ 
      success: true, 
      message: 'Affidavit created successfully',
      data: savedAffidavit 
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating affidavit:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to create affidavit',
      data: null 
    }, { status: 500 });
  }
}