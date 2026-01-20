import clientPromise from '../lib/mongodb';
import bcrypt from 'bcryptjs';

const users = [
  {
    email: 'admin@destructionops.com',
    password: 'admin123',
    name: 'Admin User',
    role: 'admin',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    email: 'customer@destructionops.com', 
    password: 'customer123',
    name: 'Customer User',
    role: 'customer',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

export async function seedUsers() {
  try {
    const client = await clientPromise;
    const db = client.db('destructionOps');
    const collection = db.collection('users');

    // Check if users already exist
    const existingUsers = await collection.find({}).toArray();
    if (existingUsers.length > 0) {
      console.log('Users already exist, skipping seed');
      return;
    }

    // Hash passwords and insert users
    const hashedUsers = await Promise.all(
      users.map(async (user) => ({
        ...user,
        password: await bcrypt.hash(user.password, 10)
      }))
    );

    const result = await collection.insertMany(hashedUsers);
    console.log(`${result.insertedCount} users created successfully`);
    
    return result;
  } catch (error) {
    console.error('Error seeding users:', error);
    throw error;
  }
}