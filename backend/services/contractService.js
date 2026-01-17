/**
 * Contract Service
 * Handles PDF text extraction, AI analysis, and report generation
 */

const fs = require('fs').promises;
const pdfParse = require('pdf-parse');
const OpenAI = require('openai');
const PDFDocument = require('pdfkit');

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Extract text from PDF file
 * @param {string} filePath - Path to PDF file
 * @returns {Promise<string>} Extracted text content
 */
async function extractTextFromPDF(filePath) {
  try {
    const dataBuffer = await fs.readFile(filePath);
    const data = await pdfParse(dataBuffer);
    
    if (!data.text || data.text.trim().length === 0) {
      throw new Error('No text content found in PDF. The file might be image-based or corrupted.');
    }
    
    return data.text;
  } catch (error) {
    console.error('PDF extraction error:', error);
    throw new Error(`Failed to extract text from PDF: ${error.message}`);
  }
}

/**
 * Risk clause patterns for rule-based detection
 */
const riskPatterns = {
  'auto-renewal': {
    patterns: [
      /automatically renew/i,
      /auto.?renewal/i,
      /unless.*notice.*terminate/i,
      /shall continue.*unless.*terminated/i,
      /renew.*additional.*term/i
    ],
    severity: 'Medium',
    category: 'auto-renewal'
  },
  'termination-penalty': {
    patterns: [
      /early termination.*fee/i,
      /penalty.*cancel/i,
      /liquidated damages/i,
      /termination.*penalty/i,
      /cancellation.*fee/i
    ],
    severity: 'High',
    category: 'penalty'
  },
  'non-compete': {
    patterns: [
      /non.?compete/i,
      /restraint.*trade/i,
      /competing.*business/i,
      /solicit.*customers/i,
      /covenant.*not.*compete/i
    ],
    severity: 'High',
    category: 'non-compete'
  },
  'arbitration': {
    patterns: [
      /binding arbitration/i,
      /waive.*right.*jury/i,
      /dispute.*arbitration/i,
      /mandatory arbitration/i,
      /arbitration.*agreement/i
    ],
    severity: 'Medium',
    category: 'arbitration'
  },
  'liability-limitation': {
    patterns: [
      /limit.*liability/i,
      /exclude.*damages/i,
      /no.*consequential.*damages/i,
      /liability.*limited.*to/i,
      /maximum.*liability/i
    ],
    severity: 'Medium',
    category: 'liability'
  },
  'hidden-fees': {
    patterns: [
      /additional.*fees/i,
      /service.*charges/i,
      /processing.*fee/i,
      /administrative.*cost/i,
      /miscellaneous.*charges/i
    ],
    severity: 'Medium',
    category: 'hidden-fees'
  },
  'refund-restrictions': {
    patterns: [
      /no.*refund/i,
      /non.?refundable/i,
      /refund.*policy/i,
      /no.*return/i,
      /final.*sale/i
    ],
    severity: 'Medium',
    category: 'refund-restrictions'
  }
};

/**
 * Detect risky clauses using pattern matching
 * @param {string} text - Contract text
 * @returns {Array} Array of detected risky clauses
 */
function detectRiskyClausesRuleBased(text) {
  const detectedClauses = [];
  
  Object.entries(riskPatterns).forEach(([riskType, config]) => {
    config.patterns.forEach(pattern => {
      const matches = text.match(new RegExp(pattern.source, 'gi'));
      if (matches) {
        matches.forEach(match => {
          // Find the sentence containing the match
          const sentences = text.split(/[.!?]+/);
          const matchingSentence = sentences.find(sentence => 
            sentence.toLowerCase().includes(match.toLowerCase())
          );
          
          if (matchingSentence && matchingSentence.trim().length > 0) {
            detectedClauses.push({
              title: formatRiskTitle(riskType),
              quote: matchingSentence.trim().substring(0, 300) + '...',
              severity: config.severity,
              category: config.category,
              riskScore: calculateClauseRiskScore(config.severity, config.category)
            });
          }
        });
      }
    });
  });
  
  // Remove duplicates based on similar quotes
  return removeDuplicateClauses(detectedClauses);
}

/**
 * Format risk type into human-readable title
 */
function formatRiskTitle(riskType) {
  const titles = {
    'auto-renewal': 'Automatic Renewal Clause',
    'termination-penalty': 'Early Termination Penalty',
    'non-compete': 'Non-Compete Restriction',
    'arbitration': 'Mandatory Arbitration',
    'liability-limitation': 'Liability Limitation',
    'hidden-fees': 'Additional Fees',
    'refund-restrictions': 'Refund Restrictions'
  };
  return titles[riskType] || 'Risky Clause';
}

