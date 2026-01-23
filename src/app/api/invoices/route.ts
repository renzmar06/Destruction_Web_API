import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
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
    let invoices;
    
    if (user?.role === 'admin') {
      // Admin can see all invoices
      invoices = await Invoice.find().sort({ createdAt: -1 });
    } else if (user?.role === 'customer') {
      // Customer sees invoices where they are the customer
      invoices = await Invoice.find({ customer_id: userId }).sort({ createdAt: -1 });
    } else {
      // Regular users see only their invoices
      invoices = await Invoice.find({ user_id: userId }).sort({ createdAt: -1 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Invoices fetched successfully',
      data: invoices 
    });
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to fetch invoices',
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
    console.log('Creating invoice for user:', userId);
    console.log('Invoice data:', data);
    
    // Generate unique invoice number if not provided
    if (!data.invoice_number) {
      let invoiceNumber;
      let isUnique = false;
      let counter = 1;
      
      while (!isUnique) {
        invoiceNumber = `INV-${String(counter).padStart(4, '0')}`;
        const existing = await Invoice.findOne({ invoice_number: invoiceNumber });
        if (!existing) {
          isUnique = true;
        } else {
          counter++;
        }
      }
      
      data.invoice_number = invoiceNumber;
    }
    
    // Convert date strings to Date objects if needed
    if (data.issue_date && typeof data.issue_date === 'string') {
      data.issue_date = new Date(data.issue_date);
    }
    if (data.due_date && typeof data.due_date === 'string') {
      data.due_date = new Date(data.due_date);
    }
    
    // Ensure user_id and customer_id are set
    const invoiceData = { 
      ...data, 
      user_id: userId,
      customer_id: data.customer_id || data.customerId // Handle both field names
    };
    console.log('Final invoice data with user_id:', invoiceData);
    
    const invoice = new Invoice(invoiceData);
    const savedInvoice = await invoice.save();
    
    console.log('Saved invoice:', savedInvoice);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Invoice created successfully',
      data: savedInvoice 
    }, { status: 201 });
  } catch (error: any) {
    console.error('Invoice creation error:', error);
    return NextResponse.json({ 
      success: false, 
      message: error.message || 'Failed to create invoice',
      data: null 
    }, { status: 500 });
  }
}