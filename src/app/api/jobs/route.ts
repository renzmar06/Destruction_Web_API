import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Job from '@/models/Job';
import Estimate from '@/models/Estimate';
import User from '@/models/User';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
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

    // Check if user is admin
    const user = await User.findById(userId);
    let jobs;
    
    if (user?.role === 'admin') {
      // Admin can see all jobs
      jobs = await Job.find().sort({ createdAt: -1 });
    } else {
      // Regular users see only their jobs
      jobs = await Job.find({ customer_id: userId }).sort({ createdAt: -1 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Jobs fetched successfully',
      data: jobs 
    });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to fetch jobs',
      data: null 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { userId } = getUserFromRequest(request);
    const jobData = await request.json();
    
    // Generate unique job ID
    const jobId = `JOB-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    const job = new Job({
      ...jobData,
      job_id: jobId,
      user_id: jobData.user_id || userId
    });
    
    await job.save();
    
    // Update estimate status to 'converted_to_job'
    await Estimate.findByIdAndUpdate(jobData.estimate_id, {
      estimate_status: 'converted_to_job'
    });
    
    return NextResponse.json({ 
      success: true, 
      message: 'Job created successfully',
      data: job 
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating job:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to create job',
      data: null 
    }, { status: 500 });
  }
}