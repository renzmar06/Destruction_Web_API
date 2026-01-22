import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

export function getUserFromRequest(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  
  if (!token) {
    throw new Error('User not authenticated');
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-here') as any;
    return {
      userId: decoded.userId,
      userEmail: decoded.email
    };
  } catch (error) {
    throw new Error('Invalid token');
  }
}