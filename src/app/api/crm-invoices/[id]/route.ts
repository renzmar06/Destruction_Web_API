import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import CrmInvoice from '@/models/CrmInvoice';
import { getUserFromRequest } from '@/lib/auth';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { userId } = getUserFromRequest(request);
    const body = await request.json();
    const { id } = await params;
    
    if (!userId) {
      return NextResponse.json({ 
        success: false, 
        message: 'Authentication required',
        data: null 
      }, { status: 401 });
    }

    const invoice = await CrmInvoice.findOneAndUpdate(
      { _id: id, user_id: userId },
      body,
      { new: true }
    );

    if (!invoice) {
      return NextResponse.json({ 
        success: false, 
        message: 'Invoice not found',
        data: null 
      }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Invoice updated successfully',
      data: invoice 
    });
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to update invoice',
      data: null 
    }, { status: 500 });
  }
}
