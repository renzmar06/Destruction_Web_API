import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { userId, userEmail } = getUserFromRequest(request);
    
    return NextResponse.json({
      success: true,
      user: {
        id: userId,
        email: userEmail
      }
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Invalid token or user not found' },
      { status: 401 }
    );
  }
}