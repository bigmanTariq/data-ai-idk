'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import GeminiApiKeyModal from './GeminiApiKeyModal';

export default function GeminiFloatingButton() {
  const { data: session } = useSession();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasKey, setHasKey] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);

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
          setIsVisible(!data.hasKey); // Only show if user doesn't have a key
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
    setIsVisible(false);
  };

  if (loading || !session || !isVisible) {
    return null;
  }

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center justify-center p-3 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
        title="Add Gemini API Key"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
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
        <span className="ml-2 font-medium">Add Gemini API</span>
      </button>

      <GeminiApiKeyModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleSuccess}
      />
    </>
  );
}