/**
 * Calculate risk score for individual clause
 */
function calculateClauseRiskScore(severity, category) {
  const severityScores = { 'Low': 3, 'Medium': 6, 'High': 9 };
  const categoryWeights = {
    'termination': 1.0,
    'penalty': 0.9,
    'non-compete': 1.0,
    'auto-renewal': 0.7,
    'arbitration': 0.8,
    'liability': 0.8,
    'hidden-fees': 0.6,
    'refund-restrictions': 0.7
  };
  
  const baseScore = severityScores[severity] || 5;
  const weight = categoryWeights[category] || 0.8;
  
  return Math.round(baseScore * weight);
}

/**
 * Remove duplicate clauses based on similarity
 */
function removeDuplicateClauses(clauses) {
  const unique = [];
  
  clauses.forEach(clause => {
    const isDuplicate = unique.some(existing => 
      existing.category === clause.category &&
      existing.quote.substring(0, 100) === clause.quote.substring(0, 100)
    );
    
    if (!isDuplicate) {
      unique.push(clause);
    }
  });
  
  return unique;
}

/**
 * Analyze contract using AI (OpenAI GPT-4)
 * @param {string} contractText - Extracted contract text
 * @param {string} fileName - Original file name for context
 * @returns {Promise<Object>} Analysis results
 */
async function analyzeContract(contractText, fileName) {
  try {
    // First, detect risky clauses using rule-based approach
    const ruleBasedClauses = detectRiskyClausesRuleBased(contractText);
    
    // Prepare AI prompt
    const prompt = `
You are a legal contract analysis expert. Analyze the following contract and provide a comprehensive assessment.

CONTRACT FILE: ${fileName}
CONTRACT TEXT:
${contractText.substring(0, 8000)} ${contractText.length > 8000 ? '...[truncated]' : ''}

Please provide your analysis in the following JSON format:
{
  "summary": "A brief, easy-to-understand summary of the contract in 2-3 sentences using plain language",
  "keyHighlights": ["3-5 key points about the contract terms"],
  "contractType": "employment|service-agreement|rental-lease|purchase-agreement|non-disclosure|partnership|licensing|consulting|other",
  "riskyClauses": [
    {
      "title": "Clear title for the risky clause",
      "quote": "Exact quote from contract (max 200 chars)",
      "explanation": "Why this clause is risky in simple terms",
      "severity": "Low|Medium|High",
      "category": "termination|penalty|auto-renewal|non-compete|arbitration|liability|hidden-fees|refund-restrictions|other",
      "riskScore": 1-10
    }
  ],
  "negotiationTips": ["3-5 specific suggestions for negotiating better terms"],
  "confidence": 0.0-1.0
}

Focus on:
1. Use simple, non-legal language that anyone can understand
2. Identify clauses that could financially harm or legally bind the signer
3. Provide actionable negotiation advice
4. Be thorough but concise
5. Rate risk severity based on potential impact to the average person

IMPORTANT: Return only valid JSON, no additional text.`;

    // Call OpenAI API with error handling
    let response;
    try {
      response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a legal expert specializing in contract analysis. Provide clear, actionable insights in JSON format only.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 2000
      });
    } catch (openaiError) {
      console.error('OpenAI API Error:', openaiError.message);
      // Throw error to trigger fallback analysis
      throw new Error(`OpenAI API failed: ${openaiError.message}`);
    }

    // Parse AI response
    let aiAnalysis;
    try {
      aiAnalysis = JSON.parse(response.choices[0].message.content);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      // Fallback to rule-based analysis
      aiAnalysis = createFallbackAnalysis(contractText, fileName);
    }

    // Combine rule-based and AI-detected clauses
    const combinedClauses = combineRiskyClauses(ruleBasedClauses, aiAnalysis.riskyClauses || []);
    
    // Add explanations to rule-based clauses
    const enhancedClauses = await enhanceClausesWithExplanations(combinedClauses);

    // Calculate overall risk score
    const overallRiskScore = calculateOverallRiskScore(enhancedClauses);
    
    // Generate recommendation
    const recommendation = generateRecommendation(overallRiskScore, enhancedClauses);

    return {
      summary: aiAnalysis.summary || 'Contract analysis completed.',
      keyHighlights: aiAnalysis.keyHighlights || [],
      contractType: aiAnalysis.contractType || 'other',
      riskyClauses: enhancedClauses,
      overallRiskScore,
      recommendation,
      negotiationTips: aiAnalysis.negotiationTips || [],
      analysisVersion: '1.0',
      aiModel: 'gpt-4',
      confidence: aiAnalysis.confidence || 0.8
    };

  } catch (error) {
    console.error('AI analysis error:', error);
    
    // Always provide fallback analysis
    const ruleBasedClauses = detectRiskyClausesRuleBased(contractText);
    const enhancedClauses = ruleBasedClauses.map(clause => ({
      ...clause,
      explanation: clause.explanation || getDefaultExplanation(clause.category)
    }));
    const overallRiskScore = calculateOverallRiskScore(enhancedClauses);
    const recommendation = generateRecommendation(overallRiskScore, enhancedClauses);

    return createFallbackAnalysis(contractText, fileName, enhancedClauses, overallRiskScore, recommendation);
  }
}

