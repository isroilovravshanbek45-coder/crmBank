import { post, get } from '../utils/api';

// Operator login
export const operatorLogin = async (login, password) => {
  const response = await post('/auth/operator/login', { login, password });

  if (response.success) {
    localStorage.setItem('bankCrmToken', response.token);
    localStorage.setItem('bankCrmOperatorId', response.user.operatorId);
    localStorage.setItem('bankCrmUserRole', response.user.role);
    localStorage.setItem('bankCrmIsLoggedIn', 'true');
  }

  return response;
};

// Admin login
export const adminLogin = async (login, password) => {
  const response = await post('/auth/admin/login', { login, password });

  if (response.success) {
    localStorage.setItem('bankCrmToken', response.token);
    localStorage.setItem('bankCrmUserRole', response.user.role);
    localStorage.setItem('bankCrmAdminLoggedIn', 'true');
  }

  return response;
};

// Token verify
export const verifyToken = async () => {
  try {
    const response = await get('/auth/verify');
    return response.success;
  } catch (error) {
    return false;
  }
};

// Logout
export const logout = () => {
  localStorage.removeItem('bankCrmToken');
  localStorage.removeItem('bankCrmOperatorId');
  localStorage.removeItem('bankCrmUserRole');
  localStorage.removeItem('bankCrmIsLoggedIn');
  localStorage.removeItem('bankCrmAdminLoggedIn');
};

export default {
  operatorLogin,
  adminLogin,
  verifyToken,
  logout,
};
