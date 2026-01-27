import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import DocumentVerification from '@/models/DocumentVerification';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { token, document_id } = await request.json();

    if (!token || !document_id) {
      return NextResponse.json({ success: false, message: 'Token and document ID are required' }, { status: 400 });
    }

    const verification = await DocumentVerification.findOne({ 
      document_id, 
      verification_token: token 
    });

    if (!verification) {
      return NextResponse.json({ success: false, message: 'Invalid verification token' }, { status: 404 });
    }

    if (verification.verification_status === 'verified') {
      return NextResponse.json({ success: false, message: 'Document already verified' }, { status: 400 });
    }

    // Update verification status
    verification.verification_status = 'verified';
    verification.verified_date = new Date();
    await verification.save();

    return NextResponse.json({
      success: true,
      message: 'Document verified successfully'
    });

  } catch (error: any) {
    console.error('Verify document error:', error);
    return NextResponse.json({ 
      success: false, 
      message: error.message || 'Failed to verify document' 
    }, { status: 500 });
  }
}