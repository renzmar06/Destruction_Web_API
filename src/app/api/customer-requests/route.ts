import { NextRequest, NextResponse } from 'next/server';
import ServiceRequest from '@/models/ServiceRequest';
import { connectDB } from '@/lib/mongodb';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
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
    const requestNumber = `REQ-${Date.now().toString().slice(-6)}`;
    
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
      status: body.isDraft ? 'draft' : 'pending'
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
      { success: false, message: 'Failed to create service request'},
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const requests = await ServiceRequest.find({}).sort({ createdAt: -1 });
    
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