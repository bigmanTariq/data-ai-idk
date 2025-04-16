'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import GeminiApiKeyModal from './GeminiApiKeyModal';

interface AddGeminiApiKeyButtonProps {
  variant?: 'primary' | 'secondary' | 'text';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onApiKeyAdded?: () => void;
}

export default function AddGeminiApiKeyButton({
  variant = 'primary',
  size = 'md',
  className = '',
  onApiKeyAdded,
}: AddGeminiApiKeyButtonProps) {
  const { data: session } = useSession();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasKey, setHasKey] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkApiKey = async () => {
      if (!session) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/user/apikey?service=gemini');
        const data = await response.json();

        if (response.ok) {
          setHasKey(data.hasKey);
        }
      } catch (error) {
        console.error('Error checking Gemini API key:', error);
      } finally {
        setLoading(false);
      }
    };

    checkApiKey();
  }, [session]);

  const handleSuccess = () => {
    setHasKey(true);
    if (onApiKeyAdded) {
      onApiKeyAdded();
    }
  };

  // Button styles based on variant and size
  const getButtonStyles = () => {
    let baseStyles = 'inline-flex items-center justify-center font-medium focus:outline-none transition-all duration-200';

    // Size styles
    const sizeStyles = {
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base',
    };

    // Variant styles
    const variantStyles = {
      primary: 'rounded-md border border-transparent text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800',
      secondary: 'text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white',
      text: 'text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300',
    };

    return `${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`;
  };

  if (loading) {
    return (
      <button disabled className={`${getButtonStyles()} opacity-50`}>
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
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
        Loading...
      </button>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className={getButtonStyles()}
      >
        {hasKey ? (
          <>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-1.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
              />
            </svg>
            Manage Gemini API Key
          </>
        ) : (
          <>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-1.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            Add Gemini API Key
          </>
        )}
      </button>

      <GeminiApiKeyModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleSuccess}
      />
    </>
  );
}
