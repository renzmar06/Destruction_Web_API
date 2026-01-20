const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

const uri = 'mongodb+srv://renzmarr06_db_user:EbTynF0OhLWL1nbi@cycleiqcluster.5lgkwbk.mongodb.net/destructionOps';

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

async function seedUsers() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    const db = client.db('destructionOps');
    const collection = db.collection('users');

    // Clear existing users
    await collection.deleteMany({});

    // Hash passwords and insert users
    const hashedUsers = await Promise.all(
      users.map(async (user) => ({
        ...user,
        password: await bcrypt.hash(user.password, 10)
      }))
    );

    const result = await collection.insertMany(hashedUsers);
    console.log(`${result.insertedCount} users created successfully`);
    
    // Display created users
    hashedUsers.forEach(user => {
      console.log(`- ${user.role}: ${user.email} / ${users.find(u => u.email === user.email).password}`);
    });
    
  } catch (error) {
    console.error('Error seeding users:', error);
  } finally {
    await client.close();
  }
}

seedUsers();