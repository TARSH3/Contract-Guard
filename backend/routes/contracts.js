/**
 * Contract Routes
 * Handles contract upload, analysis, and management
 */

const express = require('express');
const { body, param, query, validationResult } = require('express-validator');
const Contract = require('../models/Contract');
const { authenticateToken, checkContractLimit } = require('../middleware/auth');
const { uploadWithValidation, cleanupOnError, deleteFile } = require('../middleware/upload');
const { asyncHandler, AppError, validationError } = require('../middleware/errorHandler');
const { extractTextFromPDF, analyzeContract, generatePDFReport } = require('../services/contractService');

const router = express.Router();

/**
 * @route   POST /api/contracts/upload
 * @desc    Upload and analyze a contract
 * @access  Private
 */
router.post('/upload', 
  authenticateToken,
  checkContractLimit,
  uploadWithValidation,
  cleanupOnError,
  asyncHandler(async (req, res) => {
    const user = req.user;
    const fileMetadata = req.fileMetadata;

    try {
      // Create contract record
      const contract = new Contract({
        userId: user._id,
        fileName: fileMetadata.fileName,
        originalFileName: fileMetadata.originalName,
        fileSize: fileMetadata.fileSize,
        mimeType: fileMetadata.mimeType,
        filePath: fileMetadata.filePath,
        extractedText: '', // Will be populated after processing
        processingStatus: 'pending'
      });

      await contract.save();

      // Start processing in background
      processContractAsync(contract._id, fileMetadata.filePath, user._id);

      // Use a contract analysis from user's quota
      await user.useContractAnalysis();

      res.status(201).json({
        success: true,
        message: 'Contract uploaded successfully. Analysis in progress.',
        data: {
          contractId: contract._id,
          fileName: contract.originalFileName,
          fileSize: contract.fileSize,
          processingStatus: contract.processingStatus,
          estimatedProcessingTime: '30-60 seconds'
        }
      });

    } catch (error) {
      // Clean up uploaded file on error
      if (fileMetadata.filePath) {
        await deleteFile(fileMetadata.filePath).catch(console.error);
      }
      throw error;
    }
  })
);

/**
 * @route   GET /api/contracts
 * @desc    Get user's contracts with pagination and filtering
 * @access  Private
 */
router.get('/', authenticateToken, [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50'),
  
  query('status')
    .optional()
    .isIn(['pending', 'processing', 'completed', 'failed'])
    .withMessage('Invalid status filter'),
  
  query('riskLevel')
    .optional()
    .isIn(['Low', 'Medium', 'High'])
    .withMessage('Invalid risk level filter'),
  
  query('sortBy')
    .optional()
    .isIn(['createdAt', 'fileName', 'riskScore'])
    .withMessage('Invalid sort field'),
  
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc')
], asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw validationError(errors.array());
  }

  const user = req.user;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  // Build query
  const query = { userId: user._id };
  
  if (req.query.status) {
    query.processingStatus = req.query.status;
  }
  
  if (req.query.riskLevel) {
    const riskRanges = {
      'Low': { $lt: 40 },
      'Medium': { $gte: 40, $lt: 70 },
      'High': { $gte: 70 }
    };
    query['analysis.overallRiskScore'] = riskRanges[req.query.riskLevel];
  }

  // Build sort
  const sortBy = req.query.sortBy || 'createdAt';
  const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
  const sort = { [sortBy]: sortOrder };

  // Execute query
  const [contracts, totalCount] = await Promise.all([
    Contract.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .select('-extractedText -filePath'), // Exclude large text field
    Contract.countDocuments(query)
  ]);

  // Calculate pagination info
  const totalPages = Math.ceil(totalCount / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  res.json({
    success: true,
    data: {
      contracts,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNextPage,
        hasPrevPage,
        limit
      }
    }
  });
}));

/**
 * @route   GET /api/contracts/:id
 * @desc    Get specific contract details
 * @access  Private
 */
router.get('/:id', authenticateToken, [
  param('id')
    .isMongoId()
    .withMessage('Invalid contract ID')
], asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw validationError(errors.array());
  }

  const user = req.user;
  const contractId = req.params.id;

  // Find contract
  const contract = await Contract.findOne({
    _id: contractId,
    userId: user._id
  });

  if (!contract) {
    throw new AppError('Contract not found', 404);
  }

  // Mark as viewed
  await contract.markAsViewed();

  res.json({
    success: true,
    data: {
      contract
    }
  });
}));

/**
 * @route   DELETE /api/contracts/:id
 * @desc    Delete a contract
 * @access  Private
 */
