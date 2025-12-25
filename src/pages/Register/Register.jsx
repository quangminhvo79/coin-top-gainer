import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import logo from '../../assets/crystal_exchange_logo.png';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

function Register() {
  const navigate = useNavigate();
  const { checkAuth } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Validate password match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    // Validate password length
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // IMPORTANT: Send/receive cookies
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName || undefined,
          lastName: formData.lastName || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      // Update auth context with user data
      await checkAuth();

      // Navigate to trading dashboard
      navigate('/trading');
    } catch (err) {
      setError(err.message || 'An error occurred during registration');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-96 h-96 -top-48 -left-48 bg-gradient-to-br from-[var(--accent-electric-blue)]/20 to-transparent rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute w-96 h-96 -bottom-48 -right-48 bg-gradient-to-br from-[var(--accent-aurora-purple)]/20 to-transparent rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Glass card */}
        <div className="backdrop-blur-xl bg-[var(--glass-medium)] rounded-2xl border border-[var(--border-medium)] shadow-[var(--shadow-glass)] p-8">
          {/* Logo/Title */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <img
                src={logo}
                alt="Crystal Exchange Logo"
                className="w-16 h-16 object-contain rounded-md"
              />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[var(--accent-electric-blue)] to-[var(--accent-aurora-purple)] bg-clip-text text-transparent mb-2">
              Create Account
            </h1>
            <p className="text-gray-400 text-sm">Sign up to start trading</p>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Register form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-300 mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg bg-[var(--glass-light)] border border-[var(--border-subtle)] text-white placeholder-gray-500 focus:outline-none focus:border-[var(--accent-electric-blue)] focus:ring-1 focus:ring-[var(--accent-electric-blue)] transition-all"
                  placeholder="John"
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-300 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg bg-[var(--glass-light)] border border-[var(--border-subtle)] text-white placeholder-gray-500 focus:outline-none focus:border-[var(--accent-electric-blue)] focus:ring-1 focus:ring-[var(--accent-electric-blue)] transition-all"
                  placeholder="Doe"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-lg bg-[var(--glass-light)] border border-[var(--border-subtle)] text-white placeholder-gray-500 focus:outline-none focus:border-[var(--accent-electric-blue)] focus:ring-1 focus:ring-[var(--accent-electric-blue)] transition-all"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-lg bg-[var(--glass-light)] border border-[var(--border-subtle)] text-white placeholder-gray-500 focus:outline-none focus:border-[var(--accent-electric-blue)] focus:ring-1 focus:ring-[var(--accent-electric-blue)] transition-all"
                placeholder="••••••••"
              />
              <p className="mt-1 text-xs text-gray-500">At least 6 characters</p>
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
                className="w-full px-4 py-3 rounded-lg bg-[var(--glass-light)] border border-[var(--border-subtle)] text-white placeholder-gray-500 focus:outline-none focus:border-[var(--accent-electric-blue)] focus:ring-1 focus:ring-[var(--accent-electric-blue)] transition-all"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-[var(--accent-electric-blue)] to-[var(--accent-aurora-purple)] text-white font-semibold hover:shadow-lg hover:shadow-[var(--accent-electric-blue)]/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating account...' : 'Sign Up'}
            </button>
          </form>

          {/* Sign in link */}
          <div className="mt-6 text-center text-sm text-gray-400">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-[var(--accent-electric-blue)] hover:text-[var(--accent-aurora-purple)] transition-colors font-medium"
            >
              Sign in
            </Link>
          </div>
        </div>

        {/* Home link */}
        <div className="mt-6 text-center">
          <Link
            to="/"
            className="text-sm text-gray-400 hover:text-[var(--accent-electric-blue)] transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Register;
