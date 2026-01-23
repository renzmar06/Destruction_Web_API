import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Expense from '@/models/Expense';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    
    const expense = await Expense.findById(id);
    if (!expense) {
      return new Response(`
        <html><body style="font-family: Arial; text-align: center; padding: 50px;">
          <h2 style="color: #ef4444;">Expense not found</h2>
        </body></html>
      `, { headers: { 'Content-Type': 'text/html' } });
    }

    expense.expense_status = 'approved';
    await expense.save();

    return new Response(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Expense Approved</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; display: flex; align-items: center; justify-content: center; }
          .container { background: white; padding: 60px 40px; border-radius: 20px; box-shadow: 0 20px 40px rgba(0,0,0,0.1); text-align: center; max-width: 500px; }
          .icon { font-size: 80px; color: #22c55e; margin-bottom: 20px; }
          h1 { color: #1f2937; margin: 0 0 10px 0; font-size: 32px; font-weight: 700; }
          p { color: #6b7280; font-size: 18px; margin: 0 0 30px 0; line-height: 1.6; }
          .expense-id { background: #f3f4f6; padding: 12px 20px; border-radius: 8px; font-family: monospace; font-weight: 600; color: #374151; display: inline-block; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="icon">✅</div>
          <h1>Expense Approved!</h1>
          <p>The expense has been successfully approved and processed.</p>
          <div class="expense-id">${expense.expense_id}</div>
        </div>
      </body>
      </html>
    `, { headers: { 'Content-Type': 'text/html' } });
  } catch (error) {
    console.error('Error approving expense:', error);
    return new Response(`
      <html><body style="font-family: Arial; text-align: center; padding: 50px;">
        <h2 style="color: #ef4444;">Error</h2>
        <p>Failed to approve expense. Please try again.</p>
      </body></html>
    `, { headers: { 'Content-Type': 'text/html' } });
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    
    const expense = await Expense.findById(id);
    if (!expense) {
      return NextResponse.json({ 
        success: false, 
        message: 'Expense not found' 
      }, { status: 404 });
    }

    expense.expense_status = 'approved';
    await expense.save();

    return NextResponse.json({ 
      success: true, 
      message: 'Expense approved successfully' 
    });
  } catch (error) {
    console.error('Error approving expense:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to approve expense' 
    }, { status: 500 });
  }
}