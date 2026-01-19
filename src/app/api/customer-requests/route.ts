import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// GET - List customer requests
export async function GET(request: NextRequest) {
  try {
    const db = await connectDB();
    const requests = db.collection('customer_requests');
    
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customer_id');
    const status = searchParams.get('status');
    
    const filter: any = {};
    if (customerId) filter.customer_id = customerId;
    if (status) filter.request_status = status;
    
    const customerRequests = await requests.find(filter).sort({ created_date: -1 }).toArray();
    
    return NextResponse.json({
      success: true,
      data: customerRequests
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to fetch requests' },
      { status: 500 }
    );
  }
}

// POST - Create new customer request
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const db = await connectDB();
    const requests = db.collection('customer_requests');
    
    // Generate request number
    const count = await requests.countDocuments();
    const requestNumber = `SR-${String(count + 1).padStart(4, '0')}`;
    
    const newRequest = {
      ...body,
      request_number: requestNumber,
      created_date: new Date().toISOString(),
      updated_date: new Date().toISOString()
    };
    
    const result = await requests.insertOne(newRequest);
    
    return NextResponse.json({
      success: true,
      data: { ...newRequest, id: result.insertedId }
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to create request' },
      { status: 500 }
    );
  }
}