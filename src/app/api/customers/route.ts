import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Customer from '@/models/Customer';
import User from '@/models/User';
import bcrypt from 'bcrypt';
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
    let customers;
    
    if (user?.role === 'admin') {
      // Admin can see all customers
      customers = await Customer.find().sort({ createdAt: -1 });
    } else {
      // Regular users see only their customers
      customers = await Customer.find({ user_id: userId }).sort({ createdAt: -1 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Customers fetched successfully',
      data: customers 
    });
  } catch (error) {
    console.error('Error fetching customers:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to fetch customers',
      data: null 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { userId } = getUserFromRequest(request);
    const data = await request.json();
    
    // Extract password from customer data
    const { password, ...customerData } = data;
    
    if (!password) {
      return NextResponse.json({ 
        success: false, 
        message: 'Password is required',
        data: null 
      }, { status: 400 });
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
    console.log("fgfdgfddfg",savedUser  )
    // Create customer with user_id reference
    const customer = new Customer({
      ...customerData,
      user_id: savedUser._id
    });
    
    const savedCustomer = await customer.save();
    
    return NextResponse.json({ 
      success: true, 
      message: 'Customer created successfully',
      data: savedCustomer 
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating customer:', error);
    if (error.code === 11000) {
      return NextResponse.json({ 
        success: false, 
        message: 'Email already exists',
        data: null 
      }, { status: 400 });
    }
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to create customer',
      data: null 
    }, { status: 500 });
  }
}