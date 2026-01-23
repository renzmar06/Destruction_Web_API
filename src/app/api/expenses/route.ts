import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Expense from '@/models/Expense';
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
    let expenses;
    
    if (user?.role === 'admin') {
      // Admin can see all expenses
      expenses = await Expense.find().populate('job_id').sort({ createdAt: -1 });
    } else {
      // Regular users see only their expenses
      expenses = await Expense.find({ user_id: userId }).populate('job_id').sort({ createdAt: -1 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Expenses fetched successfully',
      data: expenses 
    });
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to fetch expenses',
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
    
    // Generate unique expense ID
    let expenseId;
    let isUnique = false;
    let counter = 1001;
    
    while (!isUnique) {
      expenseId = `EXP-${counter}`;
      const existing = await Expense.findOne({ expense_id: expenseId });
      if (!existing) {
        isUnique = true;
      } else {
        counter++;
      }
    }
    
    const expense = new Expense({
      ...data,
      expense_id: expenseId,
      user_id: userId,
      payment_method: data.payment_method || undefined
    });
    
    const savedExpense = await expense.save();
    
    return NextResponse.json({ 
      success: true, 
      message: 'Expense created successfully',
      data: savedExpense 
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating expense:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to create expense',
      data: null 
    }, { status: 500 });
  }
}