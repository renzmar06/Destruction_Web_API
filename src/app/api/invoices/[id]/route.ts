import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Invoice from '@/models/Invoice';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    
    // Check if this is a payment request (public access)
    const url = new URL(request.url);
    const isPaymentRequest = url.searchParams.get('payment') === 'true';
    
    if (isPaymentRequest) {
      // Allow public access for payment page
      const invoice = await Invoice.findById(id);
      if (!invoice) {
        return NextResponse.json({ 
          success: false, 
          message: 'Invoice not found',
          data: null 
        }, { status: 404 });
      }
      return NextResponse.json({ 
        success: true, 
        message: 'Invoice fetched successfully',
        data: invoice 
      });
    } else {
      // Require authentication for regular access
      const { userId } = getUserFromRequest(request);
      const invoice = await Invoice.findOne({ _id: id, user_id: userId });
      if (!invoice) {
        return NextResponse.json({ 
          success: false, 
          message: 'Invoice not found',
          data: null 
        }, { status: 404 });
      }
      return NextResponse.json({ 
        success: true, 
        message: 'Invoice fetched successfully',
        data: invoice 
      });
    }
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to fetch invoice',
      data: null 
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { userId } = getUserFromRequest(request);
    const { id } = await params;
    const data = await request.json();
    const invoice = await Invoice.findOneAndUpdate(
      { _id: id, user_id: userId }, 
      data, 
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

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { userId } = getUserFromRequest(request);
    const { id } = await params;
    
      // Check if user is admin
    const User = (await import('@/models/User')).default;
    const user = await User.findById(userId);
    
    let invoice;
    if (user?.role === 'admin') {
      // Admin can delete any invoice
      invoice = await Invoice.findByIdAndDelete(id);
    } else {
      // Regular users can only delete their own invoices
      invoice = await Invoice.findOneAndDelete({ _id: id, user_id: userId });
    }
    
    if (!invoice) {
      return NextResponse.json({ 
        success: false, 
        message: 'Invoice not found or access denied',
        data: null 
      }, { status: 404 });
    }
    return NextResponse.json({ 
      success: true, 
      message: 'Invoice deleted successfully',
      data: invoice 
    });
  } catch (error) {
    console.error('Delete invoice error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to delete invoice',
      data: null 
    }, { status: 500 });
  }
}