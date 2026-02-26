const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000, // 5s timeout instead of hanging forever
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.error('');
    console.error('Make sure MongoDB is running. Options:');
    console.error('  1. Start local MongoDB:  mongod');
    console.error('  2. Use MongoDB Atlas:    Update MONGO_URI in ../.env');
    console.error('');
    throw error;
  }
};

module.exports = connectDB;
