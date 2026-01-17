/**
 * Contract Model
 * Defines the contract schema for storing uploaded contracts and their analysis
 */

const mongoose = require('mongoose');

// Schema for individual risky clauses
const riskyClauseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  quote: {
    type: String,
    required: true,
    maxlength: 1000 // Limit quote length
  },
  explanation: {
    type: String,
    required: true,
    maxlength: 500 // Limit explanation length
  },
  severity: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    required: true
  },
  category: {
    type: String,
    enum: [
      'termination',
      'penalty',
      'auto-renewal',
      'non-compete',
      'arbitration',
      'liability',
      'hidden-fees',
      'refund-restrictions',
      'data-privacy',
      'intellectual-property',
      'other'
    ],
    required: true
  },
  riskScore: {
    type: Number,
    min: 1,
    max: 10,
    required: true
  },
  pageNumber: {
    type: Number,
    min: 1
  },
  position: {
    start: Number,
    end: Number
  }
});

// Main contract schema
const contractSchema = new mongoose.Schema({
  // User reference
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // File information
  fileName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 255
  },
  originalFileName: {
    type: String,
    required: true,
    trim: true
  },
  fileSize: {
    type: Number,
    required: true,
    min: 0,
    max: 10485760 // 10MB limit
  },
  mimeType: {
    type: String,
    required: true,
    enum: ['application/pdf']
  },
  filePath: {
    type: String,
    required: true
  },
  
  // Extracted content
  extractedText: {
    type: String,
    required: false, // Changed: not required initially, will be set during processing
    default: ''
  },
  pageCount: {
    type: Number,
    min: 1
  },
  wordCount: {
    type: Number,
    min: 0
  },
  
  // AI Analysis results
  analysis: {
    // Executive summary in plain language
    summary: {
      type: String,
      maxlength: 1000
    },
    
    // Key contract highlights
    keyHighlights: [{
      type: String,
      maxlength: 200
    }],
    
    // Contract type classification
    contractType: {
      type: String,
      enum: [
        'employment',
        'service-agreement',
        'rental-lease',
        'purchase-agreement',
        'non-disclosure',
        'partnership',
        'licensing',
        'consulting',
        'other'
      ]
    },
    
    // Detected risky clauses
    riskyClauses: [riskyClauseSchema],
    
    // Overall risk assessment
    overallRiskScore: {
      type: Number,
      min: 0,
      max: 100,
      required: false, // Changed: not required initially
      default: 0
    },
    
    // Final recommendation
    recommendation: {
      type: String,
      enum: [
        'Safe to sign',
        'Review carefully',
        'Avoid signing'
      ],
      required: false, // Changed: not required initially
      default: 'Review carefully'
    },
    
    // Negotiation suggestions
    negotiationTips: [{
      type: String,
      maxlength: 300
    }],
    
    // Analysis metadata
    analysisVersion: {
      type: String,
      default: '1.0'
    },
    aiModel: {
      type: String,
      default: 'gpt-4'
    },
    confidence: {
      type: Number,
      min: 0,
      max: 1,
      default: 0.8
    }
  },
  
  // Processing status and timing
  processingStatus: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending',
    index: true
  },
  processingStartTime: {
    type: Date
  },
  processingEndTime: {
    type: Date
  },
  processingTime: {
    type: Number, // milliseconds
    min: 0
  },
  
  // Error handling
  errorMessage: {
    type: String,
    maxlength: 500
  },
  retryCount: {
    type: Number,
    default: 0,
    min: 0,
    max: 3
  },
  
  // User interaction tracking
  viewCount: {
    type: Number,
    default: 0,
    min: 0
  },
  lastViewed: {
    type: Date
  },
  isBookmarked: {
    type: Boolean,
    default: false
  },
  userRating: {
    type: Number,
    min: 1,
    max: 5
  },
  userFeedback: {
    type: String,
    maxlength: 1000
  }
}, {
  timestamps: true // Adds createdAt and updatedAt
});

// Indexes for better query performance
contractSchema.index({ userId: 1, createdAt: -1 });
contractSchema.index({ processingStatus: 1 });
contractSchema.index({ 'analysis.overallRiskScore': -1 });
contractSchema.index({ 'analysis.contractType': 1 });

// Virtual for processing duration in human-readable format
contractSchema.virtual('processingDuration').get(function() {
  if (!this.processingTime) return null;
  
  const seconds = Math.floor(this.processingTime / 1000);
  if (seconds < 60) return `${seconds}s`;
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
});

// Virtual for risk level based on score
contractSchema.virtual('riskLevel').get(function() {
  if (!this.analysis || this.analysis.overallRiskScore === undefined) return 'Unknown';
  
  const score = this.analysis.overallRiskScore;
  if (score >= 70) return 'High';
  if (score >= 40) return 'Medium';
  return 'Low';
});

// Instance method to mark as viewed
contractSchema.methods.markAsViewed = async function() {
  this.viewCount += 1;
  this.lastViewed = new Date();
  await this.save();
};

// Instance method to update processing status
contractSchema.methods.updateProcessingStatus = async function(status, errorMessage = null) {
  this.processingStatus = status;
  
  if (status === 'processing' && !this.processingStartTime) {
    this.processingStartTime = new Date();
  }
  
  if (status === 'completed' || status === 'failed') {
    this.processingEndTime = new Date();
    if (this.processingStartTime) {
      this.processingTime = this.processingEndTime - this.processingStartTime;
    }
  }
  
  if (errorMessage) {
    this.errorMessage = errorMessage;
  }
  
  await this.save();
};

// Static method to get user's contract statistics
contractSchema.statics.getUserStats = async function(userId) {
  try {
    const stats = await this.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } }, // Fixed: added 'new'
      {
        $group: {
          _id: null,
          totalContracts: { $sum: 1 },
          avgRiskScore: { $avg: '$analysis.overallRiskScore' },
          highRiskContracts: {
            $sum: { $cond: [{ $gte: ['$analysis.overallRiskScore', 70] }, 1, 0] }
          },
          mediumRiskContracts: {
            $sum: { $cond: [
              { $and: [
                { $gte: ['$analysis.overallRiskScore', 40] },
                { $lt: ['$analysis.overallRiskScore', 70] }
              ]}, 1, 0
            ]}
          },
          lowRiskContracts: {
            $sum: { $cond: [{ $lt: ['$analysis.overallRiskScore', 40] }, 1, 0] }
          }
        }
      }
    ]);
    
    return stats[0] || {
      totalContracts: 0,
      avgRiskScore: 0,
      highRiskContracts: 0,
      mediumRiskContracts: 0,
      lowRiskContracts: 0
    };
  } catch (error) {
    console.error('getUserStats error:', error);
    return {
      totalContracts: 0,
      avgRiskScore: 0,
      highRiskContracts: 0,
      mediumRiskContracts: 0,
      lowRiskContracts: 0
    };
  }
};

// Pre-save middleware to calculate word count
contractSchema.pre('save', function(next) {
  if (this.isModified('extractedText') && this.extractedText) {
    this.wordCount = this.extractedText.split(/\s+/).length;
  }
  next();
});

// Ensure virtual fields are serialized
contractSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    // Remove sensitive file path information
    delete ret.filePath;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('Contract', contractSchema);