/**
 * Create fallback analysis when AI fails
 */
function createFallbackAnalysis(contractText, fileName, riskyClauses = [], overallRiskScore = null, recommendation = null) {
  // Use rule-based analysis if no clauses provided
  if (riskyClauses.length === 0) {
    riskyClauses = detectRiskyClausesRuleBased(contractText);
  }
  
  // Calculate risk score if not provided
  if (overallRiskScore === null) {
    overallRiskScore = calculateOverallRiskScore(riskyClauses);
  }
  
  // Generate recommendation if not provided
  if (recommendation === null) {
    recommendation = generateRecommendation(overallRiskScore, riskyClauses);
  }

  return {
    summary: `This appears to be a legal contract (${fileName}). Our analysis has identified ${riskyClauses.length} areas that require attention. Please review carefully before signing.`,
    keyHighlights: [
      'Contract contains standard legal terms',
      `${riskyClauses.length} potential risk areas identified`,
      'Consider consulting a legal professional for complex terms'
    ],
    contractType: 'other',
    riskyClauses: riskyClauses,
    overallRiskScore,
    recommendation,
    negotiationTips: [
      'Review all terms carefully before signing',
      'Consider negotiating unfavorable clauses',
      'Seek legal advice if unsure about any terms',
      'Ask for clarification on complex language'
    ],
    analysisVersion: '1.0',
    aiModel: 'rule-based-fallback',
    confidence: 0.6
  };
}

/**
 * Combine rule-based and AI-detected clauses
 */
function combineRiskyClauses(ruleBasedClauses, aiClauses) {
  const combined = [...ruleBasedClauses];
  
  // Add AI clauses that aren't already detected by rules
  aiClauses.forEach(aiClause => {
    const isDuplicate = combined.some(existing => 
      existing.category === aiClause.category &&
      existing.quote.substring(0, 50) === aiClause.quote.substring(0, 50)
    );
    
    if (!isDuplicate) {
      combined.push(aiClause);
    }
  });
  
  return combined.slice(0, 10); // Limit to top 10 risky clauses
}

/**
 * Enhance clauses with AI-generated explanations
 */
async function enhanceClausesWithExplanations(clauses) {
  const enhanced = [];
  
  for (const clause of clauses) {
    if (!clause.explanation) {
      // Generate explanation using AI
      try {
        const explanationPrompt = `Explain why this contract clause is risky in simple terms (max 100 words): "${clause.quote}"`;
        
        const response = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: explanationPrompt }],
          temperature: 0.3,
          max_tokens: 150
        });
        
        clause.explanation = response.choices[0].message.content.trim();
      } catch (error) {
        // Fallback explanation
        clause.explanation = getDefaultExplanation(clause.category);
      }
    }
    
    enhanced.push(clause);
  }
  
  return enhanced;
}

/**
 * Get default explanation for clause category
 */
function getDefaultExplanation(category) {
  const explanations = {
    'auto-renewal': 'This clause automatically extends your contract without your explicit consent, potentially locking you into unwanted terms.',
    'penalty': 'This clause imposes financial penalties for early termination, which could be costly if you need to exit the contract.',
    'non-compete': 'This clause restricts your ability to work in your field after the contract ends, potentially limiting your career options.',
    'arbitration': 'This clause requires disputes to be resolved through arbitration instead of court, limiting your legal options.',
    'liability': 'This clause limits the other party\'s responsibility for damages, potentially leaving you unprotected.',
    'hidden-fees': 'This clause allows for additional charges that may not be clearly disclosed upfront.',
    'refund-restrictions': 'This clause limits your ability to get refunds, potentially putting your money at risk.'
  };
  
  return explanations[category] || 'This clause contains terms that could be disadvantageous to you.';
}

/**
 * Calculate overall risk score
 */
