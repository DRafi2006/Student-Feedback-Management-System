const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/student_feedback';
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 2000,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.warn(`⚠️ Local MongoDB daemon not reachable: ${error.message}`);
    // Fallback to high-performance embedded in-memory MongoDB
    try {
      console.log('🔄 Initializing embedded in-memory MongoDB instance for seamless execution...');
      const { MongoMemoryServer } = require('mongodb-memory-server');
      let mongod;
      try {
        mongod = await MongoMemoryServer.create({
          instance: {
            port: 27017,
            dbName: 'student_feedback',
          },
        });
      } catch (portConflictErr) {
        mongod = await MongoMemoryServer.create({
          instance: {
            dbName: 'student_feedback',
          },
        });
      }
      const uri = mongod.getUri();
      const conn = await mongoose.connect(uri);
      console.log(`✅ Embedded In-Memory MongoDB Connected: ${uri}`);
      return conn;
    } catch (fallbackError) {
      console.error('❌ Could not start embedded MongoDB:', fallbackError.message);
      console.error('👉 Please make sure MongoDB is running or check node permissions.');
      process.exit(1);
    }
  }
};

module.exports = connectDB;
