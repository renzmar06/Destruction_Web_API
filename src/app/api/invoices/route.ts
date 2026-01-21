import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Invoice from '@/models/Invoice';

export async function GET() {
  try {
    await connectDB();
    const invoices = await Invoice.find().sort({ createdAt: -1 });
    return NextResponse.json(invoices);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const data = await request.json();
    
    console.log('Creating invoice with data:', data);
    
    const invoice = new Invoice(data);
    await invoice.save();
    return NextResponse.json(invoice, { status: 201 });
  } catch (error: any) {
    console.error('Invoice creation error:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to create invoice',
      details: error.errors || error
    }, { status: 500 });
  }
}