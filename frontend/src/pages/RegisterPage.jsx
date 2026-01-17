/**
 * Register Page Component
 * User registration form
 */

import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuth } from '../contexts/AuthContext'
import { Shield, Eye, EyeOff, Mail, Lock, User } from 'lucide-react'
import LoadingSpinner from '../components/LoadingSpinner'

const RegisterPage = () => {
  const { register: registerUser } = useAuth()
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    watch
  } = useForm()

  const password = watch('password')

  const onSubmit = async (data) => {
    setIsLoading(true)
    
    try {
      const result = await registerUser({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password
      })
      
      if (result.success) {
        navigate('/dashboard')
      } else {
        setError('root', { message: result.error })
      }
    } catch (error) {
      setError('root', { message: 'An unexpected error occurred' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-primary-600 rounded-xl flex items-center justify-center">
              <Shield className="w-8 h-8 text-white" />
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Start analyzing contracts with AI-powered insights
          </p>
        </div>

        {/* Registration Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {/* Global Error */}
          {errors.root && (
            <div className="bg-danger-50 border border-danger-200 rounded-lg p-4">
              <p className="text-sm text-danger-600">{errors.root.message}</p>
            </div>
          )}

          <div className="space-y-4">
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="form-label">
                  First name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="firstName"
                    type="text"
                    autoComplete="given-name"
                    className={`form-input pl-10 ${errors.firstName ? 'border-danger-300 focus:border-danger-500 focus:ring-danger-500' : ''}`}
                    placeholder="First name"
                    {...register('firstName', {
                      required: 'First name is required',
                      minLength: {
                        value: 2,
                        message: 'First name must be at least 2 characters'
                      },
                      maxLength: {
                        value: 50,
                        message: 'First name cannot exceed 50 characters'
                      }
                    })}
                  />
                </div>
                {errors.firstName && (
                  <p className="form-error">{errors.firstName.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="lastName" className="form-label">
                  Last name
                </label>
                <input
                  id="lastName"
                  type="text"
                  autoComplete="family-name"
                  className={`form-input ${errors.lastName ? 'border-danger-300 focus:border-danger-500 focus:ring-danger-500' : ''}`}
                  placeholder="Last name"
                  {...register('lastName', {
                    required: 'Last name is required',
                    minLength: {
                      value: 2,
                      message: 'Last name must be at least 2 characters'
                    },
                    maxLength: {
                      value: 50,
                      message: 'Last name cannot exceed 50 characters'
                    }
                  })}
                />
                {errors.lastName && (
                  <p className="form-error">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="form-label">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  className={`form-input pl-10 ${errors.email ? 'border-danger-300 focus:border-danger-500 focus:ring-danger-500' : ''}`}
                  placeholder="Enter your email"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address'
                    }
                  })}
                />
              </div>
              {errors.email && (
                <p className="form-error">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  className={`form-input pl-10 pr-10 ${errors.password ? 'border-danger-300 focus:border-danger-500 focus:ring-danger-500' : ''}`}
                  placeholder="Create a password"
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters'
                    },
                    pattern: {
                      value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                      message: 'Password must contain uppercase, lowercase, and number'
                    }
                  })}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="form-error">{errors.password.message}</p>
              )}
              
              {/* Password Strength Indicator */}
              {password && (
                <div className="mt-2">
                  <div className="text-xs text-gray-600 mb-1">Password strength:</div>
                  <div className="flex space-x-1">
                    <div className={`h-1 w-1/4 rounded ${password.length >= 6 ? 'bg-success-500' : 'bg-gray-200'}`} />
                    <div className={`h-1 w-1/4 rounded ${/[A-Z]/.test(password) ? 'bg-success-500' : 'bg-gray-200'}`} />
                    <div className={`h-1 w-1/4 rounded ${/[a-z]/.test(password) ? 'bg-success-500' : 'bg-gray-200'}`} />
                    <div className={`h-1 w-1/4 rounded ${/\d/.test(password) ? 'bg-success-500' : 'bg-gray-200'}`} />
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="form-label">
                Confirm password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  className={`form-input pl-10 ${errors.confirmPassword ? 'border-danger-300 focus:border-danger-500 focus:ring-danger-500' : ''}`}
                  placeholder="Confirm your password"
                  {...register('confirmPassword', {
                    required: 'Please confirm your password',
                    validate: value => value === password || 'Passwords do not match'
                  })}
                />
              </div>
              {errors.confirmPassword && (
                <p className="form-error">{errors.confirmPassword.message}</p>
              )}
            </div>
          </div>

          {/* Terms and Conditions */}
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="terms"
                type="checkbox"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                {...register('terms', {
                  required: 'You must agree to the terms and conditions'
                })}
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="terms" className="text-gray-600">
                I agree to the{' '}
                <a href="#" className="text-primary-600 hover:text-primary-500">
                  Terms of Service
                </a>
                {' '}and{' '}
                <a href="#" className="text-primary-600 hover:text-primary-500">
                  Privacy Policy
                </a>
              </label>
              {errors.terms && (
                <p className="form-error mt-1">{errors.terms.message}</p>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary btn-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <LoadingSpinner size="sm" color="white" className="mr-2" />
                  Creating account...
                </div>
              ) : (
                'Create account'
              )}
            </button>
          </div>

          {/* Sign In Link */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
                Sign in
              </Link>
            </p>
          </div>
        </form>

        {/* Free Plan Benefits */}
        <div className="mt-8 p-4 bg-success-50 border border-success-200 rounded-lg">
          <h3 className="text-sm font-medium text-success-800 mb-2">
            🎉 Free Plan Includes:
          </h3>
          <ul className="text-xs text-success-700 space-y-1">
            <li>• 3 contract analyses per month</li>
            <li>• AI-powered risk detection</li>
            <li>• Plain language summaries</li>
            <li>• Basic negotiation tips</li>
          </ul>
        </div>

        {/* Legal Disclaimer */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            By creating an account, you acknowledge that ContractGuard provides informational analysis only and does not constitute legal advice.
          </p>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage