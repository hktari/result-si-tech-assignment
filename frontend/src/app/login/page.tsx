"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch } from '../../lib/hooks';
import { useLoginMutation } from '../../lib/features/auth/authApi';
import { setCredentials } from '../../lib/features/auth/authSlice';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { SerializedError } from '@reduxjs/toolkit';

// Helper function to extract error message
function getErrorMessage(error: FetchBaseQueryError | SerializedError | undefined): string {
  if (!error) return '';
  
  if ('status' in error) {
    // FetchBaseQueryError
    if (error.data && typeof error.data === 'object' && 'message' in error.data) {
      return error.data.message as string;
    }
    return `Error: ${error.status}`;
  }
  
  if ('message' in error) {
    // SerializedError
    return error.message || 'An error occurred';
  }
  
  return 'An unknown error occurred';
}

export default function LoginPage() {
  const [email, setEmail] = useState(process.env.NEXT_PUBLIC_DEMO_USER_EMAIL || '');
  const [password, setPassword] = useState(process.env.NEXT_PUBLIC_DEMO_USER_PASSWORD || '');
  const [login, { isLoading, error }] = useLoginMutation();
  const dispatch = useAppDispatch();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const result = await login({ email, password }).unwrap();
      // Store credentials in Redux state
      dispatch(setCredentials({
        token: result.access_token,
        user: result.user
      }));
      // Redirect to dashboard or home page
      router.push('/');
    } catch (error) {
      // Error is already handled by RTK Query and available in the error state
      console.error('Login failed:', error);
    }
  };

  const errorMessage = getErrorMessage(error);

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input 
            type="email" 
            value={email} 
            onChange={e => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input 
            type="password" 
            value={password} 
            onChange={e => setPassword(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button 
          type="submit" 
          disabled={isLoading}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
        {errorMessage && (
          <div className="text-red-600 text-sm mt-2 p-2 bg-red-50 border border-red-200 rounded">
            {errorMessage}
          </div>
        )}
      </form>
    </div>
  );
}
