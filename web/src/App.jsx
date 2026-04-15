import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AllClients from './pages/admin/AllClients';
import OperatorDetail from './pages/admin/OperatorDetail';
import AdminClientDetail from './pages/admin/ClientDetail';
import ClientDetail from './pages/ClientDetail';

// Protected Route komponentlari
const ProtectedRoute = ({ children }) => {
  const isLoggedIn = localStorage.getItem('bankCrmIsLoggedIn') === 'true';
  return isLoggedIn ? children : <Navigate to="/" />;
};

const AdminProtectedRoute = ({ children }) => {
  const isAdminLoggedIn = localStorage.getItem('bankCrmAdminLoggedIn') === 'true';
  return isAdminLoggedIn ? children : <Navigate to="/admin/login" />;
};

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    const savedLoginState = localStorage.getItem('bankCrmIsLoggedIn');
    return savedLoginState === 'true';
  });

  useEffect(() => {
    localStorage.setItem('bankCrmIsLoggedIn', isLoggedIn);
  }, [isLoggedIn]);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('bankCrmIsLoggedIn');
    localStorage.removeItem('bankCrmOperatorId'); // Operator ID ni ham o'chirish
  };

  return (
    <Router>
      <Routes>
        {/* CRM Routes */}
        <Route
          path="/"
          element={isLoggedIn ? <Navigate to="/dashboard" /> : <LoginPage onLogin={handleLogin} />}
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin"
          element={
            <AdminProtectedRoute>
              <AdminDashboard />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/operator/:id"
          element={
            <AdminProtectedRoute>
              <OperatorDetail />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/clients"
          element={
            <AdminProtectedRoute>
              <AllClients />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/client/:id"
          element={
            <AdminProtectedRoute>
              <AdminClientDetail />
            </AdminProtectedRoute>
          }
        />

        {/* Operator Client Detail Route */}
        <Route
          path="/client/:id"
          element={
            <ProtectedRoute>
              <ClientDetail />
            </ProtectedRoute>
          }
        />

        {/* Redirect noma'lum yo'llar uchun */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
