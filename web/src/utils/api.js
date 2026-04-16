// API Base URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// API request wrapper
const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem('bankCrmToken');

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
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Xatolik yuz berdi');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
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
