/**
 * Landing Page Component
 * Main marketing page for ContractGuard
 */

import React from 'react'
import { Link } from 'react-router-dom'
import { 
  Shield, 
  FileText, 
  AlertTriangle, 
  CheckCircle, 
  Users, 
  Clock,
  Star,
  ArrowRight,
  Zap,
  Eye,
  Download
} from 'lucide-react'

const LandingPage = () => {
  const features = [
    {
      icon: FileText,
      title: 'Smart PDF Analysis',
      description: 'Upload any PDF contract and get instant text extraction with AI-powered analysis.'
    },
    {
      icon: AlertTriangle,
      title: 'Risk Detection',
      description: 'Automatically identify dangerous clauses like auto-renewal, penalties, and non-compete terms.'
    },
    {
      icon: Eye,
      title: 'Plain Language Summary',
      description: 'Convert complex legal jargon into easy-to-understand explanations anyone can follow.'
    },
    {
      icon: CheckCircle,
      title: 'Smart Recommendations',
      description: 'Get clear advice: "Safe to sign", "Review carefully", or "Avoid signing" with reasoning.'
    },
    {
      icon: Zap,
      title: 'Negotiation Tips',
      description: 'Receive specific suggestions on how to negotiate better terms for risky clauses.'
    },
    {
      icon: Download,
      title: 'PDF Reports',
      description: 'Download comprehensive analysis reports to share with lawyers or keep for records.'
    }
  ]

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Small Business Owner',
      content: 'ContractGuard saved me from signing a terrible lease agreement. The hidden auto-renewal clause would have cost me thousands!',
      rating: 5
    },
    {
      name: 'Mike Chen',
      role: 'Freelance Developer',
      content: 'As a freelancer, I review contracts weekly. This tool helps me spot red flags instantly and negotiate better terms.',
      rating: 5
    },
    {
      name: 'Lisa Rodriguez',
      role: 'Marketing Manager',
      content: 'Finally, a tool that explains contracts in plain English. No more expensive lawyer consultations for simple agreements.',
      rating: 5
    }
  ]

  const pricingPlans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      features: [
        '3 contract analyses',
        'Basic risk detection',
        'Plain language summaries',
        'Email support'
      ],
      cta: 'Get Started Free',
      popular: false
    },
    {
      name: 'Pro',
      price: '$19',
      period: 'per month',
      features: [
        '50 contract analyses',
        'Advanced AI analysis',
        'PDF report downloads',
        'Negotiation recommendations',
        'Priority support',
        'Contract history dashboard'
      ],
      cta: 'Start Pro Trial',
      popular: true
    },
    {
      name: 'Enterprise',
      price: '$99',
      period: 'per month',
      features: [
        'Unlimited analyses',
        'Team collaboration',
        'Custom risk profiles',
        'API access',
        'Dedicated support',
        'Advanced analytics'
      ],
      cta: 'Contact Sales',
      popular: false
    }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="gradient-primary text-white py-20">
        <div className="container-narrow text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-balance">
            Read Between the Lines
            <span className="block text-blue-200">Before You Sign</span>
          </h1>
          
          <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto text-balance">
            AI-powered contract analysis that identifies risky clauses and explains them in plain English. 
            Protect yourself from hidden penalties, auto-renewals, and unfair terms.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/register" className="btn-lg bg-white text-primary-600 hover:bg-gray-100 font-semibold">
              Analyze Your First Contract Free
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
            <Link to="#demo" className="btn-lg border-2 border-white text-white hover:bg-white hover:text-primary-600 font-semibold">
              See How It Works
            </Link>
          </div>
          
          <div className="mt-12 flex items-center justify-center space-x-8 text-blue-200">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>10,000+ contracts analyzed</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5" />
              <span>30-second analysis</span>
            </div>
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5" />
              <span>Bank-level security</span>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 bg-gray-50">
        <div className="container-narrow">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              The Hidden Cost of Not Reading Contracts
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              89% of people sign contracts without reading them. Here's what they're missing:
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-danger-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-danger-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Hidden Penalties</h3>
              <p className="text-gray-600">
                Early termination fees, cancellation charges, and penalty clauses that can cost thousands.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-warning-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-warning-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Auto-Renewals</h3>
              <p className="text-gray-600">
                Contracts that automatically extend without notice, trapping you in unwanted agreements.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Legal Restrictions</h3>
              <p className="text-gray-600">
                Non-compete clauses, arbitration requirements, and liability limitations that limit your rights.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="container-narrow">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              How ContractGuard Protects You
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our AI analyzes every clause and explains the risks in simple terms you can understand.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div key={index} className="card card-body text-center hover:shadow-lg transition-shadow">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-6 h-6 text-primary-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section id="demo" className="py-20 bg-gray-50">
        <div className="container-narrow">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              See ContractGuard in Action
            </h2>
            <p className="text-xl text-gray-600">
              Watch how we transform complex legal language into clear, actionable insights.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Sample Analysis Result
                </h3>
                
                <div className="space-y-4">
                  <div className="p-4 bg-danger-50 border border-danger-200 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className="w-5 h-5 text-danger-600 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-danger-800">High Risk: Auto-Renewal Clause</h4>
                        <p className="text-sm text-danger-700 mt-1">
                          "This agreement automatically renews for additional 12-month terms unless terminated with 90 days written notice."
                        </p>
                        <p className="text-sm text-danger-600 mt-2">
                          <strong>Risk:</strong> You could be locked into unwanted contract extensions if you forget to cancel 3 months early.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-warning-50 border border-warning-200 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className="w-5 h-5 text-warning-600 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-warning-800">Medium Risk: Early Termination Fee</h4>
                        <p className="text-sm text-warning-700 mt-1">
                          "Early termination will result in a penalty equal to 50% of remaining contract value."
                        </p>
                        <p className="text-sm text-warning-600 mt-2">
                          <strong>Negotiation Tip:</strong> Ask to reduce penalty to 25% or cap it at a fixed amount.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-primary-50 border border-primary-200 rounded-lg">
                  <h4 className="font-semibold text-primary-800 mb-2">Final Recommendation</h4>
                  <p className="text-primary-700">
                    <strong>Review Carefully</strong> - This contract contains risky clauses that require negotiation before signing.
                  </p>
                </div>
              </div>

              <div className="lg:pl-8">
                <div className="bg-gray-100 rounded-lg p-6 text-center">
                  <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">Upload your contract PDF here</p>
                  <Link to="/register" className="btn-primary">
                    Try It Free Now
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20">
        <div className="container-narrow">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Trusted by Thousands
            </h2>
            <p className="text-xl text-gray-600">
              See what our users say about ContractGuard
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="card card-body text-center">
                <div className="flex justify-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4 italic">
                  "{testimonial.content}"
                </p>
                <div>
                  <p className="font-semibold text-gray-900">{testimonial.name}</p>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gray-50">
        <div className="container-narrow">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600">
              Choose the plan that fits your contract analysis needs
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <div key={index} className={`card relative ${plan.popular ? 'ring-2 ring-primary-500' : ''}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-primary-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="card-body text-center">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-gray-600">/{plan.period}</span>
                  </div>
                  
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-success-600" />
                        <span className="text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Link
                    to="/register"
                    className={`w-full ${plan.popular ? 'btn-primary' : 'btn-outline'}`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 gradient-primary text-white">
        <div className="container-narrow text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Don't Sign Another Contract Blind
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of smart professionals who use ContractGuard to protect themselves from risky agreements.
          </p>
          <Link to="/register" className="btn-lg bg-white text-primary-600 hover:bg-gray-100 font-semibold">
            Start Your Free Analysis
            <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </div>
      </section>
    </div>
  )
}

export default LandingPage