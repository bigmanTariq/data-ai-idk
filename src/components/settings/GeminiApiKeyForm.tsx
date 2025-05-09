'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export default function GeminiApiKeyForm() {
  const { data: session } = useSession();
  const [apiKey, setApiKey] = useState('');
  const [hasKey, setHasKey] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Check if the user already has a Gemini API key
  useEffect(() => {
    const checkApiKey = async () => {
      if (!session) return;

      setLoading(true);
      try {
        const response = await fetch('/api/user/apikey?service=gemini');
        const data = await response.json();

        if (response.ok) {
          setHasKey(data.hasKey);
        }
      } catch (error) {
        console.error('Error checking API key:', error);
      } finally {
        setLoading(false);
      }
    };

    checkApiKey();
  }, [session]);

  const handleSaveApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) {
      setMessage({ text: 'Please enter an API key', type: 'error' });
      return;
    }

    setSaving(true);
    setMessage({ text: 'Validating API key...', type: 'success' });

    try {
      // First, validate the API key
      const validateResponse = await fetch('/api/user/validate-apikey', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          service: 'gemini',
          apiKey: apiKey.trim(),
        }),
      });

      const validateData = await validateResponse.json();

      if (!validateResponse.ok) {
        setMessage({ text: validateData.error || 'Failed to validate API key', type: 'error' });
        return;
      }

      if (!validateData.valid) {
        setMessage({ text: validateData.error || 'Invalid API key', type: 'error' });
        return;
      }

      // If validation passed, save the API key
      setMessage({ text: 'API key is valid. Saving...', type: 'success' });

      const saveResponse = await fetch('/api/user/apikey', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          service: 'gemini',
          apiKey: apiKey.trim(),
        }),
      });

      const saveData = await saveResponse.json();

      if (saveResponse.ok) {
        setMessage({ text: 'API key validated and saved successfully', type: 'success' });
        setHasKey(true);
        setApiKey(''); // Clear the input for security
      } else {
        setMessage({ text: saveData.error || 'Failed to save API key', type: 'error' });
      }
    } catch (error) {
      setMessage({ text: 'An error occurred while processing the API key', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteApiKey = async () => {
    if (!confirm('Are you sure you want to delete your Gemini API key?')) {
      return;
    }

    setDeleting(true);
    setMessage(null);

    try {
      const response = await fetch('/api/user/apikey?service=gemini', {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ text: 'API key deleted successfully', type: 'success' });
        setHasKey(false);
      } else {
        setMessage({ text: data.error || 'Failed to delete API key', type: 'error' });
      }
    } catch (error) {
      setMessage({ text: 'An error occurred while deleting the API key', type: 'error' });
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-6">
        <svg
          className="animate-spin h-5 w-5 text-indigo-600"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Loading...</span>
      </div>
    );
  }

  return (
    <div>
      {message && (
        <div
          className={`mb-4 p-3 rounded-md ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-300'
              : 'bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-300'
          }`}
        >
          {message.text}
        </div>
      )}

      {hasKey ? (
        <div>
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
            You have already added a Gemini API key. For security reasons, we don't display the key.
            You can delete your current key and add a new one if needed.
          </p>
          <button
            onClick={handleDeleteApiKey}
            disabled={deleting}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
          >
            {deleting ? 'Deleting...' : 'Delete API Key'}
          </button>
        </div>
      ) : (
        <form onSubmit={handleSaveApiKey}>
          <div className="mb-4">
            <label
              htmlFor="apiKey"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Gemini API Key
            </label>
            <div className="mt-1">
              <input
                type="password"
                id="apiKey"
                name="apiKey"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-md"
                placeholder="Enter your Gemini API key"
                required
              />
            </div>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Your API key is stored securely and is only used to make requests to the Gemini API.
              <br />
              <a
                href="https://ai.google.dev/tutorials/setup"
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
              >
                Learn how to get a Gemini API key
              </a>
            </p>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save API Key'}
          </button>
        </form>
      )}
    </div>
  );
}
