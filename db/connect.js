const mongoose = require('mongoose');

// Tắt strict query để tránh deprecation warning trong Mongoose 7+
mongoose.set('strictQuery', true);

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      // Tối ưu connection pool cho bot Discord (concurrent requests)
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000, // Fail fast nếu không kết nối được
      socketTimeoutMS: 45000,
    });
    console.log('✅ Connected to MongoDB');

    // Lắng nghe sự kiện disconnect để log rõ ràng
    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB disconnected. Attempting to reconnect...');
    });
    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected.');
    });
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB error:', err);
    });

  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  }
}

module.exports = { connectDB };