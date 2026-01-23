import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Expense from '@/models/Expense';
import Vendor from '@/models/Vendor';
import { getUserFromRequest } from '@/lib/auth';
import { sendEmail } from '@/lib/emailService';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { userId } = getUserFromRequest(request);
    
    if (!userId) {
      return NextResponse.json({ 
        success: false, 
        message: 'User authentication required' 
      }, { status: 401 });
    }

    const { id } = await params;
    const expense = await Expense.findById(id);
    
    if (!expense) {
      return NextResponse.json({ 
        success: false, 
        message: 'Expense not found' 
      }, { status: 404 });
    }

    // Find vendor email
    const vendor = await Vendor.findOne({ vendor_name: expense.vendor_name });
    const vendorEmail = vendor?.email;
    
    if (!vendorEmail) {
      return NextResponse.json({ 
        success: false, 
        message: 'Vendor email not found' 
      }, { status: 400 });
    }

    // Update expense status to submitted
    expense.expense_status = 'submitted';
    await expense.save();

    // Create email content
    const subject = `Expense Approval Required - ${expense.expense_id}`;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Expense Approval Request</h2>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Expense Details</h3>
          <p><strong>Expense ID:</strong> ${expense.expense_id}</p>
          <p><strong>Vendor:</strong> ${expense.vendor_name}</p>
          <p><strong>Type:</strong> ${expense.expense_type}</p>
          <p><strong>Amount:</strong> $${expense.amount.toFixed(2)}</p>
          <p><strong>Date:</strong> ${new Date(expense.expense_date).toLocaleDateString()}</p>
          <p><strong>Description:</strong> ${expense.description}</p>
        </div>

        <p>This expense has been submitted for your approval. Please review the details and take appropriate action.</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${baseUrl}/api/expenses/${expense._id}/approve" 
             style="background: #22c55e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 0 10px; display: inline-block;">
            ✓ Approve
          </a>
          <a href="${baseUrl}/api/expenses/${expense._id}/reject" 
             style="background: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 0 10px; display: inline-block;">
            ✗ Reject
          </a>
        </div>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 12px;">
          <p>This is an automated message. Please do not reply to this email.</p>
        </div>
      </div>
    `;

    // Send email
    const emailResult = await sendEmail(vendorEmail, subject, html);
    
    if (!emailResult.success) {
      return NextResponse.json({ 
        success: false, 
        message: 'Failed to send email' 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Expense submitted for approval and email sent successfully' 
    });
  } catch (error) {
    console.error('Error sending approval email:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to send approval email' 
    }, { status: 500 });
  }
}