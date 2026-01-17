/**
 * Dashboard Page Component
 * Main user dashboard with statistics and recent contracts
 */

import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { contractAPI, formatDate, getRiskColor, getRiskLevel } from '../services/api'
import { 
  Upload, 
  FileText, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp,
  Clock,
  Shield,
  BarChart3,
  Plus,
  Eye,
  Download,
  RefreshCw
} from 'lucide-react'
import LoadingSpinner from '../components/LoadingSpinner'
import toast from 'react-hot-toast'

const DashboardPage = () => {
  const { user, refreshUserData } = useAuth()
  const [stats, setStats] = useState(null)
  const [recentContracts, setRecentContracts] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const response = await contractAPI.getDashboardStats()
      setStats(response.data.data.stats) // Fixed: added .data
      setRecentContracts(response.data.data.recentContracts) // Fixed: added .data
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const getRiskIcon = (riskScore) => {
    if (riskScore >= 70) return <AlertTriangle className="w-5 h-5 text-danger-600" />
    if (riskScore >= 40) return <Clock className="w-5 h-5 text-warning-600" />
    return <CheckCircle className="w-5 h-5 text-success-600" />
  }

  const handleRefreshProfile = async () => {
    setRefreshing(true)
    await refreshUserData()
    setRefreshing(false)
  }

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-gray-100 text-gray-800',
      processing: 'bg-blue-100 text-blue-800',
      completed: 'bg-success-100 text-success-800',
      failed: 'bg-danger-100 text-danger-800'
    }
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badges[status] || badges.pending}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading dashboard..." />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-wide">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {user?.firstName}!
              </h1>
              <p className="text-gray-600 mt-2">
                Here's an overview of your contract analysis activity
              </p>
            </div>
            <button
              onClick={handleRefreshProfile}
              disabled={refreshing}
              className="btn-outline btn-sm flex items-center"
              title="Refresh profile data"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* Pro Status Alert */}
        {user?.subscription?.plan !== 'pro' && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <RefreshCw className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-blue-900">
                    Not seeing your Pro status?
                  </h3>
                  <p className="text-sm text-blue-700">
                    Click the refresh button above to update your profile data
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              to="/upload"
              className="btn-primary btn-lg flex items-center justify-center"
            >
              <Plus className="w-5 h-5 mr-2" />
              Analyze New Contract
            </Link>
            
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4" />
                <span>{user?.subscription?.contractsRemaining || 0} analyses remaining</span>
              </div>
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-4 h-4" />
                <span>{user?.subscription?.plan || 'Free'} plan</span>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FileText className="w-8 h-8 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Contracts</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.totalContracts || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="card card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="w-8 h-8 text-warning-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Avg Risk Score</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.avgRiskScore ? Math.round(stats.avgRiskScore) : 0}
                </p>
              </div>
            </div>
          </div>

          <div className="card card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertTriangle className="w-8 h-8 text-danger-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">High Risk</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.highRiskContracts || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="card card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="w-8 h-8 text-success-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Safe Contracts</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.lowRiskContracts || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Risk Distribution Chart */}
        {stats && stats.totalContracts > 0 && (
          <div className="card mb-8">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900">Risk Distribution</h3>
            </div>
            <div className="card-body">
              <div className="flex items-center space-x-8">
                <div className="flex-1">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Low Risk</span>
                    <span>{stats.lowRiskContracts}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-success-600 h-2 rounded-full" 
                      style={{ width: `${(stats.lowRiskContracts / stats.totalContracts) * 100}%` }}
                    />
                  </div>
                </div>
                
                <div className="flex-1">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Medium Risk</span>
                    <span>{stats.mediumRiskContracts}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-warning-600 h-2 rounded-full" 
                      style={{ width: `${(stats.mediumRiskContracts / stats.totalContracts) * 100}%` }}
                    />
                  </div>
                </div>
                
                <div className="flex-1">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>High Risk</span>
                    <span>{stats.highRiskContracts}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-danger-600 h-2 rounded-full" 
                      style={{ width: `${(stats.highRiskContracts / stats.totalContracts) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recent Contracts */}
        <div className="card">
          <div className="card-header flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Recent Contracts</h3>
            <Link to="/contracts" className="text-sm text-primary-600 hover:text-primary-500">
              View all
            </Link>
          </div>
          <div className="card-body p-0">
            {recentContracts.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No contracts yet</h3>
                <p className="text-gray-600 mb-4">
                  Upload your first contract to get started with AI-powered analysis
                </p>
                <Link to="/upload" className="btn-primary">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Contract
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {recentContracts.map((contract) => (
                  <div key={contract._id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          {getRiskIcon(contract.analysis?.overallRiskScore)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {contract.originalFileName || contract.fileName}
                          </p>
                          <div className="flex items-center space-x-4 mt-1">
                            <p className="text-sm text-gray-500">
                              {formatDate(contract.createdAt)}
                            </p>
                            {contract.analysis?.overallRiskScore !== undefined && (
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium risk-${getRiskColor(contract.analysis.overallRiskScore)}`}>
                                {getRiskLevel(contract.analysis.overallRiskScore)} Risk
                              </span>
                            )}
                            {getStatusBadge(contract.processingStatus)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {contract.analysis?.recommendation && (
                          <span className="text-sm text-gray-600 hidden sm:block">
                            {contract.analysis.recommendation}
                          </span>
                        )}
                        
                        <div className="flex items-center space-x-1">
                          <Link
                            to={`/contracts/${contract._id}`}
                            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                            title="View details"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          
                          {contract.processingStatus === 'completed' && (
                            <button
                              onClick={() => {
                                // Handle download
                                contractAPI.downloadReport(contract._id)
                                  .then(response => {
                                    const url = window.URL.createObjectURL(new Blob([response.data]))
                                    const link = document.createElement('a')
                                    link.href = url
                                    link.download = `${contract.originalFileName}-analysis.pdf`
                                    link.click()
                                  })
                                  .catch(error => {
                                    console.error('Download failed:', error)
                                    toast.error('Failed to download report')
                                  })
                              }}
                              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                              title="Download report"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Subscription Status */}
        {user?.subscription?.plan === 'pro' ? (
          <div className="mt-8 card">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-purple-900">✨ Pro Member Benefits</h3>
                  <p className="text-purple-700 mt-1">
                    You have access to all premium features and advanced AI analysis
                  </p>
                  <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-purple-600" />
                      <span>500 analyses per year</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-purple-600" />
                      <span>Advanced AI analysis</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-purple-600" />
                      <span>PDF report downloads</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-purple-600" />
                      <span>Priority support</span>
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-2">
                    <Shield className="w-8 h-8 text-purple-600" />
                  </div>
                  <span className="text-purple-600 font-semibold">Pro</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          user?.subscription?.plan === 'free' && (
            <div className="mt-8 card">
              <div className="card-body">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Upgrade Your Plan</h3>
                    <p className="text-gray-600 mt-1">
                      Get unlimited contract analyses and advanced features with Pro
                    </p>
                  </div>
                  <button className="btn-primary">
                    Upgrade to Pro
                  </button>
                </div>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  )
}

export default DashboardPage