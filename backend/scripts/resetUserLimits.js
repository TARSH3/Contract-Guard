/**
 * Reset User Contract Limits
 * Development script to reset contract analysis limits
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/contractguard', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const User = require('../models/User');

async function resetUserLimits(email) {
  try {
    const user = await User.findOne({ email: email });
    
    if (!user) {
      console.log(`❌ User with email ${email} not found`);
      return;
    }

    // Reset contract limits
    user.subscription.contractsRemaining = 100; // Give 100 analyses
    user.subscription.contractsUsed = 0;
    user.subscription.renewalDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now

    await user.save();

    console.log(`✅ Successfully reset limits for ${email}`);
    console.log(`📊 New limits: ${user.subscription.contractsRemaining} analyses remaining`);
    
  } catch (error) {
    console.error('❌ Error resetting limits:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Get email from command line argument or use default
const email = process.argv[2] || 'john.doe@example.com';
console.log(`🔄 Resetting limits for: ${email}`);

resetUserLimits(email);