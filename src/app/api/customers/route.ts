import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Customer from '@/models/Customer';
import User from '@/models/User';
import bcrypt from 'bcrypt';

export async function GET() {
  try {
    await connectDB();
    const customers = await Customer.find({}).sort({ createdAt: -1 });
    return NextResponse.json(customers);
  } catch (error) {
    console.error('Error fetching customers:', error);
    return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const data = await request.json();
    
    // Extract password from customer data
    const { password, ...customerData } = data;
    
    if (!password) {
      return NextResponse.json({ error: 'Password is required' }, { status: 400 });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user account
    const user = new User({
      name: customerData.display_name || `${customerData.first_name} ${customerData.last_name}`.trim(),
      email: customerData.email,
      password: hashedPassword,
      role: 'customer'
    });
    
    const savedUser = await user.save();
    
    // Create customer with user_id reference
    const customer = new Customer({
      ...customerData,
      user_id: savedUser._id
    });
    
    const savedCustomer = await customer.save();
    
    return NextResponse.json(savedCustomer, { status: 201 });
  } catch (error: any) {
    console.error('Error creating customer:', error);
    if (error.code === 11000) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create customer' }, { status: 500 });
  }
}