import { verifyToken } from './auth';
import { connectDB } from './mongodb';
import { ObjectId } from 'mongodb';

export async function getUserFromToken(token: string) {
  try {
    const payload = verifyToken(token) as any;
    if (!payload) {
      return null;
    }

    const db = await connectDB();
    const users = db.collection('users');
    
    const user = await users.findOne({ _id: new ObjectId(payload.userId) });
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