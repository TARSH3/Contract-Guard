/**
 * Upload Page Component
 * Contract upload interface with drag & drop
 */

import React, { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDropzone } from 'react-dropzone'
import { useAuth } from '../contexts/AuthContext'
import { contractAPI, formatFileSize } from '../services/api'
import { 
  Upload, 
  FileText, 
  AlertCircle, 
  CheckCircle, 
  X,
  Shield,
  Clock,
  Zap
} from 'lucide-react'
import LoadingSpinner from '../components/LoadingSpinner'
import toast from 'react-hot-toast'

const UploadPage = () => {
  const { user, canAnalyzeContract } = useAuth()
  const navigate = useNavigate()
  const [selectedFile, setSelectedFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    // Handle rejected files
    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0]
      if (rejection.errors.some(e => e.code === 'file-too-large')) {
        toast.error('File too large. Maximum size is 10MB.')
      } else if (rejection.errors.some(e => e.code === 'file-invalid-type')) {
        toast.error('Invalid file type. Only PDF files are allowed.')
      } else {
        toast.error('File rejected. Please try again.')
      }
      return
    }

    // Handle accepted file
    if (acceptedFiles.length > 0) {
      setSelectedFile(acceptedFiles[0])
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false
  })

  const removeFile = () => {
    setSelectedFile(null)
    setUploadProgress(0)
  }

  const uploadContract = async () => {
    if (!selectedFile) {
      toast.error('Please select a file to upload')
      return
    }

    if (!canAnalyzeContract) {
      toast.error('No contract analyses remaining. Please upgrade your plan.')
      return
    }

    setUploading(true)
    setUploadProgress(0)

    try {
      const formData = new FormData()
      formData.append('contract', selectedFile)

      const response = await contractAPI.upload(formData, (progressEvent) => {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        setUploadProgress(progress)
      })

      const { contractId } = response.data

      toast.success('Contract uploaded successfully! Analysis in progress...')
      
      // Navigate to contract page
      navigate(`/contracts/${contractId}`)

    } catch (error) {
      console.error('Upload failed:', error)
      const message = error.response?.data?.error || 'Upload failed. Please try again.'
      toast.error(message)
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-narrow">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Upload Your Contract
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Upload a PDF contract and get instant AI-powered analysis with risk assessment, 
            plain language summaries, and negotiation recommendations.
          </p>
        </div>

        {/* Usage Info */}
        <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Shield className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-800">
                  {user?.subscription?.contractsRemaining || 0} analyses remaining
                </p>
                <p className="text-xs text-blue-600">
                  {user?.subscription?.plan || 'Free'} plan
                </p>
              </div>
            </div>
            {user?.subscription?.plan === 'free' && (
              <button className="text-sm text-blue-600 hover:text-blue-500 font-medium">
                Upgrade Plan
              </button>
            )}
          </div>
        </div>

        {/* Upload Area */}
        <div className="card mb-8">
          <div className="card-body">
            {!selectedFile ? (
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
                  isDragActive 
                    ? 'border-primary-400 bg-primary-50' 
                    : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
                }`}
              >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center">
                  <Upload className={`w-12 h-12 mb-4 ${isDragActive ? 'text-primary-600' : 'text-gray-400'}`} />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {isDragActive ? 'Drop your contract here' : 'Upload your contract'}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Drag and drop your PDF file here, or click to browse
                  </p>
                  <div className="text-sm text-gray-500">
                    <p>Supported format: PDF</p>
                    <p>Maximum file size: 10MB</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <FileText className="w-10 h-10 text-primary-600" />
                    <div>
                      <p className="font-medium text-gray-900">{selectedFile.name}</p>
                      <p className="text-sm text-gray-500">
                        {formatFileSize(selectedFile.size)} • PDF
                      </p>
                    </div>
                  </div>
                  
                  {!uploading && (
                    <button
                      onClick={removeFile}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>

                {uploading && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                      <span>Uploading...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={uploadContract}
            disabled={!selectedFile || uploading || !canAnalyzeContract}
            className="btn-primary btn-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? (
              <div className="flex items-center">
                <LoadingSpinner size="sm" color="white" className="mr-2" />
                Analyzing Contract...
              </div>
            ) : (
              <div className="flex items-center">
                <Zap className="w-5 h-5 mr-2" />
                Analyze Contract
              </div>
            )}
          </button>
          
          {selectedFile && !uploading && (
            <button
              onClick={removeFile}
              className="btn-outline btn-lg"
            >
              Choose Different File
            </button>
          )}
        </div>

        {/* What Happens Next */}
        <div className="mt-12 card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">What happens next?</h3>
          </div>
          <div className="card-body">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Upload className="w-6 h-6 text-primary-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">1. Upload & Extract</h4>
                <p className="text-sm text-gray-600">
                  We securely extract text from your PDF and prepare it for analysis
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-6 h-6 text-primary-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">2. AI Analysis</h4>
                <p className="text-sm text-gray-600">
                  Our AI identifies risky clauses and creates plain language summaries
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-6 h-6 text-primary-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">3. Get Results</h4>
                <p className="text-sm text-gray-600">
                  Receive detailed analysis with risk scores and negotiation tips
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-8 p-4 bg-gray-100 rounded-lg">
          <div className="flex items-start space-x-3">
            <Shield className="w-5 h-5 text-gray-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-gray-900 mb-1">Your data is secure</h4>
              <p className="text-sm text-gray-600">
                All uploaded contracts are encrypted and automatically deleted after analysis. 
                We never store your contract content permanently.
              </p>
            </div>
          </div>
        </div>

        {/* Legal Disclaimer */}
        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-yellow-800 mb-1">Legal Disclaimer</h4>
              <p className="text-sm text-yellow-700">
                This analysis is for informational purposes only and does not constitute legal advice. 
                For legal guidance, please consult with a qualified attorney.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UploadPage