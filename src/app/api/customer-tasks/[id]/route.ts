import { NextRequest, NextResponse } from 'next/server';
import CustomerTask from '@/models/CustomerTask';
import { connectDB } from '@/lib/mongodb';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json();
    
    const updatedTask = await CustomerTask.findByIdAndUpdate(
      id,
      { ...body, updatedAt: new Date() },
      { new: true }
    );

    if (!updatedTask) {
      return NextResponse.json(
        { success: false, message: 'Task not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Task updated successfully',
      data: updatedTask
    });
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update task' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    
    const deletedTask = await CustomerTask.findByIdAndDelete(id);

    if (!deletedTask) {
      return NextResponse.json(
        { success: false, message: 'Task not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete task' },
      { status: 500 }
    );
  }
}