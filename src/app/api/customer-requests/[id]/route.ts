import { NextRequest, NextResponse } from 'next/server';
import ServiceRequest from '@/models/ServiceRequest';
import Notification from '@/models/Notification';
import User from '@/models/User';
import { connectDB } from '@/lib/mongodb';
import { getUserFromRequest } from '@/lib/auth';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { userId } = getUserFromRequest(request);
    
    if (!userId) {
      return NextResponse.json({ 
        success: false, 
        message: 'User authentication required' 
      }, { status: 401 });
    }

    const { adminNotes, status, notifyCustomer } = await request.json();
    const { id: requestId } = await params;

    // Find the service request
    const serviceRequest = await ServiceRequest.findById(requestId);
    if (!serviceRequest) {
      return NextResponse.json({ 
        success: false, 
        message: 'Service request not found' 
      }, { status: 404 });
    }

    // Update admin notes and status if provided
    if (adminNotes) {
      serviceRequest.adminNotes = adminNotes;
    }
    if (status) {
      serviceRequest.status = status;
    }
    await serviceRequest.save();

    // Send notification if requested
    if (notifyCustomer && adminNotes) {
      const statusLabels: Record<string, string> = {
        pending: 'Pending Review',
        in_review: 'In Review',
        quoted: 'Quote Sent',
        approved: 'Approved',
        in_progress: 'In Progress',
        completed: 'Completed',
        cancelled: 'Cancelled'
      };

      const notification = new Notification({
        customerId: serviceRequest.user_id,
        title: `Update on Your ${serviceRequest.serviceType.replace(/_/g, ' ')} Request (${serviceRequest.requestNumber})`,
        message: `Dear Customer,

We hope this message finds you well! 

We are writing to inform you about the current status of your service request. Here are the details:

- **Request Number:** ${serviceRequest.requestNumber}  
- **Service Type:** ${serviceRequest.serviceType.replace(/_/g, ' ')}  
- **Current Status:** ${statusLabels[serviceRequest.status] || serviceRequest.status}  
- **Preferred Date:** ${new Date(serviceRequest.preferredDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}  
- **Additional Notes:** ${adminNotes}  

Your request is being processed, and we are diligently working to provide you with the best possible service.

If you have any questions or need further assistance, please do not hesitate to reach out. We appreciate your patience and look forward to assisting you further!

Warm regards,

DestructionOps Team`,
        type: 'service_request_update',
        serviceRequestId: serviceRequest._id,
        sentVia: 'both'
      });

      await notification.save();
    }

    return NextResponse.json({
      success: true,
      message: notifyCustomer ? 'Notes saved and customer notified successfully' : 'Notes saved successfully'
    });

  } catch (error) {
    console.error('Error updating service request:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update service request' },
      { status: 500 }
    );
  }
}