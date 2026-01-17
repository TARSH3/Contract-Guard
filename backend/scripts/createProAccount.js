/**
 * Create Premium Pro Account
 * Development script to create a full-featured Pro account
 */

const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/contractguard', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const User = require('../models/User');

async function createProAccount(email) {
  try {
    const user = await User.findOne({ email: email });
    
    if (!user) {
      console.log(`❌ User with email ${email} not found`);
      return;
    }

    // Upgrade to Premium Pro plan
    user.subscription = {
      plan: 'pro',
      contractsRemaining: 500, // Generous Pro limit
      contractsUsed: 0,
      renewalDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year from now
    };

    // Enhanced preferences for Pro users
    user.preferences = {
      emailNotifications: true,
      riskTolerance: 'moderate'
    };

    await user.save();

    console.log(`🎉 Successfully upgraded ${email} to Premium Pro!`);
    console.log(`📊 Pro Benefits:`);
    console.log(`   • 500 contract analyses per year`);
    console.log(`   • Advanced AI analysis`);
    console.log(`   • PDF report downloads`);
    console.log(`   • Priority support`);
    console.log(`   • Contract history dashboard`);
    console.log(`   • Negotiation recommendations`);
    console.log(`📅 Valid until: ${user.subscription.renewalDate.toDateString()}`);
    
  } catch (error) {
    console.error('❌ Error creating Pro account:', error);
  } finally {
    mongoose.connection.close();
  }
}

const email = process.argv[2] || 'john.doe@example.com';
console.log(`🚀 Creating Premium Pro account for: ${email}`);

createProAccount(email);