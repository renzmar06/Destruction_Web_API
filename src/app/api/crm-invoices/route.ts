import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import CrmInvoice from '@/models/CrmInvoice';
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

    const invoices = await CrmInvoice.find({}).sort({ created_date: -1 });

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
    const body = await request.json();
    
    if (!userId) {
      return NextResponse.json({ 
        success: false, 
        message: 'Authentication required',
        data: null 
      }, { status: 401 });
    }

    const invoice = await CrmInvoice.create({ ...body, user_id: userId });
    
    return NextResponse.json({ 
      success: true, 
      message: 'Invoice created successfully',
      data: invoice 
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to create invoice',
      data: null 
    }, { status: 500 });
  }
}
