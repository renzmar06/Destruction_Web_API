import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
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
        user: null 
      }, { status: 401 });
    }

    const user = await User.findById(userId).select('-password');
    if (!user) {
      return NextResponse.json({ 
        success: false, 
        message: 'User not found',
        user: null 
      }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'User fetched successfully',
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role
      }
    });
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to fetch user',
      user: null 
    }, { status: 500 });
  }
}