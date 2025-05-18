'use client';

import Image from "next/image";
import logo from "../../../public/logo.png"
import { useState } from "react";

interface LoginProps {
  setIsAuthenticated: (isAuthenticated: boolean) => void;
  navigate: (path: string) => void;
}

export default function Login({ setIsAuthenticated, navigate }: LoginProps) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleLogin = async () => {
        setLoading(true);
        setError("");

        if(!email || !password){
            setError("Please fill in all fields");
            alert("Please fill in all fields");
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

            localStorage.setItem('token', data.token);
            // Update authentication state
            setIsAuthenticated(true);
            // Redirect to dashboard after successful login
            navigate('/dashboard');
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('An unknown error occurred');
            }
        } finally {
            setLoading(false);
        }
    }
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
                <div className="mb-4">
                    <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-600 rounded-lg focus:outline-none text-blue-900"
                    />
                </div>
                <div className="mb-4">
                    <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-600 rounded-lg focus:outline-none text-blue-900"
                    />
                </div>

                <button
                    onClick={handleLogin}
                    disabled={loading}
                    className="w-full py-3 bg-pink-300 text-blue-800 font-semibold rounded-lg hover:bg-pink-400"
                >
                    {loading ? 'Logging in...' : 'Login'}
                </button>
            </div>

            <div className="text-center mt-6">
                <a onClick={() => navigate('/register')} className="text-blue-800 hover:underline cursor-pointer">
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
    )
}