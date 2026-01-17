/**
 * Contract Page Component
 * Displays detailed contract analysis results
 */

import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { contractAPI, formatDate, getRiskColor, getRiskLevel, getSeverityColor, downloadFile } from '../services/api'
import { 
  ArrowLeft, 
  Download, 
  FileText, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Star,
  MessageSquare,
  Shield,
  Eye,
  Calendar
} from 'lucide-react'
import LoadingSpinner from '../components/LoadingSpinner'
import toast from 'react-hot-toast'

const ContractPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [contract, setContract] = useState(null)
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)
  const [rating, setRating] = useState(0)
  const [feedback, setFeedback] = useState('')

  useEffect(() => {
    loadContract()
  }, [id])

  const loadContract = async () => {
    try {
      const response = await contractAPI.getContract(id)
      setContract(response.data.data.contract) // Fixed: added .data
    } catch (error) {
      console.error('Failed to load contract:', error)
      toast.error('Failed to load contract')
      navigate('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadReport = async () => {
    if (contract.processingStatus !== 'completed') {
      toast.error('Analysis not completed yet')
      return
    }

    setDownloading(true)
    try {
      const response = await contractAPI.downloadReport(id)
      downloadFile(response.data, `${contract.originalFileName}-analysis.pdf`)
      toast.success('Report downloaded successfully')
    } catch (error) {
      console.error('Download failed:', error)
      toast.error('Failed to download report')
    } finally {
      setDownloading(false)
    }
  }

  const handleSubmitFeedback = async () => {
    if (rating === 0) {
      toast.error('Please select a rating')
      return
    }

    try {
      await contractAPI.submitFeedback(id, rating, feedback)
      toast.success('Feedback submitted successfully')
      setShowFeedback(false)
      setRating(0)
      setFeedback('')
    } catch (error) {
      console.error('Failed to submit feedback:', error)
      toast.error('Failed to submit feedback')
    }
  }

  const getRiskIcon = (riskScore) => {
    if (riskScore >= 70) return <AlertTriangle className="w-6 h-6 text-danger-600" />
    if (riskScore >= 40) return <Clock className="w-6 h-6 text-warning-600" />
    return <CheckCircle className="w-6 h-6 text-success-600" />
  }

  const getRecommendationColor = (recommendation) => {
    if (recommendation === 'Avoid signing') return 'danger'
    if (recommendation === 'Review carefully') return 'warning'
    return 'success'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading contract analysis..." />
      </div>
    )
  }

  if (!contract) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Contract not found</h2>
          <Link to="/dashboard" className="btn-primary">
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-narrow">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {contract.originalFileName}
              </h1>
              <p className="text-gray-600">
                Analyzed on {formatDate(contract.createdAt)}
              </p>
            </div>
          </div>

          {contract.processingStatus === 'completed' && (
            <button
              onClick={handleDownloadReport}
              disabled={downloading}
              className="btn-primary flex items-center"
            >
              {downloading ? (
                <LoadingSpinner size="sm" color="white" className="mr-2" />
              ) : (
                <Download className="w-4 h-4 mr-2" />
              )}
              Download Report
            </button>
          )}
        </div>

        {/* Processing Status */}
        {contract.processingStatus !== 'completed' && (
          <div className="card mb-8">
            <div className="card-body text-center">
              {contract.processingStatus === 'pending' && (
                <>
                  <Clock className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Analysis Pending</h3>
                  <p className="text-gray-600">Your contract is queued for analysis. This usually takes 30-60 seconds.</p>
                </>
              )}
              
              {contract.processingStatus === 'processing' && (
                <>
                  <LoadingSpinner size="lg" className="mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Analyzing Contract</h3>
                  <p className="text-gray-600">Our AI is analyzing your contract for risky clauses and generating recommendations.</p>
                </>
              )}
              
              {contract.processingStatus === 'failed' && (
                <>
                  <AlertTriangle className="w-12 h-12 text-danger-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Analysis Failed</h3>
                  <p className="text-gray-600 mb-4">
                    {contract.errorMessage || 'Something went wrong during analysis. Please try uploading again.'}
                  </p>
                  <Link to="/upload" className="btn-primary">
                    Upload New Contract
                  </Link>
                </>
              )}
            </div>
          </div>
        )}

        {/* Analysis Results */}
        {contract.processingStatus === 'completed' && contract.analysis && (
          <>
            {/* Risk Overview */}
            <div className="card mb-8">
              <div className="card-body">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    {getRiskIcon(contract.analysis.overallRiskScore)}
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        Risk Score: {contract.analysis.overallRiskScore}/100
                      </h2>
                      <p className="text-lg text-gray-600">
                        {getRiskLevel(contract.analysis.overallRiskScore)} Risk Contract
                      </p>
                    </div>
                  </div>
                  
                  <div className={`px-4 py-2 rounded-lg text-center risk-${getRecommendationColor(contract.analysis.recommendation)}`}>
                    <p className="font-semibold">Recommendation</p>
                    <p className="text-sm">{contract.analysis.recommendation}</p>
                  </div>
                </div>

                {/* Risk Score Bar */}
                <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                  <div 
                    className={`h-3 rounded-full bg-${getRiskColor(contract.analysis.overallRiskScore)}-600`}
                    style={{ width: `${contract.analysis.overallRiskScore}%` }}
                  />
                </div>
                
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Low Risk (0-39)</span>
                  <span>Medium Risk (40-69)</span>
                  <span>High Risk (70-100)</span>
                </div>
              </div>
            </div>

            {/* Summary */}
            {contract.analysis.summary && (
              <div className="card mb-8">
                <div className="card-header">
                  <h3 className="text-lg font-semibold text-gray-900">Executive Summary</h3>
                </div>
                <div className="card-body">
                  <p className="text-gray-700 leading-relaxed">{contract.analysis.summary}</p>
                </div>
              </div>
            )}

            {/* Key Highlights */}
            {contract.analysis.keyHighlights && contract.analysis.keyHighlights.length > 0 && (
              <div className="card mb-8">
                <div className="card-header">
                  <h3 className="text-lg font-semibold text-gray-900">Key Highlights</h3>
                </div>
                <div className="card-body">
                  <ul className="space-y-2">
                    {contract.analysis.keyHighlights.map((highlight, index) => (
                      <li key={index} className="flex items-start space-x-3">
                        <CheckCircle className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Risky Clauses */}
            {contract.analysis.riskyClauses && contract.analysis.riskyClauses.length > 0 && (
              <div className="card mb-8">
                <div className="card-header">
                  <h3 className="text-lg font-semibold text-gray-900">Risky Clauses Identified</h3>
                </div>
                <div className="card-body p-0">
                  <div className="divide-y divide-gray-200">
                    {contract.analysis.riskyClauses.map((clause, index) => (
                      <div key={index} className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="text-lg font-semibold text-gray-900">{clause.title}</h4>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium risk-${getSeverityColor(clause.severity)}`}>
                            {clause.severity} Risk
                          </span>
                        </div>
                        
                        <div className="bg-gray-50 rounded-lg p-4 mb-4">
                          <p className="text-sm text-gray-600 mb-2">Contract Quote:</p>
                          <p className="text-gray-800 italic">"{clause.quote}"</p>
                        </div>
                        
                        <div className="mb-4">
                          <p className="text-sm font-medium text-gray-700 mb-2">Why this is risky:</p>
                          <p className="text-gray-600">{clause.explanation}</p>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-500">Risk Score:</span>
                            <span className="font-semibold text-gray-900">{clause.riskScore}/10</span>
                          </div>
                          <span className="text-sm text-gray-500 capitalize">{clause.category}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Negotiation Tips */}
            {contract.analysis.negotiationTips && contract.analysis.negotiationTips.length > 0 && (
              <div className="card mb-8">
                <div className="card-header">
                  <h3 className="text-lg font-semibold text-gray-900">Negotiation Recommendations</h3>
                </div>
                <div className="card-body">
                  <ul className="space-y-3">
                    {contract.analysis.negotiationTips.map((tip, index) => (
                      <li key={index} className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-primary-600 text-sm font-semibold">{index + 1}</span>
                        </div>
                        <span className="text-gray-700">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Feedback Section */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-semibold text-gray-900">Rate This Analysis</h3>
              </div>
              <div className="card-body">
                {!showFeedback ? (
                  <div className="text-center">
                    <p className="text-gray-600 mb-4">
                      How helpful was this contract analysis?
                    </p>
                    <button
                      onClick={() => setShowFeedback(true)}
                      className="btn-outline flex items-center mx-auto"
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Leave Feedback
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="mb-4">
                      <label className="form-label">Rating</label>
                      <div className="flex items-center space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => setRating(star)}
                            className={`p-1 ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
                          >
                            <Star className="w-6 h-6 fill-current" />
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <label className="form-label">Comments (optional)</label>
                      <textarea
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        className="form-input"
                        rows={3}
                        placeholder="Tell us how we can improve..."
                      />
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={handleSubmitFeedback}
                        className="btn-primary"
                      >
                        Submit Feedback
                      </button>
                      <button
                        onClick={() => setShowFeedback(false)}
                        className="btn-outline"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Legal Disclaimer */}
        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start space-x-3">
            <Shield className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-yellow-800 mb-1">Legal Disclaimer</h4>
              <p className="text-sm text-yellow-700">
                This analysis is for informational purposes only and does not constitute legal advice. 
                For legal guidance, please consult with a qualified attorney licensed in your jurisdiction.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ContractPage