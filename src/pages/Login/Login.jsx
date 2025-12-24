import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import logo from '../../assets/crystal_exchange_logo.png';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

function Login() {
  const navigate = useNavigate();
  const { checkAuth } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
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

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // IMPORTANT: Send/receive cookies
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Update auth context with user data
      await checkAuth();

      // Navigate to trading dashboard (ProtectedRoute will handle redirect)
      navigate('/trading');
    } catch (err) {
      setError(err.message || 'An error occurred during login');
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
              Welcome Back
            </h1>
            <p className="text-gray-400 text-sm">Sign in to access your trading dashboard</p>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Login form */}
          <form onSubmit={handleSubmit} className="space-y-6">
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
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center text-gray-400 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-[var(--border-medium)] bg-[var(--glass-light)] text-[var(--accent-electric-blue)] focus:ring-[var(--accent-electric-blue)] focus:ring-offset-0"
                />
                <span className="ml-2">Remember me</span>
              </label>
              <Link
                to="/forgot-password"
                className="text-[var(--accent-electric-blue)] hover:text-[var(--accent-aurora-purple)] transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-[var(--accent-electric-blue)] to-[var(--accent-aurora-purple)] text-white font-semibold hover:shadow-lg hover:shadow-[var(--accent-electric-blue)]/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Sign up link */}
          <div className="mt-6 text-center text-sm text-gray-400">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="text-[var(--accent-electric-blue)] hover:text-[var(--accent-aurora-purple)] transition-colors font-medium"
            >
              Sign up
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

export default Login;
