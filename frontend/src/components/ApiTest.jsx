/**
 * API Test Component
 * Simple component to test backend connectivity
 */

import React, { useState, useEffect } from 'react'
import { authAPI } from '../services/api'

const ApiTest = () => {
  const [apiStatus, setApiStatus] = useState('Testing...')
  const [apiUrl, setApiUrl] = useState('')

  useEffect(() => {
    testApiConnection()
  }, [])

  const testApiConnection = async () => {
    const baseUrl = import.meta.env.VITE_API_URL || '/api'
    setApiUrl(baseUrl)
    
    try {
      // Test health endpoint
      const response = await fetch(`${baseUrl.replace('/api', '')}/api/health`)
      const data = await response.json()
      
      if (data.status === 'OK') {
        setApiStatus('✅ Backend Connected Successfully')
      } else {
        setApiStatus('❌ Backend Response Invalid')
      }
    } catch (error) {
      console.error('API Test Error:', error)
      setApiStatus(`❌ Connection Failed: ${error.message}`)
    }
  }

  const testRegistration = async () => {
    try {
      const testUser = {
        firstName: 'Test',
        lastName: 'User',
        email: `test${Date.now()}@example.com`,
        password: 'Test123'
      }
      
      const response = await authAPI.register(testUser)
      console.log('Registration test:', response)
      setApiStatus('✅ Registration Test Passed')
    } catch (error) {
      console.error('Registration test failed:', error)
      setApiStatus(`❌ Registration Failed: ${error.message}`)
    }
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg p-4 shadow-lg max-w-sm">
      <h3 className="font-semibold text-gray-900 mb-2">API Debug Info</h3>
      <div className="text-sm space-y-1">
        <p><strong>API URL:</strong> {apiUrl}</p>
        <p><strong>Status:</strong> {apiStatus}</p>
        <button 
          onClick={testRegistration}
          className="mt-2 px-3 py-1 bg-blue-500 text-white rounded text-xs"
        >
          Test Registration
        </button>
      </div>
    </div>
  )
}

export default ApiTest