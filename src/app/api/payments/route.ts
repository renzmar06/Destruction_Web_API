import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Payment from '@/models/Payment';
import Invoice from '@/models/Invoice';
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
    let payments;
    
    if (user?.role === 'admin') {
      // Admin can see all payments
      payments = await Payment.find().sort({ createdAt: -1 });
    } else {
      // Regular users see only their payments
      payments = await Payment.find({ user_id: userId }).sort({ createdAt: -1 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Payments fetched successfully',
      data: payments 
    });
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to fetch payments',
      data: null 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { userId } = getUserFromRequest(request);
    const body = await request.json();
    
    // Generate unique payment number
    const paymentCount = await Payment.countDocuments();
    const paymentNumber = `PAY-${String(paymentCount + 1).padStart(4, '0')}`;
    
    // Process payment allocations and update invoices
    const allocations = [];
    for (const allocation of body.allocations) {
      const invoice = await Invoice.findById(allocation.invoice_id);
      if (!invoice) continue;
      
      const balanceBefore = invoice.balance_due;
      const amountApplied = Math.min(allocation.amount_applied, balanceBefore);
      const balanceAfter = balanceBefore - amountApplied;
      
      // Update invoice
      await Invoice.findByIdAndUpdate(allocation.invoice_id, {
        balance_due: balanceAfter,
        invoice_status: balanceAfter <= 0 ? 'paid' : 'sent'
      });
      
      allocations.push({
        invoice_id: allocation.invoice_id,
        invoice_number: invoice.invoice_number,
        amount_applied: amountApplied,
        balance_before: balanceBefore,
        balance_after: balanceAfter
      });
    }
    
    const payment = await Payment.create({
      ...body,
      payment_number: paymentNumber,
      user_id: body.user_id || userId,
      allocations,
      payment_date: new Date(body.payment_date)
    });
    
    return NextResponse.json({ 
      success: true, 
      message: 'Payment recorded successfully',
      data: payment 
    }, { status: 201 });
  } catch (error) {
    console.error('Error recording payment:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to record payment',
      data: null 
    }, { status: 500 });
  }
}