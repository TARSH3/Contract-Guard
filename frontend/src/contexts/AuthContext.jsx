/**
 * Authentication Context
 * Manages user authentication state and provides auth methods
 */

import React, { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../services/api'
import toast from 'react-hot-toast'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Check if user is logged in on app start
  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setLoading(false)
        return
      }

      // Verify token and get user profile
      const response = await authAPI.getProfile()
      setUser(response.data.data.user) // Fixed: added .data
    } catch (error) {
      console.error('Auth check failed:', error)
      // Clear invalid token
      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      const response = await authAPI.login(email, password)
      const { user, token, refreshToken } = response.data.data // Fixed: added .data
      
      // Store tokens
      localStorage.setItem('token', token)
      localStorage.setItem('refreshToken', refreshToken)
      
      // Set user state
      setUser(user)
      
      toast.success('Welcome back!')
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.error || 'Login failed'
      toast.error(message)
      return { success: false, error: message }
    }
  }

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData)
      const { user, token, refreshToken } = response.data.data // Fixed: added .data
      
      // Store tokens
      localStorage.setItem('token', token)
      localStorage.setItem('refreshToken', refreshToken)
      
      // Set user state
      setUser(user)
      
      toast.success('Account created successfully!')
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.error || 'Registration failed'
      toast.error(message)
      return { success: false, error: message }
    }
  }

  const logout = async () => {
    try {
      await authAPI.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // Clear local storage and state
      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')
      setUser(null)
      toast.success('Logged out successfully')
    }
  }

  const updateProfile = async (profileData) => {
    try {
      const response = await authAPI.updateProfile(profileData)
      setUser(response.data.data.user) // Fixed: added .data
      toast.success('Profile updated successfully')
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.error || 'Profile update failed'
      toast.error(message)
      return { success: false, error: message }
    }
  }

  const changePassword = async (currentPassword, newPassword) => {
    try {
      await authAPI.changePassword(currentPassword, newPassword)
      toast.success('Password changed successfully')
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.error || 'Password change failed'
      toast.error(message)
      return { success: false, error: message }
    }
  }

  const refreshUserData = async () => {
    try {
      const response = await authAPI.refreshProfile()
      setUser(response.data.data.user)
      toast.success('Profile refreshed successfully')
      return { success: true }
    } catch (error) {
      console.error('Failed to refresh user data:', error)
      toast.error('Failed to refresh profile data')
      return { success: false }
    }
  }

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    refreshUserData,
    isAuthenticated: !!user,
    canAnalyzeContract: user?.subscription?.contractsRemaining > 0
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}