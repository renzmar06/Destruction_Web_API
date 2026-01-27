import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import DocumentVerification from '@/models/DocumentVerification';
import Affidavit from '@/models/Affidavit';
import Job from '@/models/Job';
import User from '@/models/User';
import { getUserFromRequest } from '@/lib/auth';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { userId } = getUserFromRequest(request);
    if (!userId) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { document_id } = await request.json();

    if (!document_id) {
      return NextResponse.json({ success: false, message: 'Document ID is required' }, { status: 400 });
    }

    // Find affidavit with this document
    const affidavit = await Affidavit.findOne({
      'attached_documents.document_id': document_id,
      user_id: userId
    }).populate('job_id');

    if (!affidavit) {
      return NextResponse.json({ success: false, message: 'Document not found' }, { status: 404 });
    }

    const job = await Job.findById(affidavit.job_id).populate('customer_id');
    if (!job || !job.customer_id?.email) {
      return NextResponse.json({ success: false, message: 'Customer email not found' }, { status: 404 });
    }

    // Check if verification already exists
    const existingVerification = await DocumentVerification.findOne({ document_id });
    if (existingVerification) {
      return NextResponse.json({ success: false, message: 'Document verification already exists' }, { status: 400 });
    }

    // Create verification record
    const verification = new DocumentVerification({
      document_id,
      affidavit_id: affidavit._id,
      job_id: affidavit.job_id,
      customer_email: job.customer_id.email,
      verification_token: Math.random().toString(36).substring(2, 15),
      user_id: userId
    });

    await verification.save();

    return NextResponse.json({
      success: true,
      message: 'Document verification created successfully',
      data: verification
    });

  } catch (error: any) {
    console.error('Document verification error:', error);
    return NextResponse.json({ 
      success: false, 
      message: error.message || 'Failed to create document verification' 
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { userId } = getUserFromRequest(request);
    if (!userId) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const verifications = await DocumentVerification.find({ user_id: userId })
      .populate('affidavit_id')
      .populate('job_id')
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: verifications
    });

  } catch (error: any) {
    console.error('Fetch verifications error:', error);
    return NextResponse.json({ 
      success: false, 
      message: error.message || 'Failed to fetch verifications' 
    }, { status: 500 });
  }
}