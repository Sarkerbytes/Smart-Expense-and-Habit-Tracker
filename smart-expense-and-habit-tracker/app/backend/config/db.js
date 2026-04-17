const mongoose = require('mongoose');
const dns = require('dns');

// Fix for Node.js DNS resolution issues with MongoDB Atlas SRV records
dns.setServers(['8.8.8.8', '8.8.4.4']);

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.error('   Make sure:');
    console.error('   1. Your IP is whitelisted in MongoDB Atlas (Network Access → Allow from Anywhere: 0.0.0.0/0)');
    console.error('   2. Your internet connection is active');
    console.error('   3. Your MONGO_URI in .env is correct');
    process.exit(1);
  }
};

module.exports = connectDB;
