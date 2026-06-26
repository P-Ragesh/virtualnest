import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Lock, Mail, AlertCircle, ArrowRight } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [portalType, setPortalType] = useState('admin');
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handlePortalSelect = (type) => {
    setPortalType(type);
    setShowLoginForm(true);
    setEmail('');
    setPassword('');
  };

  const handleBack = () => {
    setShowLoginForm(false);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid credentials or connection error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-6 relative overflow-hidden">
      {/* Realistic Nature Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none bg-gradient-to-br from-[#C8D5BB] via-white to-[#C8D5BB]">
        {/* Soft Light Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-white/70 via-white/20 to-white/60"></div>
        
        {/* Top Left Realistic Leaves */}
        <div className="absolute top-0 left-0 w-96 h-96 -translate-x-24 -translate-y-16 opacity-95">
          <svg viewBox="0 0 400 400" className="w-full h-full">
            <g>
              {/* Leaf 1 */}
              <ellipse cx="100" cy="80" rx="60" ry="35" transform="rotate(-40 100 80)" fill="#94A293" opacity="0.9"/>
              <ellipse cx="90" cy="70" rx="45" ry="25" transform="rotate(-40 90 70)" fill="#C8D5BB" opacity="0.8"/>
              {/* Leaf 2 */}
              <ellipse cx="150" cy="60" rx="70" ry="40" transform="rotate(-20 150 60)" fill="#536164" opacity="0.7"/>
              <ellipse cx="140" cy="50" rx="55" ry="30" transform="rotate(-20 140 50)" fill="#94A293" opacity="0.6"/>
              {/* Leaf 3 */}
              <ellipse cx="80" cy="140" rx="65" ry="38" transform="rotate(-50 80 140)" fill="#C8D5BB" opacity="0.85"/>
              <ellipse cx="70" cy="130" rx="50" ry="28" transform="rotate(-50 70 130)" fill="#C8D5BB" opacity="0.75"/>
              {/* Leaf 4 */}
              <ellipse cx="140" cy="130" rx="75" ry="42" transform="rotate(-10 140 130)" fill="#94A293" opacity="0.8"/>
              <ellipse cx="130" cy="120" rx="60" ry="32" transform="rotate(-10 130 120)" fill="#C8D5BB" opacity="0.7"/>
            </g>
          </svg>
        </div>
        
        {/* Bottom Right Realistic Leaves */}
        <div className="absolute bottom-0 right-0 w-[420px] h-[420px] translate-x-28 translate-y-24 opacity-95">
          <svg viewBox="0 0 400 400" className="w-full h-full">
            <g>
              {/* Leaf 1 */}
              <ellipse cx="300" cy="320" rx="60" ry="35" transform="rotate(40 300 320)" fill="#65a30d" opacity="0.9"/>
              <ellipse cx="310" cy="310" rx="45" ry="25" transform="rotate(40 310 310)" fill="#84cc16" opacity="0.8"/>
              {/* Leaf 2 */}
              <ellipse cx="250" cy="340" rx="70" ry="40" transform="rotate(20 250 340)" fill="#52525b" opacity="0.7"/>
              <ellipse cx="260" cy="330" rx="55" ry="30" transform="rotate(20 260 330)" fill="#71717a" opacity="0.6"/>
              {/* Leaf 3 */}
              <ellipse cx="320" cy="260" rx="65" ry="38" transform="rotate(50 320 260)" fill="#84cc16" opacity="0.85"/>
              <ellipse cx="330" cy="250" rx="50" ry="28" transform="rotate(50 330 250)" fill="#a3e635" opacity="0.75"/>
              {/* Leaf 4 */}
              <ellipse cx="260" cy="270" rx="75" ry="42" transform="rotate(10 260 270)" fill="#65a30d" opacity="0.8"/>
              <ellipse cx="270" cy="260" rx="60" ry="32" transform="rotate(10 270 260)" fill="#84cc16" opacity="0.7"/>
              {/* Extra Leaf */}
              <ellipse cx="340" cy="300" rx="65" ry="38" transform="rotate(60 340 300)" fill="#84cc16" opacity="0.85"/>
              <ellipse cx="350" cy="290" rx="50" ry="28" transform="rotate(60 350 290)" fill="#a3e635" opacity="0.75"/>
            </g>
          </svg>
        </div>
      </div>

      <div className="w-full max-w-4xl z-10">
        {!showLoginForm ? (
          /* Portal Selection View */
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl border border-white/70 shadow-2xl p-10">
            {/* Logo */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center mb-4">
                <div style={{ 
                  background: 'linear-gradient(to top, #536164, #94A293, #C8D5BB)', 
                  boxShadow: '0 10px 25px -5px rgba(83, 97, 100, 0.3)' 
                }} className="w-20 h-20 rounded-2xl flex items-center justify-center">
                  <svg className="w-12 h-12 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2L2 7l10 5 10-5-10-5zm0 18l-10-5 10-5 10 5-10 5z"/>
                  </svg>
                </div>
              </div>
              <h1 className="text-2xl font-bold text-gray-800">VirtualNest</h1>
              <p className="text-sm text-gray-500 mt-1">HR Management Suite</p>
            </div>

            {/* Welcome Message */}
            <div className="text-center mb-10">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome to VirtualNest</h2>
              <p className="text-gray-500 text-sm">Choose your portal to continue</p>
            </div>

            {/* Portal Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Admin Portal */}
              <button 
                onClick={() => handlePortalSelect('admin')}
                className="group bg-gradient-to-br from-white to-gray-50 border-2 border-gray-100 rounded-2xl p-8 hover:shadow-xl hover:border-green-200 hover:from-green-50 transition-all cursor-pointer"
              >
                <div style={{ backgroundColor: '#C8D5BB' }} className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <span style={{ color: '#536164' }} className="material-symbols-outlined text-3xl">admin_panel_settings</span>
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">Admin Portal</h3>
                <p className="text-xs text-gray-500 mb-6">Access full system controls, manage users, settings, and organization data.</p>
                <div style={{ 
                  background: 'linear-gradient(to top, #536164, #94A293, #C8D5BB)', 
                  boxShadow: '0 4px 6px -1px rgba(83, 97, 100, 0.3)' 
                }} className="inline-flex items-center gap-2 px-8 py-3 text-white font-semibold rounded-xl group-hover:shadow-lg group-hover:scale-105 transition-all">
                  <span>Login as Admin</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </button>

              {/* Employee Portal */}
              <button 
                onClick={() => handlePortalSelect('employee')}
                className="group bg-gradient-to-br from-white to-gray-50 border-2 border-gray-100 rounded-2xl p-8 hover:shadow-xl hover:border-green-200 hover:from-green-50 transition-all cursor-pointer"
              >
                <div style={{ backgroundColor: '#C8D5BB' }} className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <span style={{ color: '#536164' }} className="material-symbols-outlined text-3xl">person</span>
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">Employee Portal</h3>
                <p className="text-xs text-gray-500 mb-6">Access your dashboard, tasks, attendance, and personal information.</p>
                <div style={{ 
                  background: 'linear-gradient(to top, #536164, #94A293, #C8D5BB)', 
                  boxShadow: '0 4px 6px -1px rgba(83, 97, 100, 0.3)' 
                }} className="inline-flex items-center gap-2 px-6 py-3 text-white font-semibold rounded-xl group-hover:shadow-lg group-hover:scale-105 transition-all">
                  <span>Login as Employee</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </button>
            </div>

            {/* Learn More */}
            <div className="mt-10 pt-6 border-t border-gray-200">
              <button className="flex items-center gap-2 mx-auto px-4 py-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors text-xs font-semibold">
                <span className="material-symbols-outlined">info</span>
                Learn More
              </button>
            </div>
          </div>
        ) : (
          /* Login Form View - Split Design */
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl border border-white/70 shadow-2xl overflow-hidden flex flex-col md:flex-row">
            {/* Left Side - Illustration */}
            <div className="w-full md:w-1/2 bg-gradient-to-br from-green-50 to-white p-8 md:p-10 flex flex-col justify-center">
              <button 
                onClick={handleBack}
                className="flex items-center gap-2 mb-8 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <span className="material-symbols-outlined">arrow_back</span>
                <span className="text-sm font-semibold">Back to Home</span>
              </button>
              
              {/* Illustration */}
              <div className="relative mb-8">
                <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-100 p-6 shadow-sm">
                  {/* Browser Window */}
                  <div className="flex items-center gap-1.5 mb-4">
                    <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                    <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                    <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                  </div>
                  
                  {portalType === 'admin' ? (
                    /* Admin Dashboard Mockup */
                    <div className="flex gap-4">
                      {/* Sidebar Icons */}
                      <div className="flex flex-col gap-2">
                        <div style={{ 
                          background: 'linear-gradient(to top, #536164, #94A293, #C8D5BB)' 
                        }} className="w-8 h-8 rounded flex items-center justify-center">
                          <span className="material-symbols-outlined text-white text-sm">dashboard</span>
                        </div>
                        <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center">
                          <span className="material-symbols-outlined text-gray-500 text-sm">group</span>
                        </div>
                        <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center">
                          <span className="material-symbols-outlined text-gray-500 text-sm">event_busy</span>
                        </div>
                        <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center">
                          <span className="material-symbols-outlined text-gray-500 text-sm">payments</span>
                        </div>
                      </div>
                      
                      {/* Dashboard Content */}
                      <div className="flex-1">
                        <div className="flex gap-3 mb-4">
                          {/* Chart 1 */}
                          <div className="flex-1 bg-gray-50 rounded-lg p-2">
                            <svg viewBox="0 0 80 50" className="w-full h-full">
                              <rect x="10" y="30" width="10" height="15" rx="2" fill="#65a30d" opacity="0.7"/>
                              <rect x="25" y="20" width="10" height="25" rx="2" fill="#84cc16" opacity="0.7"/>
                              <rect x="40" y="15" width="10" height="30" rx="2" fill="#a3e635" opacity="0.7"/>
                              <rect x="55" y="25" width="10" height="20" rx="2" fill="#65a30d" opacity="0.7"/>
                            </svg>
                          </div>
                          {/* Chart 2 */}
                          <div className="w-1/2 bg-gray-50 rounded-lg p-2 flex items-center justify-center">
                            <svg viewBox="0 0 40 40" className="w-full h-full">
                              <circle cx="20" cy="20" r="15" fill="none" stroke="#d1d5db" strokeWidth="4"/>
                              <circle cx="20" cy="20" r="15" fill="none" stroke="#65a30d" strokeWidth="4" strokeDasharray="50 44" transform="rotate(-90 20 20)"/>
                            </svg>
                          </div>
                        </div>
                        
                        {/* List Items */}
                        <div className="space-y-2">
                          <div className="h-2 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                          <div className="h-2 bg-gray-200 rounded w-2/3"></div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Employee Profile Mockup */
                    <div className="flex flex-col">
                      {/* User Profile */}
                      <div className="flex items-center gap-4 mb-4">
                        <div style={{ backgroundColor: '#C8D5BB' }} className="w-16 h-16 rounded-full flex items-center justify-center">
                          <svg viewBox="0 0 24 24" className="w-10 h-10" style={{ fill: '#536164' }}>
                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                          </svg>
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </div>
                      
                      {/* List Items */}
                      <div className="space-y-3">
                        <div className="h-3 bg-gray-200 rounded w-full"></div>
                        <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                        <div className="h-3 bg-gray-200 rounded w-4/6"></div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Badge */}
                {portalType === 'admin' ? (
                  <div style={{ 
                    background: 'linear-gradient(to top, #536164, #94A293, #C8D5BB)' 
                  }} className="absolute -bottom-4 -right-2 w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg">
                    <span className="material-symbols-outlined text-white text-3xl">shield_person</span>
                  </div>
                ) : (
                  /* Calendar Badge for Employee */
                  <div className="absolute -bottom-6 -right-6 w-16 h-16 bg-white rounded-xl flex items-center justify-center shadow-lg border border-gray-100">
                    <svg viewBox="0 0 48 48" className="w-full h-full p-2">
                      {/* Calendar Header */}
                      <rect x="8" y="6" width="32" height="36" rx="3" fill="white" stroke="#e5e7eb" strokeWidth="1"/>
                      {/* Calendar Top Bar */}
                      <rect x="8" y="6" width="32" height="8" rx="3" fill="#94A293"/>
                      {/* Calendar Tabs */}
                      <rect x="14" y="4" width="4" height="4" rx="1" fill="#C8D5BB"/>
                      <rect x="22" y="4" width="4" height="4" rx="1" fill="#C8D5BB"/>
                      <rect x="30" y="4" width="4" height="4" rx="1" fill="#C8D5BB"/>
                      {/* Checkmark */}
                      <path d="M16 24 L24 32 L34 22" stroke="#536164" strokeWidth="3.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                )}
              </div>
              
              {/* Text */}
              <div className="text-center md:text-left">
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  {portalType === 'admin' ? 'Secure admin access' : 'Your workspace'}
                </h3>
                <p className="text-sm text-gray-500">
                  {portalType === 'admin' 
                    ? 'Manage your organization, users, and system settings.'
                    : 'Access your tasks, attendance, payroll, and personal information.'
                  }
                </p>
              </div>
            </div>
            
            {/* Right Side - Login Form */}
            <div className="w-full md:w-1/2 bg-white p-8 md:p-10 flex flex-col justify-center">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  {portalType === 'admin' ? 'Admin Login' : 'Employee Login'}
                </h2>
                <p className="text-sm text-gray-500">
                  {portalType === 'admin' ? 'Sign in to access the admin dashboard' : 'Sign in to access your account'}
                </p>
              </div>
              
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex items-center space-x-3">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            style={{ 
                              '--focus-border': '#94A293',
                              '--focus-ring': 'rgba(148, 162, 147, 0.5)'
                            }}
                            className="w-full pl-4 pr-10 py-3 bg-gray-50 border border-gray-200 focus:outline-none text-gray-800 placeholder-gray-400 rounded-xl transition-all duration-200 text-sm"
                            onFocus={(e) => {
                    e.target.style.borderColor = '#94A293';
                    e.target.style.boxShadow = '0 0 0 1px rgba(148, 162, 147, 0.5)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '';
                    e.target.style.boxShadow = '';
                  }}
                          />
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">mail</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full pl-4 pr-20 py-3 bg-gray-50 border border-gray-200 text-gray-800 placeholder-gray-400 rounded-xl outline-none transition-all duration-200 text-sm"
                      onFocus={(e) => {
                    e.target.style.borderColor = '#94A293';
                    e.target.style.boxShadow = '0 0 0 1px rgba(148, 162, 147, 0.5)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '';
                    e.target.style.boxShadow = '';
                  }}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                      <span className="material-symbols-outlined text-gray-400 text-sm">lock</span>
                      <button 
                        type="button" 
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <span className="material-symbols-outlined text-sm">
                          {showPassword ? 'visibility_off' : 'visibility'}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 rounded border-gray-300 focus:outline-none"
                      style={{ accentColor: '#94A293' }} 
                    />
                    <span className="text-xs text-gray-500">Remember me</span>
                  </label>
                  <a href="#" style={{ color: '#536164' }} className="text-xs font-semibold hover:opacity-80">Forgot Password?</a>
                </div>
                
                <button
                  type="submit"
                  disabled={loading}
                  style={{ 
                    background: 'linear-gradient(to top, #536164, #94A293, #C8D5BB)', 
                    boxShadow: '0 4px 6px -1px rgba(83, 97, 100, 0.3)' 
                  }}
                  className="w-full py-3 text-white font-semibold rounded-xl transition-all duration-200 hover:opacity-90 disabled:opacity-50 text-sm mt-2"
                >
                  {loading ? 'Authenticating...' : (portalType === 'admin' ? 'Login as Admin' : 'Login as Employee')}
                </button>
              </form>
              
              <div className="mt-8 pt-6 border-t border-gray-200 text-center">
                <p className="text-xs text-gray-400">Need help? <a href="#" style={{ color: '#536164' }} className="font-semibold hover:opacity-80">Contact Support</a></p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}