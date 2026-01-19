import mongoose from 'mongoose';

const uri = process.env.MONGODB_URI || 'mongodb+srv://renzmarr06_db_user:EbTynF0OhLWL1nbi@cycleiqcluster.5lgkwbk.mongodb.net/dloop';

export async function connectDB() {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(uri);
  }
  return mongoose.connection;
}

// // const uri = process.env.MONGODB_URI || 'mongodb+srv://renzmarr06_db_user:EbTynF0OhLWL1nbi@cycleiqcluster.5lgkwbk.mongodb.net/cycleiq';
// const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/dloop';
// let client: MongoClient;
// let db: Db;
