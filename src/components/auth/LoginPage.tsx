import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { LogIn, Users, Shield, UserCheck, Eye, EyeOff, Building2, Sparkles } from 'lucide-react';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const success = await login(email, password);
      if (!success) {
        setError('Invalid credentials. Please try again.');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const demoUsers = [
    { 
      email: 'reception@company.com', 
      role: 'Reception', 
      icon: Users, 
      color: 'bg-blue-500',
      description: 'Manage visitor check-ins and check-outs'
    },
    { 
      email: 'admin@company.com', 
      role: 'Admin', 
      icon: Shield, 
      color: 'bg-purple-500',
      description: 'Full system administration and analytics'
    },
    { 
      email: 'emily.watson@company.com', 
      role: 'Staff', 
      icon: UserCheck, 
      color: 'bg-green-500',
      description: 'Approve and manage visitor requests'
    },
  ];

  const quickLogin = (userEmail: string) => {
    setEmail(userEmail);
    setPassword('demo');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-40 left-40 w-60 h-60 bg-indigo-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-500"></div>
      </div>

      <div className="max-w-md w-full relative z-10">
        {/* Main Login Card */}
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#2d4170] via-[#3a4f7a] to-[#475d84] px-8 py-8 text-center relative">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl mb-4 border border-white/30">
                <Building2 className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">Babaji Shivram</h1>
              <p className="text-blue-100 text-lg">Visitor Management System</p>
              <div className="flex items-center justify-center mt-3 text-blue-100">
                <Sparkles className="w-4 h-4 mr-2" />
                <span className="text-sm">Secure • Professional • Efficient</span>
              </div>
            </div>
          </div>

          {/* Login Form */}
          <div className="p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h2>
              <p className="text-gray-600">Sign in to access your dashboard</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 text-gray-900 placeholder-gray-500"
                  placeholder="Enter your email address"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 text-gray-900 placeholder-gray-500 pr-12"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition duration-200"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-red-400 rounded-full mr-3"></div>
                    <p className="text-red-700 text-sm font-medium">{error}</p>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-[#EB6E38] to-[#d85a2a] hover:from-[#d85a2a] hover:to-[#c54f24] text-white font-semibold py-4 px-6 rounded-xl transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <LogIn className="w-5 h-5 mr-2" />
                    Sign In
                  </div>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Demo Accounts Section */}
        <div className="mt-8 bg-white/60 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6">
          <div className="text-center mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Demo Accounts</h3>
            <p className="text-gray-600 text-sm">Click any account below to quick login</p>
          </div>
          
          <div className="space-y-3">
            {demoUsers.map((user) => {
              const IconComponent = user.icon;
              return (
                <button
                  key={user.email}
                  onClick={() => quickLogin(user.email)}
                  className="w-full flex items-center p-4 bg-white/70 hover:bg-white/90 rounded-xl transition duration-200 text-left border border-white/30 hover:border-white/50 shadow-sm hover:shadow-md group"
                >
                  <div className={`w-12 h-12 ${user.color} rounded-xl flex items-center justify-center mr-4 shadow-lg group-hover:scale-105 transition duration-200`}>
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 text-lg">{user.role}</div>
                    <div className="text-sm text-gray-600 mb-1">{user.email}</div>
                    <div className="text-xs text-gray-500">{user.description}</div>
                  </div>
                  <div className="text-gray-400 group-hover:text-gray-600 transition duration-200">
                    <LogIn className="w-5 h-5" />
                  </div>
                </button>
              );
            })}
          </div>
          
          <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
            <div className="flex items-center text-blue-800 text-sm">
              <div className="w-2 h-2 bg-[#EB6E38] rounded-full mr-2 animate-pulse"></div>
              <span className="font-medium">Demo Mode:</span>
              <span className="ml-1">Password is "demo" for all accounts</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500 text-sm">
          <p>© 2024 Babaji Shivram. Professional Visitor Management Solution.</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;