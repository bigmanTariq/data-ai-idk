'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface AdminUser {
  id: string;
  email: string;
  name: string;
  isAdmin: boolean;
}

interface AdminCredentials {
  email: string;
  password: string;
}

export default function CreateAdminPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [credentials, setCredentials] = useState<AdminCredentials | null>(null);

  useEffect(() => {
    const createAdmin = async () => {
      try {
        const response = await fetch('/api/auth/create-admin');
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to create admin user');
        }

        setAdminUser(data.user);
        setCredentials(data.loginCredentials);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unexpected error occurred');
        }
      } finally {
        setLoading(false);
      }
    };

    createAdmin();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Creating Admin User...
          </h2>
          <div className="mt-8 flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Error
          </h2>
          <div className="mt-8 bg-red-100 border border-red-400 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-600"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Admin User Created
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Use these credentials to log in as an admin
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Admin User</h3>
              <div className="mt-2 bg-gray-50 p-4 rounded-md">
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Name:</span> {adminUser?.name}
                </p>
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Email:</span> {credentials?.email}
                </p>
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Password:</span>{' '}
                  {credentials?.password}
                </p>
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Admin:</span>{' '}
                  {adminUser?.isAdmin ? 'Yes' : 'No'}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Link
                href="/login?from=help"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Go to Login
              </Link>
              <Link
                href="/"
                className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
