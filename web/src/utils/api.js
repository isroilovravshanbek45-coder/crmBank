// API Base URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Check if token is expired
 */
const isTokenExpired = () => {
  const token = localStorage.getItem('bankCrmToken');
  if (!token) return true;

  try {
    // JWT token'ni decode qilish (simple base64 decode)
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expirationTime = payload.exp * 1000; // Convert to milliseconds
    return Date.now() >= expirationTime;
  } catch (error) {
    console.error('Token decode error:', error);
    return true;
  }
};

/**
 * Logout function
 */
const performLogout = () => {
  localStorage.removeItem('bankCrmToken');
  localStorage.removeItem('bankCrmOperatorId');
  localStorage.removeItem('bankCrmUserRole');
  localStorage.removeItem('bankCrmIsLoggedIn');
  localStorage.removeItem('bankCrmAdminLoggedIn');
  window.location.href = '/';
};

/**
 * Handle API errors
 */
const handleAPIError = (error, response, data) => {
  // Network errors
  if (error instanceof TypeError && error.message.includes('fetch')) {
    throw new Error('Internet aloqasi yo\'q. Iltimos, internetni tekshiring.');
  }

  // Response errors
  if (response && !response.ok) {
    // 401 Unauthorized - Token muammosi
    if (response.status === 401) {
      performLogout();
      throw new Error('Sessiya tugadi. Iltimos, qayta kiring.');
    }

    // 403 Forbidden
    if (response.status === 403) {
      throw new Error(data?.message || 'Ruxsat yo\'q');
    }

    // 404 Not Found
    if (response.status === 404) {
      throw new Error(data?.message || 'Ma\'lumot topilmadi');
    }

    // 429 Too Many Requests
    if (response.status === 429) {
      throw new Error('Juda ko\'p so\'rov yuborildi. Iltimos, biroz kuting.');
    }

    // 500 Server Error
    if (response.status >= 500) {
      throw new Error('Server xatosi. Iltimos, keyinroq urinib ko\'ring.');
    }

    // Validation errors
    if (data?.errors && Array.isArray(data.errors)) {
      const errorMessages = data.errors.map(err => `${err.field}: ${err.message}`).join('\n');
      throw new Error(errorMessages || data.message || 'Validatsiya xatosi');
    }

    throw new Error(data?.message || 'Xatolik yuz berdi');
  }

  // Default error
  throw error;
};

// API request wrapper
const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem('bankCrmToken');

  // Debug logging (only in development)
  if (window.location.hostname === 'localhost') {
    console.log('📤 API Request:', {
      endpoint,
      method: options.method || 'GET',
      hasToken: !!token,
      tokenPreview: token ? token.substring(0, 20) + '...' : 'none'
    });
  }

  // Token expired check (faqat login endpoint'dan tashqari)
  if (!endpoint.includes('/login') && isTokenExpired()) {
    console.warn('⚠️ Token expired, logging out...');
    performLogout();
    throw new Error('Sessiya tugadi. Iltimos, qayta kiring.');
  }

  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  try {
    const response = await fetch(`${API_URL}${endpoint}`, config);

    // Try to parse JSON response
    let data;
    try {
      data = await response.json();
    } catch (parseError) {
      if (!response.ok) {
        throw new Error(`Server xatosi: ${response.status} ${response.statusText}`);
      }
      return {}; // Empty response is OK for some endpoints
    }

    // Debug logging
    if (window.location.hostname === 'localhost') {
      console.log('📥 API Response:', {
        endpoint,
        status: response.status,
        ok: response.ok,
        success: data?.success
      });
    }

    if (!response.ok) {
      handleAPIError(null, response, data);
    }

    return data;
  } catch (error) {
    console.error('❌ API Error:', error);
    handleAPIError(error, null, null);
  }
};

// GET request
export const get = (endpoint) => {
  return apiRequest(endpoint, {
    method: 'GET',
  });
};

// POST request
export const post = (endpoint, data) => {
  return apiRequest(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

// PUT request
export const put = (endpoint, data) => {
  return apiRequest(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

// DELETE request
export const del = (endpoint) => {
  return apiRequest(endpoint, {
    method: 'DELETE',
  });
};

export default {
  get,
  post,
  put,
  del,
};
