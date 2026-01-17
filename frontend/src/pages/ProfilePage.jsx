/**
 * Profile Page Component
 * User profile management and settings
 */

import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useForm } from 'react-hook-form'
import { 
  User, 
  Mail, 
  Lock, 
  Shield, 
  Settings, 
  CreditCard,
  Bell,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import LoadingSpinner from '../components/LoadingSpinner'
import toast from 'react-hot-toast'

const ProfilePage = () => {
  const { user, updateProfile, changePassword } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors },
    reset: resetProfile
  } = useForm({
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      preferences: {
        emailNotifications: user?.preferences?.emailNotifications ?? true,
        riskTolerance: user?.preferences?.riskTolerance || 'moderate'
      }
    }
  })

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors },
    reset: resetPassword,
    watch
  } = useForm()

  const newPassword = watch('newPassword')

  const onSubmitProfile = async (data) => {
    setIsUpdatingProfile(true)
    try {
      const result = await updateProfile(data)
      if (result.success) {
        resetProfile(data)
      }
    } finally {
      setIsUpdatingProfile(false)
    }
  }

  const onSubmitPassword = async (data) => {
    setIsChangingPassword(true)
    try {
      const result = await changePassword(data.currentPassword, data.newPassword)
      if (result.success) {
        resetPassword()
      }
    } finally {
      setIsChangingPassword(false)
    }
  }

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'security', name: 'Security', icon: Lock },
    { id: 'subscription', name: 'Subscription', icon: CreditCard },
    { id: 'preferences', name: 'Preferences', icon: Settings }
  ]

  const getSubscriptionBadge = (plan) => {
    const badges = {
      free: 'bg-gray-100 text-gray-800',
      pro: 'bg-primary-100 text-primary-800',
      enterprise: 'bg-purple-100 text-purple-800'
    }
    return badges[plan] || badges.free
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-narrow">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
          <p className="text-gray-600 mt-2">
            Manage your account settings and preferences
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{tab.name}</span>
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="card">
                <div className="card-header">
                  <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
                  <p className="text-gray-600">Update your personal information</p>
                </div>
                <div className="card-body">
                  <form onSubmit={handleSubmitProfile(onSubmitProfile)} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="form-label">First Name</label>
                        <input
                          type="text"
                          className={`form-input ${profileErrors.firstName ? 'border-danger-300' : ''}`}
                          {...registerProfile('firstName', {
                            required: 'First name is required',
                            minLength: { value: 2, message: 'Minimum 2 characters' }
                          })}
                        />
                        {profileErrors.firstName && (
                          <p className="form-error">{profileErrors.firstName.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="form-label">Last Name</label>
                        <input
                          type="text"
                          className={`form-input ${profileErrors.lastName ? 'border-danger-300' : ''}`}
                          {...registerProfile('lastName', {
                            required: 'Last name is required',
                            minLength: { value: 2, message: 'Minimum 2 characters' }
                          })}
                        />
                        {profileErrors.lastName && (
                          <p className="form-error">{profileErrors.lastName.message}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="form-label">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="email"
                          className="form-input pl-10 bg-gray-50"
                          value={user?.email}
                          disabled
                        />
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        Email cannot be changed. Contact support if needed.
                      </p>
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={isUpdatingProfile}
                        className="btn-primary"
                      >
                        {isUpdatingProfile ? (
                          <div className="flex items-center">
                            <LoadingSpinner size="sm" color="white" className="mr-2" />
                            Updating...
                          </div>
                        ) : (
                          'Update Profile'
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="card">
                <div className="card-header">
                  <h2 className="text-xl font-semibold text-gray-900">Security Settings</h2>
                  <p className="text-gray-600">Manage your password and security preferences</p>
                </div>
                <div className="card-body">
                  <form onSubmit={handleSubmitPassword(onSubmitPassword)} className="space-y-6">
                    <div>
                      <label className="form-label">Current Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type={showCurrentPassword ? 'text' : 'password'}
                          className={`form-input pl-10 pr-10 ${passwordErrors.currentPassword ? 'border-danger-300' : ''}`}
                          {...registerPassword('currentPassword', {
                            required: 'Current password is required'
                          })}
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 transform -translate-y-1/2"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        >
                          {showCurrentPassword ? (
                            <EyeOff className="w-5 h-5 text-gray-400" />
                          ) : (
                            <Eye className="w-5 h-5 text-gray-400" />
                          )}
                        </button>
                      </div>
                      {passwordErrors.currentPassword && (
                        <p className="form-error">{passwordErrors.currentPassword.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="form-label">New Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          className={`form-input pl-10 pr-10 ${passwordErrors.newPassword ? 'border-danger-300' : ''}`}
                          {...registerPassword('newPassword', {
                            required: 'New password is required',
                            minLength: { value: 6, message: 'Minimum 6 characters' },
                            pattern: {
                              value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                              message: 'Must contain uppercase, lowercase, and number'
                            }
                          })}
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 transform -translate-y-1/2"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                        >
                          {showNewPassword ? (
                            <EyeOff className="w-5 h-5 text-gray-400" />
                          ) : (
                            <Eye className="w-5 h-5 text-gray-400" />
                          )}
                        </button>
                      </div>
                      {passwordErrors.newPassword && (
                        <p className="form-error">{passwordErrors.newPassword.message}</p>
                      )}
                      
                      {/* Password Strength */}
                      {newPassword && (
                        <div className="mt-2">
                          <div className="text-xs text-gray-600 mb-1">Password strength:</div>
                          <div className="flex space-x-1">
                            <div className={`h-1 w-1/4 rounded ${newPassword.length >= 6 ? 'bg-success-500' : 'bg-gray-200'}`} />
                            <div className={`h-1 w-1/4 rounded ${/[A-Z]/.test(newPassword) ? 'bg-success-500' : 'bg-gray-200'}`} />
                            <div className={`h-1 w-1/4 rounded ${/[a-z]/.test(newPassword) ? 'bg-success-500' : 'bg-gray-200'}`} />
                            <div className={`h-1 w-1/4 rounded ${/\d/.test(newPassword) ? 'bg-success-500' : 'bg-gray-200'}`} />
                          </div>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="form-label">Confirm New Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="password"
                          className={`form-input pl-10 ${passwordErrors.confirmPassword ? 'border-danger-300' : ''}`}
                          {...registerPassword('confirmPassword', {
                            required: 'Please confirm your password',
                            validate: value => value === newPassword || 'Passwords do not match'
                          })}
                        />
                      </div>
                      {passwordErrors.confirmPassword && (
                        <p className="form-error">{passwordErrors.confirmPassword.message}</p>
                      )}
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={isChangingPassword}
                        className="btn-primary"
                      >
                        {isChangingPassword ? (
                          <div className="flex items-center">
                            <LoadingSpinner size="sm" color="white" className="mr-2" />
                            Changing...
                          </div>
                        ) : (
                          'Change Password'
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Subscription Tab */}
            {activeTab === 'subscription' && (
              <div className="space-y-6">
                {/* Current Plan */}
                <div className="card">
                  <div className="card-header">
                    <h2 className="text-xl font-semibold text-gray-900">Current Plan</h2>
                  </div>
                  <div className="card-body">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center space-x-3 mb-2">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getSubscriptionBadge(user?.subscription?.plan)}`}>
                            {user?.subscription?.plan?.charAt(0).toUpperCase() + user?.subscription?.plan?.slice(1)} Plan
                          </span>
                          {user?.subscription?.plan === 'free' && (
                            <span className="text-sm text-gray-500">Free Forever</span>
                          )}
                        </div>
                        <p className="text-gray-600">
                          {user?.subscription?.contractsRemaining || 0} contract analyses remaining
                        </p>
                        <p className="text-sm text-gray-500">
                          {user?.subscription?.contractsUsed || 0} analyses used this period
                        </p>
                      </div>
                      
                      {user?.subscription?.plan === 'free' && (
                        <button className="btn-primary">
                          Upgrade to Pro
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Usage Statistics */}
                <div className="card">
                  <div className="card-header">
                    <h3 className="text-lg font-semibold text-gray-900">Usage This Month</h3>
                  </div>
                  <div className="card-body">
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm text-gray-600 mb-2">
                          <span>Contract Analyses</span>
                          <span>{user?.subscription?.contractsUsed || 0} / {user?.subscription?.plan === 'free' ? '3' : 'Unlimited'}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-primary-600 h-2 rounded-full" 
                            style={{ 
                              width: user?.subscription?.plan === 'free' 
                                ? `${((user?.subscription?.contractsUsed || 0) / 3) * 100}%`
                                : '0%'
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Billing History */}
                <div className="card">
                  <div className="card-header">
                    <h3 className="text-lg font-semibold text-gray-900">Billing History</h3>
                  </div>
                  <div className="card-body">
                    <div className="text-center py-8">
                      <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No billing history available</p>
                      <p className="text-sm text-gray-500">You're currently on the free plan</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Preferences Tab */}
            {activeTab === 'preferences' && (
              <div className="card">
                <div className="card-header">
                  <h2 className="text-xl font-semibold text-gray-900">Preferences</h2>
                  <p className="text-gray-600">Customize your ContractGuard experience</p>
                </div>
                <div className="card-body">
                  <div className="space-y-6">
                    {/* Email Notifications */}
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">Email Notifications</h4>
                        <p className="text-sm text-gray-600">
                          Receive updates about your contract analyses
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          defaultChecked={user?.preferences?.emailNotifications}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                      </label>
                    </div>

                    {/* Risk Tolerance */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Risk Tolerance</h4>
                      <p className="text-sm text-gray-600 mb-4">
                        Adjust how sensitive the risk detection should be
                      </p>
                      <div className="space-y-3">
                        {[
                          { value: 'conservative', label: 'Conservative', desc: 'Flag more potential risks' },
                          { value: 'moderate', label: 'Moderate', desc: 'Balanced risk assessment' },
                          { value: 'aggressive', label: 'Aggressive', desc: 'Only flag high-risk items' }
                        ].map((option) => (
                          <label key={option.value} className="flex items-center space-x-3 cursor-pointer">
                            <input
                              type="radio"
                              name="riskTolerance"
                              value={option.value}
                              defaultChecked={user?.preferences?.riskTolerance === option.value}
                              className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                            />
                            <div>
                              <p className="font-medium text-gray-900">{option.label}</p>
                              <p className="text-sm text-gray-600">{option.desc}</p>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button className="btn-primary">
                        Save Preferences
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage