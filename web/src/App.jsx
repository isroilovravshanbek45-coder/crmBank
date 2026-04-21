import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
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
  const userRole = localStorage.getItem('bankCrmUserRole');

  // Agar operator role bo'lmasa, login'ga yo'naltirish
  if (!isLoggedIn || userRole !== 'operator') {
    return <Navigate to="/" replace />;
  }

  return children;
};

const AdminProtectedRoute = ({ children }) => {
  const isAdminLoggedIn = localStorage.getItem('bankCrmAdminLoggedIn') === 'true';
  const userRole = localStorage.getItem('bankCrmUserRole');

  // Agar admin role bo'lmasa, admin login'ga yo'naltirish
  if (!isAdminLoggedIn || userRole !== 'admin') {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('bankCrmIsLoggedIn') === 'true';
  });

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.clear();
  };

  return (
    <Router>
      <Routes>
        {/* CRM Routes */}
        <Route
          path="/"
          element={
            isLoggedIn && localStorage.getItem('bankCrmUserRole') === 'operator'
              ? <Navigate to="/dashboard" replace />
              : <LoginPage onLogin={handleLogin} />
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/client/:id"
          element={
            <ProtectedRoute>
              <ClientDetail />
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

        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
