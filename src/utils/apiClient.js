const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * API Client with automatic token refresh
 * All requests include credentials (cookies) automatically
 */
async function apiClient(url, options = {}) {
  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    credentials: 'include', // Always include credentials for cookies
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  // Handle 401 - Token might be expired, try to refresh
  if (response.status === 401 && !url.includes('/auth/')) {
    console.log('[API] 401 detected, attempting token refresh...');

    // Try to refresh token
    const refreshResponse = await fetch(`${API_BASE_URL}/api/v1/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    });

    if (refreshResponse.ok) {
      console.log('[API] Token refreshed successfully, retrying request...');

      // Retry original request with new token
      return fetch(`${API_BASE_URL}${url}`, {
        ...options,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });
    } else {
      console.log('[API] Token refresh failed, redirecting to login...');

      // Refresh failed, redirect to login
      window.location.href = '/login';
      throw new Error('Session expired');
    }
  }

  return response;
}


/**
 * API Helper Function
 * Uses apiClient with automatic token refresh
 */
export const fetchAPI = async (endpoint, options = {}) => {
  const response = await apiClient(endpoint, options);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
};

export default apiClient;
