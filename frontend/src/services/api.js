/**
 * API Service
 * Handles all HTTP requests to the backend API
 */

import axios from 'axios'
import toast from 'react-hot-toast'

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 30000, // 30 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors and token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // Handle 401 errors (unauthorized)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = localStorage.getItem('refreshToken')
        if (refreshToken) {
          const response = await axios.post(`${import.meta.env.VITE_API_URL || '/api'}/auth/refresh-token`, {
            refreshToken
          })
          
          const { token } = response.data.data
          localStorage.setItem('token', token)
          
          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${token}`
          return api(originalRequest)
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    // Handle network errors
    if (!error.response) {
      toast.error('Network error. Please check your connection.')
    }

    return Promise.reject(error)
  }
)

// Auth API endpoints
export const authAPI = {
  login: (email, password) => 
    api.post('/auth/login', { email, password }),
  
  register: (userData) => 
    api.post('/auth/register', userData),
  
  logout: () => 
    api.post('/auth/logout'),
  
  getProfile: () => 
    api.get('/auth/profile'),
  
  updateProfile: (profileData) => 
    api.put('/auth/profile', profileData),
  
  changePassword: (currentPassword, newPassword) => 
    api.post('/auth/change-password', { currentPassword, newPassword }),
  
  getSubscription: () => 
    api.get('/auth/subscription'),
  
  refreshProfile: () => 
    api.post('/auth/refresh-profile'),
}

// Contract API endpoints
export const contractAPI = {
  upload: (formData, onUploadProgress) => 
    api.post('/contracts/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress,
    }),
  
  getContracts: (params = {}) => 
    api.get('/contracts', { params }),
  
  getContract: (id) => 
    api.get(`/contracts/${id}`),
  
  deleteContract: (id) => 
    api.delete(`/contracts/${id}`),
  
  getContractStatus: (id) => 
    api.get(`/contracts/${id}/status`),
  
  downloadReport: (id) => 
    api.get(`/contracts/${id}/download-report`, {
      responseType: 'blob',
    }),
  
  submitFeedback: (id, rating, feedback) => 
    api.post(`/contracts/${id}/feedback`, { rating, feedback }),
  
  getDashboardStats: () => 
    api.get('/contracts/stats/dashboard'),
}

// Utility functions
export const downloadFile = (blob, filename) => {
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export const getRiskColor = (riskScore) => {
  if (riskScore >= 70) return 'danger'
  if (riskScore >= 40) return 'warning'
  return 'success'
}

export const getRiskLevel = (riskScore) => {
  if (riskScore >= 70) return 'High'
  if (riskScore >= 40) return 'Medium'
  return 'Low'
}

export const getSeverityColor = (severity) => {
  switch (severity?.toLowerCase()) {
    case 'high': return 'danger'
    case 'medium': return 'warning'
    case 'low': return 'success'
    default: return 'secondary'
  }
}

export default api