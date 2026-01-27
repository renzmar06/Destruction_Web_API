import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Affidavit from '@/models/Affidavit';
import User from '@/models/User';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { userId } = getUserFromRequest(request);
    const { id } = await params;
    
    if (!userId) {
      return NextResponse.json({ 
        success: false, 
        message: 'User authentication required',
        data: null 
      }, { status: 401 });
    }

    // Check if user is admin or owns the affidavit
    const user = await User.findById(userId);
    const affidavit = await Affidavit.findById(id).populate('job_id');

    if (!affidavit) {
      return NextResponse.json({ 
        success: false, 
        message: 'Affidavit not found',
        data: null 
      }, { status: 404 });
    }

    if (user?.role !== 'admin' && affidavit.user_id.toString() !== userId) {
      return NextResponse.json({ 
        success: false, 
        message: 'Access denied',
        data: null 
      }, { status: 403 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Affidavit fetched successfully',
      data: affidavit 
    });
  } catch (error) {
    console.error('Error fetching affidavit:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to fetch affidavit',
      data: null 
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { userId } = getUserFromRequest(request);
    const { id } = await params;
    
    if (!userId) {
      return NextResponse.json({ 
        success: false, 
        message: 'User authentication required',
        data: null 
      }, { status: 401 });
    }

    const data = await request.json();
    
    // Check if user is admin or owns the affidavit
    const user = await User.findById(userId);
    const affidavit = await Affidavit.findById(id);

    if (!affidavit) {
      return NextResponse.json({ 
        success: false, 
        message: 'Affidavit not found',
        data: null 
      }, { status: 404 });
    }

    if (user?.role !== 'admin' && affidavit.user_id.toString() !== userId) {
      return NextResponse.json({ 
        success: false, 
        message: 'Access denied',
        data: null 
      }, { status: 403 });
    }

    const updatedAffidavit = await Affidavit.findByIdAndUpdate(
      id,
      data,
      { new: true, runValidators: true }
    );

    return NextResponse.json({ 
      success: true, 
      message: 'Affidavit updated successfully',
      data: updatedAffidavit 
    });
  } catch (error) {
    console.error('Error updating affidavit:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to update affidavit',
      data: null 
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { userId } = getUserFromRequest(request);
    const { id } = await params;
    
    if (!userId) {
      return NextResponse.json({ 
        success: false, 
        message: 'User authentication required',
        data: null 
      }, { status: 401 });
    }

    // Check if user is admin or owns the affidavit
    const user = await User.findById(userId);
    const affidavit = await Affidavit.findById(id);

    if (!affidavit) {
      return NextResponse.json({ 
        success: false, 
        message: 'Affidavit not found',
        data: null 
      }, { status: 404 });
    }

    if (user?.role !== 'admin' && affidavit.user_id.toString() !== userId) {
      return NextResponse.json({ 
        success: false, 
        message: 'Access denied',
        data: null 
      }, { status: 403 });
    }

    await Affidavit.findByIdAndDelete(id);

    return NextResponse.json({ 
      success: true, 
      message: 'Affidavit deleted successfully',
      data: null 
    });
  } catch (error) {
    console.error('Error deleting affidavit:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to delete affidavit',
      data: null 
    }, { status: 500 });
  }
}