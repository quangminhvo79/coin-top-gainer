import { useState } from 'react';
import { Link } from 'react-router-dom';
import logo from '../../assets/crystal_exchange_logo.png';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resetToken, setResetToken] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send reset email');
      }

      setSuccess(data.message);

      // For development - show the reset token
      if (data.resetToken) {
        setResetToken(data.resetToken);
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-96 h-96 -top-48 -left-48 bg-gradient-to-br from-[var(--accent-aurora-purple)]/20 to-transparent rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute w-96 h-96 -bottom-48 -right-48 bg-gradient-to-br from-[var(--accent-electric-blue)]/20 to-transparent rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Glass card */}
        <div className="backdrop-blur-xl bg-[var(--glass-medium)] rounded-2xl border border-[var(--border-medium)] shadow-[var(--shadow-glass)] p-8">
          {/* Title */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <img
                src={logo}
                alt="Crystal Exchange Logo"
                className="w-16 h-16 object-contain rounded-md"
              />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[var(--accent-aurora-purple)] to-[var(--accent-electric-blue)] bg-clip-text text-transparent mb-2">
              Forgot Password?
            </h1>
            <p className="text-gray-400 text-sm">No worries, we'll send you reset instructions</p>
          </div>

          {/* Success message */}
          {success && (
            <div className="mb-6 p-4 rounded-lg bg-green-500/10 border border-green-500/20">
              <p className="text-green-400 text-sm">{success}</p>

              {/* Development only - show reset token */}
              {resetToken && (
                <div className="mt-4 p-3 rounded bg-yellow-500/10 border border-yellow-500/20">
                  <p className="text-yellow-400 text-xs font-semibold mb-2">Development Mode - Reset Token:</p>
                  <code className="text-yellow-300 text-xs break-all block">{resetToken}</code>
                  <p className="text-yellow-400 text-xs mt-2">Use this token on the reset password page.</p>
                </div>
              )}
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                  setSuccess('');
                }}
                required
                className="w-full px-4 py-3 rounded-lg bg-[var(--glass-light)] border border-[var(--border-subtle)] text-white placeholder-gray-500 focus:outline-none focus:border-[var(--accent-electric-blue)] focus:ring-1 focus:ring-[var(--accent-electric-blue)] transition-all"
                placeholder="you@example.com"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-[var(--accent-aurora-purple)] to-[var(--accent-electric-blue)] text-white font-semibold hover:shadow-lg hover:shadow-[var(--accent-aurora-purple)]/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>

          {/* Back to login */}
          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="text-sm text-gray-400 hover:text-[var(--accent-electric-blue)] transition-colors inline-flex items-center"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Login
            </Link>
          </div>
        </div>

        {/* Reset password link */}
        {resetToken && (
          <div className="mt-6 text-center">
            <Link
              to={`/reset-password?token=${resetToken}`}
              className="inline-flex items-center px-6 py-3 rounded-lg bg-[var(--glass-light)] border border-[var(--accent-electric-blue)]/50 text-[var(--accent-electric-blue)] hover:bg-[var(--glass-medium)] transition-all"
            >
              Go to Reset Password Page
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default ForgotPassword;
