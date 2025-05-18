'use client';

import Image from "next/image";
import logo from "../../../public/logo.png";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// Updated interface to make both props optional
interface LoginProps {
  setIsAuthenticated?: (isAuthenticated: boolean) => void;
  navigate?: (path: string) => void;
}

export default function Login({ setIsAuthenticated, navigate }: LoginProps) {
  // Initialize router for navigation if navigate prop isn't provided
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Set up local authentication state if none is provided
  const [localAuthenticated, setLocalAuthenticated] = useState(false);
  
  // Determine which authentication state setter to use
  const updateAuthState = setIsAuthenticated || setLocalAuthenticated;
  
  // Determine which navigation function to use
  const navigateTo = (path: string) => {
    if (navigate) {
      navigate(path);
    } else {
      router.push(path);
    }
  };

  useEffect(() => {
    // Check if already authenticated on component mount
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        updateAuthState(true);
        const redirectPath = user.role === 'admin' ? '/admin-dashboard' : '/dashboard';
        navigateTo(redirectPath);
      } catch (e) {
        // Invalid user data, clear it
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }, []);

  const handleLogin = async () => {
    setLoading(true);
    setError("");

    if (!email || !password) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Store token in localStorage
      localStorage.setItem('token', data.token);
      
      // Store user information including role
      localStorage.setItem('user', JSON.stringify({
        id: data.user.id,
        email: data.user.email,
        role: data.user.role
      }));

      // Update authentication state
      updateAuthState(true);
      
      // Redirect based on user role
      if (data.user.role === "admin") {
        navigateTo('/admin-dashboard');
      } else {
        navigateTo('/dashboard');
      }
      
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <div className="items-center justify-center bg-yellow-100 w-full min-h-screen flex flex-col">
      <Image
        src={logo}
        alt="logo"
        className="w-1/6"
      />

      <h1 className="text-4xl text-blue-900 font-bold mb-8">
        Login
      </h1>
      
      <div className="w-96">
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}
        
        <div className="mb-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-full px-4 py-3 border border-gray-600 rounded-lg focus:outline-none text-blue-900"
          />
        </div>
        
        <div className="mb-4">
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-full px-4 py-3 border border-gray-600 rounded-lg focus:outline-none text-blue-900"
          />
        </div>

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full py-3 bg-pink-300 text-blue-800 font-semibold rounded-lg hover:bg-pink-400 disabled:bg-pink-200 disabled:cursor-not-allowed"
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </div>

      <div className="text-center mt-6">
        <a onClick={() => navigateTo('/register')} className="text-blue-800 hover:underline cursor-pointer">
          Don't have an account? Register
        </a>
      </div>

      <div className="flex justify-center mt-12">
        <div className="w-12 h-1 bg-yellow-300 rounded-full"></div>
      </div>
      
      <div className="mt-12 flex justify-center">
        <div className="w-16 h-1 bg-black rounded-full"></div>
      </div>
    </div>
  );
}