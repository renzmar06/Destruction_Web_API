import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Estimate from '@/models/Estimate';
import Customer from '@/models/Customer';
import { sendEmail } from '@/lib/emailService';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { estimateId, email, message } = await request.json();

    // Get estimate details
    const estimate = await Estimate.findById(estimateId);
    if (!estimate) {
      return NextResponse.json({ success: false, error: 'Estimate not found' }, { status: 404 });
    }

    // Get customer details
    const customer = await Customer.findById(estimate.customer_id);
    
    // Generate email HTML
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const acceptUrl = `${baseUrl}/estimate-response?id=${estimateId}&action=accept`;
    const rejectUrl = `${baseUrl}/estimate-response?id=${estimateId}&action=reject`;
    
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Estimate ${estimate.estimate_number}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
          .estimate-details { background: #fff; border: 1px solid #dee2e6; border-radius: 8px; padding: 20px; margin-bottom: 20px; }
          .actions { text-align: center; margin: 30px 0; }
          .btn { display: inline-block; padding: 12px 24px; color: white; text-decoration: none; border-radius: 4px; margin: 0 10px; font-weight: bold; }
          .btn-accept { background: #28a745; }
          .btn-reject { background: #dc3545; }
          .footer { text-align: center; color: #6c757d; font-size: 14px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Estimate ${estimate.estimate_number}</h1>
            <p>Date: ${new Date(estimate.estimate_date).toLocaleDateString()}</p>
            <p>Valid Until: ${new Date(estimate.valid_until_date).toLocaleDateString()}</p>
          </div>
          
          <div class="estimate-details">
            <h2>Estimate Details</h2>
            <p><strong>Customer:</strong> ${estimate.customer_name}</p>
            <p><strong>Service Type:</strong> ${estimate.destruction_type || 'N/A'}</p>
            <p><strong>Total Amount:</strong> $${estimate.total_amount?.toFixed(2) || '0.00'}</p>
            
            ${estimate.note_to_customer ? `
              <h3>Notes:</h3>
              <p>${estimate.note_to_customer}</p>
            ` : ''}
            
            ${message ? `
              <h3>Message:</h3>
              <p>${message}</p>
            ` : ''}
          </div>
          
          <div class="actions">
            <h3>Please respond to this estimate:</h3>
            <a href="${acceptUrl}" class="btn btn-accept">Accept Estimate</a>
            <a href="${rejectUrl}" class="btn btn-reject">Reject Estimate</a>
          </div>
          
          <div class="footer">
            <p>Thank you for your business!</p>
            <p>This estimate is valid until ${new Date(estimate.valid_until_date).toLocaleDateString()}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send email
    const emailResult = await sendEmail(
      email,
      `Estimate ${estimate.estimate_number} - ${estimate.customer_name}`,
      emailHtml
    );

    if (!emailResult.success) {
      return NextResponse.json({ success: false, error: emailResult.error }, { status: 500 });
    }

    // Update estimate status to 'sent' and set sent_date
    await Estimate.findByIdAndUpdate(estimateId, {
      estimate_status: 'sent',
      sent_date: new Date()
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Estimate sent successfully',
      messageId: emailResult.messageId 
    });

  } catch (error) {
    console.error('Error sending estimate:', error);
    return NextResponse.json({ success: false, error: 'Failed to send estimate' }, { status: 500 });
  }
}