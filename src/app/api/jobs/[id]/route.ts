import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Job from '@/models/Job';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    const updateData = await request.json();
    
    const job = await Job.findByIdAndUpdate(id, updateData, { new: true });
    
    if (!job) {
      return NextResponse.json({ 
        success: false, 
        message: 'Job not found',
        data: null 
      }, { status: 404 });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Job updated successfully',
      data: job 
    });
  } catch (error) {
    console.error('Error updating job:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to update job',
      data: null 
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    
    const job = await Job.findByIdAndDelete(id);
    
    if (!job) {
      return NextResponse.json({ 
        success: false, 
        message: 'Job not found',
        data: null 
      }, { status: 404 });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Job deleted successfully',
      data: job 
    });
  } catch (error) {
    console.error('Error deleting job:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to delete job',
      data: null 
    }, { status: 500 });
  }
}