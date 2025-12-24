import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import logo from '../../assets/crystal_exchange_logo.png';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({
    token: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      setFormData((prev) => ({ ...prev, token }));
    }
  }, [searchParams]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: formData.token,
          newPassword: formData.newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to reset password');
      }

      setSuccess(data.message);

      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);
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
        <div className="absolute w-96 h-96 -top-48 -left-48 bg-gradient-to-br from-[var(--accent-neon-green)]/20 to-transparent rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute w-96 h-96 -bottom-48 -right-48 bg-gradient-to-br from-[var(--accent-aurora-purple)]/20 to-transparent rounded-full blur-3xl animate-pulse delay-1000"></div>
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
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[var(--accent-neon-green)] to-[var(--accent-aurora-purple)] bg-clip-text text-transparent mb-2">
              Reset Password
            </h1>
            <p className="text-gray-400 text-sm">Enter your new password below</p>
          </div>

          {/* Success message */}
          {success && (
            <div className="mb-6 p-4 rounded-lg bg-green-500/10 border border-green-500/20">
              <p className="text-green-400 text-sm">{success}</p>
              <p className="text-green-400 text-xs mt-2">Redirecting to login page...</p>
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
              <label htmlFor="token" className="block text-sm font-medium text-gray-300 mb-2">
                Reset Token
              </label>
              <input
                type="text"
                id="token"
                name="token"
                value={formData.token}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-lg bg-[var(--glass-light)] border border-[var(--border-subtle)] text-white placeholder-gray-500 focus:outline-none focus:border-[var(--accent-neon-green)] focus:ring-1 focus:ring-[var(--accent-neon-green)] transition-all font-mono text-sm"
                placeholder="Enter your reset token"
              />
            </div>

            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-300 mb-2">
                New Password
              </label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                required
                minLength={6}
                className="w-full px-4 py-3 rounded-lg bg-[var(--glass-light)] border border-[var(--border-subtle)] text-white placeholder-gray-500 focus:outline-none focus:border-[var(--accent-neon-green)] focus:ring-1 focus:ring-[var(--accent-neon-green)] transition-all"
                placeholder="At least 6 characters"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                minLength={6}
                className="w-full px-4 py-3 rounded-lg bg-[var(--glass-light)] border border-[var(--border-subtle)] text-white placeholder-gray-500 focus:outline-none focus:border-[var(--accent-neon-green)] focus:ring-1 focus:ring-[var(--accent-neon-green)] transition-all"
                placeholder="Re-enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || success}
              className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-[var(--accent-neon-green)] to-[var(--accent-aurora-purple)] text-white font-semibold hover:shadow-lg hover:shadow-[var(--accent-neon-green)]/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Resetting...' : success ? 'Password Reset!' : 'Reset Password'}
            </button>
          </form>

          {/* Back to login */}
          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="text-sm text-gray-400 hover:text-[var(--accent-neon-green)] transition-colors inline-flex items-center"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
