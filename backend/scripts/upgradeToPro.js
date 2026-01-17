/**
 * Upgrade User to Pro Plan
 * Development script to upgrade user to Pro plan
 */

const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/contractguard', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const User = require('../models/User');

async function upgradeToPro(email) {
  try {
    const user = await User.findOne({ email: email });
    
    if (!user) {
      console.log(`❌ User with email ${email} not found`);
      return;
    }

    // Upgrade to Pro plan
    user.subscription.plan = 'pro';
    user.subscription.contractsRemaining = 50; // Pro plan: 50 per month
    user.subscription.contractsUsed = 0;
    user.subscription.renewalDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    await user.save();

    console.log(`✅ Successfully upgraded ${email} to Pro plan`);
    console.log(`📊 Pro benefits: 50 analyses per month, advanced features`);
    
  } catch (error) {
    console.error('❌ Error upgrading user:', error);
  } finally {
    mongoose.connection.close();
  }
}

const email = process.argv[2] || 'john.doe@example.com';
console.log(`⬆️ Upgrading to Pro: ${email}`);

upgradeToPro(email);