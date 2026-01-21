import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Invoice from '@/models/Invoice';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    const invoice = await Invoice.findById(id);
    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }
    return NextResponse.json(invoice);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch invoice' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    const data = await request.json();
    const invoice = await Invoice.findByIdAndUpdate(id, data, { new: true });
    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }
    return NextResponse.json(invoice);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update invoice' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    const invoice = await Invoice.findByIdAndDelete(id);
    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Invoice deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete invoice' }, { status: 500 });
  }
}