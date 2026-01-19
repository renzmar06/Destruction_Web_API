import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(request: NextRequest) {
  try {
    const { firstName, lastName, phone, address, email, password } = await request.json();

    if (!firstName || !lastName || !phone || !address || !email || !password) {
      return NextResponse.json(
        { success: false, message: 'All fields are required' },
        { status: 200 }
      );
    }

    // Database connection
    let db;
    try {
      db = await connectDB();
    } catch {
      return NextResponse.json(
        { success: false, message: 'Database connection failed' },
        { status: 503 }
      );
    }

    const users = db.collection('users');

    // Check if user exists
    const existingUser = await users.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'User already exists' },
        { status: 200 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const result = await users.insertOne({
      firstName,
      lastName,
      phone,
      address,
      email,
      password: hashedPassword,
      createdAt: new Date(),
    });

    const user = {
      id: result.insertedId.toString(),
      firstName,
      lastName,
      phone,
      address,
      email,
    };

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    const response = NextResponse.json({
      success: true,
      message: 'User registered successfully',
      user,
      token,
    }, { status: 200 });

    // Set HTTP-only cookie
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}