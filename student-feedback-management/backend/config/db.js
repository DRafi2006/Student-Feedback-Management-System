const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/student_feedback';
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 4000,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    console.error(`⚠️ MongoDB Connection Error: ${error.message}`);
    // Attempt fallback to mongodb-memory-server if local daemon is not running
    try {
      console.log('🔄 Attempting fallback to embedded MongoDB instance for seamless local execution...');
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create({
        instance: {
          port: 27017,
          dbName: 'student_feedback'
        }
      });
      const uri = mongod.getUri();
      const conn = await mongoose.connect(uri);
      console.log(`✅ Embedded MongoDB Running & Connected: ${uri}`);
    } catch (fallbackError) {
      console.error('❌ Could not start fallback MongoDB:', fallbackError.message);
      console.error('👉 Please make sure MongoDB service is running on mongodb://127.0.0.1:27017/student_feedback');
      process.exit(1);
    }
  }
};

module.exports = connectDB;
