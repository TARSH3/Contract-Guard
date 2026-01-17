/**
 * Find and Upgrade User to Pro
 * Development script to find all users and upgrade them to Pro
 */

const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/contractguard', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const User = require('../models/User');

async function findAndUpgradeAllUsers() {
  try {
    // Find all users
    const users = await User.find({});
    
    console.log(`📋 Found ${users.length} users in database:`);
    
    for (let user of users) {
      console.log(`\n👤 User: ${user.email}`);
      console.log(`   Current Plan: ${user.subscription?.plan || 'none'}`);
      console.log(`   Analyses Remaining: ${user.subscription?.contractsRemaining || 0}`);
      
      // Upgrade to Pro
      user.subscription = {
        plan: 'pro',
        contractsRemaining: 500,
        contractsUsed: 0,
        renewalDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
      };
      
      await user.save();
      console.log(`   ✅ Upgraded to Pro with 500 analyses!`);
    }
    
    console.log(`\n🎉 All users upgraded to Pro successfully!`);
    
  } catch (error) {
    console.error('❌ Error upgrading users:', error);
  } finally {
    mongoose.connection.close();
  }
}

console.log(`🔍 Finding and upgrading all users to Pro...`);
findAndUpgradeAllUsers();