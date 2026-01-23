import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Expense from '@/models/Expense';
import User from '@/models/User';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    const { id } = await params;
    const user = await User.findById(userId);
    const expense = await Expense.findById(id);
    
    if (!expense) {
      return NextResponse.json({ 
        success: false, 
        message: 'Expense not found',
        data: null 
      }, { status: 404 });
    }

    if (user?.role !== 'admin' && expense.user_id.toString() !== userId) {
      return NextResponse.json({ 
        success: false, 
        message: 'Access denied',
        data: null 
      }, { status: 403 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Expense fetched successfully',
      data: expense 
    });
  } catch (error) {
    console.error('Error fetching expense:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to fetch expense',
      data: null 
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
    const { id } = await params;

    // Check if user is admin or owns the expense
    const user = await User.findById(userId);
    const expense = await Expense.findById(id);
    
    if (!expense) {
      return NextResponse.json({ 
        success: false, 
        message: 'Expense not found',
        data: null 
      }, { status: 404 });
    }

    if (user?.role !== 'admin' && expense.user_id.toString() !== userId) {
      return NextResponse.json({ 
        success: false, 
        message: 'Access denied',
        data: null 
      }, { status: 403 });
    }

    const updatedExpense = await Expense.findByIdAndUpdate(id, {
      ...data,
      payment_method: data.payment_method || undefined
    }, { new: true });
    
    return NextResponse.json({ 
      success: true, 
      message: 'Expense updated successfully',
      data: updatedExpense 
    });
  } catch (error) {
    console.error('Error updating expense:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to update expense',
      data: null 
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    const { id } = await params;

    // Check if user is admin or owns the expense
    const user = await User.findById(userId);
    const expense = await Expense.findById(id);
    
    if (!expense) {
      return NextResponse.json({ 
        success: false, 
        message: 'Expense not found',
        data: null 
      }, { status: 404 });
    }

    if (user?.role !== 'admin' && expense.user_id.toString() !== userId) {
      return NextResponse.json({ 
        success: false, 
        message: 'Access denied',
        data: null 
      }, { status: 403 });
    }

    await Expense.findByIdAndDelete(id);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Expense deleted successfully',
      data: null 
    });
  } catch (error) {
    console.error('Error deleting expense:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to delete expense',
      data: null 
    }, { status: 500 });
  }
}