router.delete('/:id', authenticateToken, [
  param('id')
    .isMongoId()
    .withMessage('Invalid contract ID')
], asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw validationError(errors.array());
  }

  const user = req.user;
  const contractId = req.params.id;

  // Find contract
  const contract = await Contract.findOne({
    _id: contractId,
    userId: user._id
  });

  if (!contract) {
    throw new AppError('Contract not found', 404);
  }

  // Delete associated file
  if (contract.filePath) {
    await deleteFile(contract.filePath).catch(console.error);
  }

  // Delete contract record
  await Contract.findByIdAndDelete(contractId);

  res.json({
    success: true,
    message: 'Contract deleted successfully'
  });
}));

/**
 * @route   GET /api/contracts/:id/download-report
 * @desc    Download contract analysis report as PDF
 * @access  Private
 */
router.get('/:id/download-report', authenticateToken, [
  param('id')
    .isMongoId()
    .withMessage('Invalid contract ID')
], asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw validationError(errors.array());
  }

  const user = req.user;
  const contractId = req.params.id;

  // Find contract
  const contract = await Contract.findOne({
    _id: contractId,
    userId: user._id
  });

  if (!contract) {
    throw new AppError('Contract not found', 404);
  }

  if (contract.processingStatus !== 'completed') {
    throw new AppError('Contract analysis not completed yet', 400);
  }

  // Generate PDF report
  const pdfBuffer = await generatePDFReport(contract, user);

  // Set response headers
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="contract-analysis-${contract.fileName}.pdf"`);
  res.setHeader('Content-Length', pdfBuffer.length);

  res.send(pdfBuffer);
}));

/**
 * @route   GET /api/contracts/:id/status
 * @desc    Get contract processing status
 * @access  Private
 */
router.get('/:id/status', authenticateToken, [
  param('id')
    .isMongoId()
    .withMessage('Invalid contract ID')
], asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw validationError(errors.array());
  }

  const user = req.user;
  const contractId = req.params.id;

  // Find contract
  const contract = await Contract.findOne({
    _id: contractId,
    userId: user._id
  }).select('processingStatus processingTime errorMessage createdAt');

  if (!contract) {
    throw new AppError('Contract not found', 404);
  }

  res.json({
    success: true,
    data: {
      contractId: contract._id,
      processingStatus: contract.processingStatus,
      processingTime: contract.processingTime,
      processingDuration: contract.processingDuration,
      errorMessage: contract.errorMessage,
      createdAt: contract.createdAt
    }
  });
}));

/**
 * @route   POST /api/contracts/:id/feedback
 * @desc    Submit feedback for contract analysis
 * @access  Private
 */
router.post('/:id/feedback', authenticateToken, [
  param('id')
    .isMongoId()
    .withMessage('Invalid contract ID'),
  
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  
  body('feedback')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Feedback cannot exceed 1000 characters')
], asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw validationError(errors.array());
  }

  const user = req.user;
  const contractId = req.params.id;
  const { rating, feedback } = req.body;

  // Find contract
  const contract = await Contract.findOne({
    _id: contractId,
    userId: user._id
  });

  if (!contract) {
    throw new AppError('Contract not found', 404);
  }

  // Update feedback
  contract.userRating = rating;
  if (feedback) {
    contract.userFeedback = feedback;
  }

  await contract.save();

  res.json({
    success: true,
    message: 'Feedback submitted successfully'
  });
}));

/**
 * @route   GET /api/contracts/stats/dashboard
 * @desc    Get user's contract analysis statistics
 * @access  Private
 */
router.get('/stats/dashboard', authenticateToken, asyncHandler(async (req, res) => {
  const user = req.user;

  // Get user statistics
  const stats = await Contract.getUserStats(user._id);

  // Get recent contracts
  const recentContracts = await Contract.find({ userId: user._id })
    .sort({ createdAt: -1 })
    .limit(5)
    .select('fileName originalFileName analysis.overallRiskScore analysis.recommendation processingStatus createdAt');

  res.json({
    success: true,
    data: {
      stats,
      recentContracts,
      subscription: user.subscription
    }
  });
}));

/**
 * Background processing function
 * Processes contract asynchronously
 */
async function processContractAsync(contractId, filePath, userId) {
  try {
    const contract = await Contract.findById(contractId);
    if (!contract) return;

    // Update status to processing
    await contract.updateProcessingStatus('processing');

    // Extract text from PDF
    const extractedText = await extractTextFromPDF(filePath);
    contract.extractedText = extractedText;
    
    // Calculate page count (rough estimate)
    contract.pageCount = Math.ceil(extractedText.length / 3000); // ~3000 chars per page
    
    await contract.save();

    // Analyze contract with AI
    const analysis = await analyzeContract(extractedText, contract.originalFileName);
    contract.analysis = analysis;

    // Update status to completed
    await contract.updateProcessingStatus('completed');

  } catch (error) {
    console.error('Contract processing error:', error);
    
    // Update status to failed
    const contract = await Contract.findById(contractId);
    if (contract) {
      await contract.updateProcessingStatus('failed', error.message);
    }
  }
}

module.exports = router;