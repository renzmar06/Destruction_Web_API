import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import CrmTask from '@/models/CrmTask';
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

    const tasks = await CrmTask.find({ user_id: userId }).sort({ created_date: -1 });

    return NextResponse.json({ 
      success: true, 
      message: 'Tasks fetched successfully',
      data: tasks 
    });
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to fetch tasks',
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

    const task = await CrmTask.create({ ...body, user_id: userId });
    
    return NextResponse.json({ 
      success: true, 
      message: 'Task created successfully',
      data: task 
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to create task',
      data: null 
    }, { status: 500 });
  }
}
