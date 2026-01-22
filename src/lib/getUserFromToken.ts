import { getUserFromRequest } from './auth';
import { connectDB } from './mongodb';
import { ObjectId } from 'mongodb';
import { NextRequest } from 'next/server';

export async function getUserFromToken(request: NextRequest) {
  try {
    const { userId } = getUserFromRequest(request);
    if (!userId) {
      return null;
    }

    const db = await connectDB();
    const users = db.collection('users');
    
    const user = await users.findOne({ _id: new ObjectId(userId) });
    if (!user) {
      return null;
    }

    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
    };
  } catch {
    return null;
  }
}