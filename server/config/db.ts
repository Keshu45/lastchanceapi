import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.warn('\n========================================================');
      console.warn('⚠️ MONGODB_URI IS MISSING IN ENVIRONMENT VARIABLES!');
      console.warn('Ensure you set it in the Secrets panel or .env file before using the API.');
      console.warn('========================================================\n');
      return;
    }
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
  }
};
