import { NextRequest, NextResponse } from 'next/server';
import CustomerTask from '@/models/CustomerTask';
import { connectDB } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const url = new URL(request.url);
    const customer_id = url.searchParams.get('customer_id');
    
    const query = customer_id ? { customer_id } : {};
    const tasks = await CustomerTask.find(query).sort({ createdAt: -1 });
    
    return NextResponse.json({
      success: true,
      data: tasks
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['title', 'description', 'customer_id'];
    const missingFields = requiredFields.filter(field => !body[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { success: false, message: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    const task = new CustomerTask(body);
    await task.save();
    
    return NextResponse.json({
      success: true,
      message: 'Task created successfully',
      data: task
    });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create task', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}