function calculateOverallRiskScore(riskyClauses) {
  if (riskyClauses.length === 0) return 20; // Low risk if no risky clauses found
  
  let totalScore = 0;
  let maxPossibleScore = 0;
  
  riskyClauses.forEach(clause => {
    const severityMultiplier = {
      'Low': 1,
      'Medium': 2,
      'High': 3
    };
    
    const categoryWeight = {
      'termination': 0.9,
      'penalty': 0.8,
      'non-compete': 0.9,
      'auto-renewal': 0.6,
      'arbitration': 0.7,
      'liability': 0.8,
      'hidden-fees': 0.6,
      'refund-restrictions': 0.7,
      'other': 0.7
    };
    
    const clauseScore = (clause.riskScore || 5) * 
                       severityMultiplier[clause.severity] * 
                       (categoryWeight[clause.category] || 0.7);
    
    totalScore += clauseScore;
    maxPossibleScore += 30; // Max possible per clause
  });
  
  const normalizedScore = Math.min(100, Math.round((totalScore / maxPossibleScore) * 100));
  
  // Ensure minimum score based on number of risky clauses
  const minScore = Math.min(30 + (riskyClauses.length * 5), 70);
  
  return Math.max(normalizedScore, minScore);
}

/**
 * Generate final recommendation
 */
function generateRecommendation(overallRiskScore, riskyClauses) {
  const highRiskClauses = riskyClauses.filter(clause => clause.severity === 'High').length;
  
  if (overallRiskScore >= 70 || highRiskClauses >= 2) {
    return 'Avoid signing';
  } else if (overallRiskScore >= 40 || highRiskClauses >= 1) {
    return 'Review carefully';
  } else {
    return 'Safe to sign';
  }
}

/**
 * Generate PDF report
 * @param {Object} contract - Contract document
 * @param {Object} user - User document
 * @returns {Promise<Buffer>} PDF buffer
 */
async function generatePDFReport(contract, user) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const buffers = [];
      
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });

      // Header
      doc.fontSize(20).text('ContractGuard Analysis Report', { align: 'center' });
      doc.moveDown();
      
      // Contract info
      doc.fontSize(14).text(`Contract: ${contract.originalFileName}`);
      doc.text(`Analyzed: ${contract.createdAt.toLocaleDateString()}`);
      doc.text(`User: ${user.getFullName()}`);
      doc.moveDown();

      // Risk score
      const riskLevel = contract.riskLevel;
      const riskColor = riskLevel === 'High' ? 'red' : riskLevel === 'Medium' ? 'orange' : 'green';
      
      doc.fontSize(16).text('Overall Risk Assessment', { underline: true });
      doc.fontSize(14).text(`Risk Score: ${contract.analysis.overallRiskScore}/100 (${riskLevel} Risk)`);
      doc.text(`Recommendation: ${contract.analysis.recommendation}`);
      doc.moveDown();

      // Summary
      if (contract.analysis.summary) {
        doc.fontSize(16).text('Executive Summary', { underline: true });
        doc.fontSize(12).text(contract.analysis.summary, { align: 'justify' });
        doc.moveDown();
      }

      // Key highlights
      if (contract.analysis.keyHighlights && contract.analysis.keyHighlights.length > 0) {
        doc.fontSize(16).text('Key Highlights', { underline: true });
        contract.analysis.keyHighlights.forEach((highlight, index) => {
          doc.fontSize(12).text(`${index + 1}. ${highlight}`);
        });
        doc.moveDown();
      }

      // Risky clauses
      if (contract.analysis.riskyClauses && contract.analysis.riskyClauses.length > 0) {
        doc.fontSize(16).text('Risky Clauses Identified', { underline: true });
        
        contract.analysis.riskyClauses.forEach((clause, index) => {
          doc.fontSize(14).text(`${index + 1}. ${clause.title} (${clause.severity} Risk)`);
          doc.fontSize(11).text(`Quote: "${clause.quote}"`);
          doc.fontSize(11).text(`Risk: ${clause.explanation}`);
          doc.moveDown(0.5);
        });
        doc.moveDown();
      }

      // Negotiation tips
      if (contract.analysis.negotiationTips && contract.analysis.negotiationTips.length > 0) {
        doc.fontSize(16).text('Negotiation Recommendations', { underline: true });
        contract.analysis.negotiationTips.forEach((tip, index) => {
          doc.fontSize(12).text(`${index + 1}. ${tip}`);
        });
        doc.moveDown();
      }

      // Disclaimer
      doc.fontSize(10).text(
        'DISCLAIMER: This analysis is for informational purposes only and does not constitute legal advice. ' +
        'ContractGuard is not a law firm and does not provide legal services. For legal advice, please consult ' +
        'with a qualified attorney licensed in your jurisdiction.',
        { align: 'center', oblique: true }
      );

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

module.exports = {
  extractTextFromPDF,
  analyzeContract,
  generatePDFReport,
  detectRiskyClausesRuleBased,
  calculateOverallRiskScore,
  generateRecommendation
};