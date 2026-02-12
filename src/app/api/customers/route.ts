import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcrypt';
import { getUserFromRequest } from '@/lib/auth';
import Payment from '@/models/Payment';
import Order from '@/models/Order';
import mongoose from 'mongoose';

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
      customers = await User.find({ role: 'customer' }).sort({ createdAt: -1 });
    } else {
      // Regular users see only themselves
      customers = await User.find({ _id: userId, role: 'customer' }).sort({ createdAt: -1 });
    }

    // Enrich customers with total orders and total spent
    const enrichedCustomers = await Promise.all(
      customers.map(async (customer) => {
        const customerObj = customer.toObject();
        
        // Count total orders from orders table
        const totalOrders = await Order.countDocuments({ customer_id: customer._id });
        
        // Calculate total spent from payments matching user_id
        const payments = await Payment.aggregate([
          { 
            $match: { 
              user_id: new mongoose.Types.ObjectId(customer._id.toString())
            } 
          },
          { 
            $group: { 
              _id: null, 
              totalAmount: { $sum: { $ifNull: ['$amount', 0] } },
              totalPaymentAmount: { $sum: { $ifNull: ['$payment_amount', 0] } }
            } 
          }
        ]);
        
        const totalSpent = payments.length > 0 
          ? (payments[0].totalAmount || 0) + (payments[0].totalPaymentAmount || 0)
          : 0;
        
        return {
          ...customerObj,
          total_orders: totalOrders,
          total_spent: totalSpent
        };
      })
    );

    return NextResponse.json({ 
      success: true, 
      message: 'Customers fetched successfully',
      data: enrichedCustomers 
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
    const data = await request.json();
    if (!data.password) {
      return NextResponse.json({ 
        success: false, 
        message: 'Password is required',
        data: null 
      }, { status: 400 });
    }
    
    // Hash password properly
    const hashedPassword = await bcrypt.hash(data.password, 10);
    
    // Create user with customer role and all customer data
    const user = new User({
      ...data, // Include all customer fields first
      name: data.display_name || `${data.first_name} ${data.last_name}`.trim(),
      email: data.email,
      password: hashedPassword, // Override with hashed password
      role: 'customer'
    });
    
    const savedUser = await user.save();
    
    return NextResponse.json({ 
      success: true, 
      message: 'Customer created successfully',
      data: savedUser 
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