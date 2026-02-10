import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import CrmTask from '@/models/CrmTask';
import { getUserFromRequest } from '@/lib/auth';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { userId } = getUserFromRequest(request);
    const body = await request.json();
    const { id } = await params;
    
    if (!userId) {
      return NextResponse.json({ 
        success: false, 
        message: 'Authentication required',
        data: null 
      }, { status: 401 });
    }

    const task = await CrmTask.findOneAndUpdate(
      { _id: id, user_id: userId },
      body,
      { new: true }
    );

    if (!task) {
      return NextResponse.json({ 
        success: false, 
        message: 'Task not found',
        data: null 
      }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Task updated successfully',
      data: task 
    });
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to update task',
      data: null 
    }, { status: 500 });
  }
}
