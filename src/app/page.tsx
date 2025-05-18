'use client';

import { useState, useEffect } from 'react';
import Registration from './register/page';
import Login from './login/page';
import Dashboard from './dashboard/page';

export default function App() {
  const [currentPage, setCurrentPage] = useState('login');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated on component mount
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
      setCurrentPage('dashboard');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const handleRouteChange = () => {
      const path = window.location.pathname;
      if (path === '/register') {
        setCurrentPage('register');
      } else if (path === '/login') {
        setCurrentPage('login');
      } else if (path === '/dashboard') {
        if (isAuthenticated) {
          setCurrentPage('dashboard');
        } else {
          navigate('/login');
        }
      }
    };

    window.addEventListener('popstate', handleRouteChange);
    handleRouteChange();

    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, [isAuthenticated]);

  const navigate = (path: string): void => {
    window.history.pushState({}, '', path);
    if (path === '/register') {
      setCurrentPage('register');
    } else if (path === '/login') {
      setCurrentPage('login');
    } else if (path === '/dashboard') {
      setCurrentPage('dashboard');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-blue-800 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div>
      {currentPage === 'register' && <Registration navigate={navigate} />}
      {currentPage === 'login' && <Login setIsAuthenticated={setIsAuthenticated} navigate={navigate} />}
      {currentPage === 'dashboard' && isAuthenticated && <Dashboard setIsAuthenticated={setIsAuthenticated} />}
    </div>
  );
}
