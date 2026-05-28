import mongoose from 'mongoose';

async function testConnection() {
  try {
    await mongoose.connect("mongodb+srv://ksvpatidar3180_db_user:PnKnHhOzrYPE76xd@ticketsinformation.uzxjlmr.mongodb.net/deskflow");
    console.log('✅ Connection Successful!');
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Connection Failed:', error.message);
    process.exit(1);
  }
}

testConnection();
