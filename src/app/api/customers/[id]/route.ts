import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcrypt';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    const customer = await User.findById(id).select('-password');
    
    if (!customer || customer.role !== 'customer') {
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
    
    const customer = await User.findById(id);
    if (!customer || customer.role !== 'customer') {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }
    
    // Extract password if provided
    const { password, ...customerData } = data;
    
    // Update user data
    const updateData: any = {
      name: customerData.display_name || `${customerData.first_name} ${customerData.last_name}`.trim(),
      ...customerData
    };
    
    // Update password if provided
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }
    
    const updatedCustomer = await User.findByIdAndUpdate(id, updateData, { new: true }).select('-password');
    
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
    const customer = await User.findById(id);
    
    if (!customer || customer.role !== 'customer') {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }
    
    // Delete customer user
    await User.findByIdAndDelete(id);
    
    return NextResponse.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    console.error('Error deleting customer:', error);
    return NextResponse.json({ error: 'Failed to delete customer' }, { status: 500 });
  }
}