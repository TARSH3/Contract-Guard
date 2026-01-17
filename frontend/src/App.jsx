/**
 * Main App Component
 * Handles routing and global layout
 */

import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'

// Import pages
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import UploadPage from './pages/UploadPage'
import ContractPage from './pages/ContractPage'
import ProfilePage from './pages/ProfilePage'

// Import components
import Navbar from './components/Navbar'
import LoadingSpinner from './components/LoadingSpinner'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  const { user, loading } = useAuth()

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="flex-1">
        <Routes>
          {/* Public routes */}
          <Route 
            path="/" 
            element={user ? <Navigate to="/dashboard" replace /> : <LandingPage />} 
          />
          <Route 
            path="/login" 
            element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} 
          />
          <Route 
            path="/register" 
            element={user ? <Navigate to="/dashboard" replace /> : <RegisterPage />} 
          />
          
          {/* Protected routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } />
          
          <Route path="/upload" element={
            <ProtectedRoute>
              <UploadPage />
            </ProtectedRoute>
          } />
          
          <Route path="/contracts/:id" element={
            <ProtectedRoute>
              <ContractPage />
            </ProtectedRoute>
          } />
          
          <Route path="/profile" element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } />
          
          {/* Catch all route - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      
      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8 mt-auto">
        <div className="container-wide">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">CG</span>
              </div>
              <span className="text-gray-600 text-sm">
                © 2024 ContractGuard. All rights reserved.
              </span>
            </div>
            
            <div className="flex items-center space-x-6 text-sm text-gray-500">
              <a href="#" className="hover:text-gray-700 transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-gray-700 transition-colors">
                Terms of Service
              </a>
              <a href="#" className="hover:text-gray-700 transition-colors">
                Contact
              </a>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              <strong>Legal Disclaimer:</strong> This platform provides informational analysis only and does not constitute legal advice. 
              ContractGuard is not a law firm and does not provide legal services. For legal advice, please consult with a qualified attorney.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App