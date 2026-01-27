import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import DocumentVerification from '@/models/DocumentVerification';
import Affidavit from '@/models/Affidavit';
import User from '@/models/User';
import { getUserFromRequest } from '@/lib/auth';
import { sendEmail } from '@/lib/emailService';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { userId } = getUserFromRequest(request);
    if (!userId) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { document_id } = await request.json();

    const verification = await DocumentVerification.findOne({ 
      document_id, 
      user_id: userId 
    }).populate('affidavit_id');

    if (!verification) {
      return NextResponse.json({ success: false, message: 'Verification record not found' }, { status: 404 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const verifyUrl = `${baseUrl}/verify-document?token=${verification.verification_token}&doc=${document_id}`;

    // Create document view URL instead of attachment
    const document = verification.affidavit_id.attached_documents?.find(
      (doc: any) => doc.document_id === document_id
    );
    
    const documentViewUrl = document ? `${baseUrl}/view-document/${document_id}` : null;

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Document Verification Required</h2>
        <p>Dear Customer,</p>
        <p>Please verify the document with ID: <strong>${document_id}</strong></p>
        <p>Affidavit Number: <strong>${verification.affidavit_id.affidavit_number}</strong></p>
        ${documentViewUrl ? `
          <div style="margin: 20px 0; padding: 15px; background: #f8f9fa; border-radius: 6px;">
            <p><strong>Document:</strong> ${document.file_name}</p>
            <a href="${documentViewUrl}" 
               style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block; margin-right: 10px;">
              View Document
            </a>
          </div>
        ` : ''}
        <div style="margin: 30px 0;">
          <a href="${verifyUrl}" 
             style="background-color: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Verify Document
          </a>
        </div>
        <p>Best regards,<br>Destruction Services Team</p>
      </div>
    `;

    const emailResult = await sendEmail(
      verification.customer_email,
      `Document Verification Required - ${document_id}`,
      emailHtml
    );

    if (!emailResult.success) {
      return NextResponse.json({ success: false, message: 'Failed to send verification email' }, { status: 500 });
    }

    // Update verification status
    verification.verification_status = 'sent';
    verification.email_sent_date = new Date();
    await verification.save();

    return NextResponse.json({
      success: true,
      message: 'Verification email sent successfully'
    });

  } catch (error: any) {
    console.error('Send email error:', error);
    return NextResponse.json({ 
      success: false, 
      message: error.message || 'Failed to send verification email' 
    }, { status: 500 });
  }
}