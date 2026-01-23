import { NextRequest, NextResponse } from 'next/server';
import ServiceRequest from '@/models/ServiceRequest';
import User from '@/models/User';
import { connectDB } from '@/lib/mongodb';
import { getUserFromRequest } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    //test
    await connectDB();
    const { userId } = getUserFromRequest(request);
    
    if (!userId) {
      return NextResponse.json({ 
        success: false, 
        message: 'User authentication required',
        data: null 
      }, { status: 401 });
    }

    const body = await request.json();
    
    console.log('Received request body:', body);
    
    // Validate required fields
    const requiredFields = ['serviceType', 'productType', 'preferredDate', 'contactName', 'contactPhone'];
    const missingFields = requiredFields.filter(field => !body[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { success: false, message: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Generate request number
    const requestNumber = `SR-${Date.now().toString().slice(-6)}`;
    
    // Create service request
    const serviceRequest = new ServiceRequest({
      requestNumber,
      serviceType: body.serviceType,
      productType: body.productType,
      materialCondition: body.materialCondition,
      estimatedWeight: body.estimatedWeight,
      unitCount: body.unitCount,
      palletCount: body.palletCount,
      palletType: body.palletType,
      shrinkWrapped: body.shrinkWrapped || false,
      destructionType: body.destructionType,
      certificateRequired: body.certificateRequired || false,
      logisticsType: body.logisticsType,
      pickupAddress: body.pickupAddress,
      pickupHours: body.pickupHours,
      truckingService: body.truckingService || false,
      palletSwap: body.palletSwap || false,
      additionalLabor: body.additionalLabor || false,
      hazardousNotes: body.hazardousNotes,
      timeConstraints: body.timeConstraints,
      preferredDate: body.preferredDate,
      urgency: body.urgency || 'normal',
      contactName: body.contactName,
      contactPhone: body.contactPhone,
      quantityBreakdown: body.quantityBreakdown,
      scheduleFrequency: body.scheduleFrequency,
      problemDescription: body.problemDescription,
      attachments: body.attachments || [],
      status: body.isDraft ? 'draft' : 'pending',
      user_id: userId
    });

    await serviceRequest.save();
    
    return NextResponse.json({
      success: true,
      message: body.isDraft ? 'Request saved as draft' : 'Service request submitted successfully',
      data: serviceRequest
    });

  } catch (error) {
    console.error('Error creating service request:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create service request', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

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
    let requests;
    
    if (user?.role === 'admin') {
      // Admin can see all requests
      requests = await ServiceRequest.find({}).sort({ createdAt: -1 });
    } else {
      // Regular users see only their requests
      requests = await ServiceRequest.find({ user_id: userId }).sort({ createdAt: -1 });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Data Retrieve Successfully',
      data: requests
    });

  } catch (error) {
    console.error('Error fetching service requests:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch service requests' },
      { status: 500 }
    );
  }
}