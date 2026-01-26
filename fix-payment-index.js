// Run this script to fix the payment_number index issue
// Execute: node fix-payment-index.js

const { MongoClient } = require('mongodb');

async function fixPaymentIndex() {
  const client = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017/destructionOps');
  
  try {
    await client.connect();
    const db = client.db();
    const collection = db.collection('payments');
    
    console.log('Dropping existing payment_number index...');
    try {
      await collection.dropIndex('payment_number_1');
      console.log('Index dropped successfully');
    } catch (error) {
      console.log('Index may not exist, continuing...');
    }
    
    console.log('Creating new sparse index...');
    await collection.createIndex({ payment_number: 1 }, { sparse: true });
    console.log('Sparse index created successfully');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

fixPaymentIndex();