import { useState, useEffect } from 'react';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    // LocalStorage dan login holatini yuklash
    const savedLoginState = localStorage.getItem('bankCrmIsLoggedIn');
    return savedLoginState === 'true';
  });

  // Login holati o'zgarganda LocalStorage ga saqlash
  useEffect(() => {
    localStorage.setItem('bankCrmIsLoggedIn', isLoggedIn);
  }, [isLoggedIn]);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  return (
    <>
      {isLoggedIn ? (
        <Dashboard onLogout={handleLogout} />
      ) : (
        <LoginPage onLogin={handleLogin} />
      )}
    </>
  );
}

export default App;
