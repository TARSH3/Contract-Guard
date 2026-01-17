/**
 * User Model
 * Defines the user schema for MongoDB
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Basic user information
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email address'
    ]
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long']
  },
  
  // Account status and tracking
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: null
  },
  
  // Subscription and usage tracking
  subscription: {
    plan: {
      type: String,
      enum: ['free', 'pro', 'enterprise'],
      default: 'free'
    },
    contractsRemaining: {
      type: Number,
      default: 3 // Free tier gets 3 contract analyses
    },
    contractsUsed: {
      type: Number,
      default: 0
    },
    renewalDate: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
    }
  },
  
  // User preferences
  preferences: {
    emailNotifications: {
      type: Boolean,
      default: true
    },
    riskTolerance: {
      type: String,
      enum: ['conservative', 'moderate', 'aggressive'],
      default: 'moderate'
    }
  }
}, {
  timestamps: true // Adds createdAt and updatedAt automatically
});

// Index for faster queries
userSchema.index({ email: 1 });
userSchema.index({ createdAt: -1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();
  
  try {
    // Hash password with cost of 12
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

// Instance method to check if user can analyze contracts
userSchema.methods.canAnalyzeContract = function() {
  return this.subscription.contractsRemaining > 0;
};

// Instance method to use a contract analysis
userSchema.methods.useContractAnalysis = async function() {
  if (this.subscription.contractsRemaining <= 0) {
    throw new Error('No contract analyses remaining');
  }
  
  this.subscription.contractsRemaining -= 1;
  this.subscription.contractsUsed += 1;
  await this.save();
};

// Instance method to get user's full name
userSchema.methods.getFullName = function() {
  return `${this.firstName} ${this.lastName}`;
};

// Static method to find user by email
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

// Virtual for user's display name
userSchema.virtual('displayName').get(function() {
  return this.getFullName();
});

// Ensure virtual fields are serialized
userSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    // Remove sensitive information from JSON output
    delete ret.password;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('User', userSchema);