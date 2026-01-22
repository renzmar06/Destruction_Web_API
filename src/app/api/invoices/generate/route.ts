import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Invoice from '@/models/Invoice';
import Job from '@/models/Job';
import Estimate from '@/models/Estimate';
import { getUserFromRequest } from '@/lib/auth';

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

    const { jobId, customerId, estimateId } = await request.json();

    // Get job, estimate, and customer data
    const job = await Job.findById(jobId);
    const estimate = await Estimate.findById(estimateId);
    const Customer = (await import('@/models/Customer')).default;
    const customer = await Customer.findById(customerId);

    if (!job || !estimate || !customer) {
      return NextResponse.json({ 
        success: false, 
        message: 'Job, estimate, or customer not found',
        data: null 
      }, { status: 404 });
    }

    // Generate invoice number
    const invoiceCount = await Invoice.countDocuments();
    const invoiceNumber = `INV-${String(invoiceCount + 1).padStart(4, '0')}`;

    // Create invoice from job/estimate data
    const invoiceData = {
      invoice_number: invoiceNumber,
      customer_id: customerId,
      customer_name: customer.legal_company_name || customer.display_name || 'Unknown Customer',
      customer_email: customer.email || 'no-email@example.com',
      job_id: jobId,
      estimate_id: estimateId,
      issue_date: new Date().toISOString().split('T')[0],
      invoice_date: new Date().toISOString().split('T')[0],
      due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days
      subtotal: estimate.subtotal || 0,
      tax_amount: estimate.tax_amount || 0,
      total_amount: estimate.total_amount || 0,
      invoice_status: 'draft',
      payment_status: 'unpaid',
      user_id: userId
    };

    const invoice = new Invoice(invoiceData);
    const savedInvoice = await invoice.save();

    return NextResponse.json({ 
      success: true, 
      message: 'Invoice generated successfully',
      data: savedInvoice 
    }, { status: 201 });
  } catch (error) {
    console.error('Error generating invoice:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to generate invoice',
      data: null 
    }, { status: 500 });
  }
}