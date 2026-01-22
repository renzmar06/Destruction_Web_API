import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Customer from '@/models/Customer';
import User from '@/models/User';
import bcrypt from 'bcrypt';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    const customer = await Customer.findById(id).select('-user_id');
    
    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }
    
    return NextResponse.json(customer);
  } catch (error) {
    console.error('Error fetching customer:', error);
    return NextResponse.json({ error: 'Failed to fetch customer' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    const data = await request.json();
    
    const customer = await Customer.findById(id);
    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }
    
    // Extract password if provided
    const { password, ...customerData } = data;
    
    // Update customer data
    const updatedCustomer = await Customer.findByIdAndUpdate(id, customerData, { new: true });
    
    // Update user data if needed
    if (customer.user_id) {
      const userUpdateData: any = {
        name: customerData.display_name || `${customerData.first_name} ${customerData.last_name}`.trim(),
        email: customerData.email
      };
      
      // Update password if provided
      if (password) {
        userUpdateData.password = await bcrypt.hash(password, 10);
      }
      
      await User.findByIdAndUpdate(customer.user_id, userUpdateData);
    }
    
    return NextResponse.json(updatedCustomer);
  } catch (error) {
    console.error('Error updating customer:', error);
    return NextResponse.json({ error: 'Failed to update customer' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    const customer = await Customer.findById(id);
    
    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }
    
    // Delete associated user account
    if (customer.user_id) {
      await User.findByIdAndDelete(customer.user_id);
    }
    
    // Delete customer
    await Customer.findByIdAndDelete(id);
    
    return NextResponse.json({ message: 'Customer and user account deleted successfully' });
  } catch (error) {
    console.error('Error deleting customer:', error);
    return NextResponse.json({ error: 'Failed to delete customer' }, { status: 500 });
  }
}