'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import AddGeminiApiKeyButton from '@/components/gemini/AddGeminiApiKeyButton';
import GeminiExplainButton from '@/components/gemini/GeminiExplainButton';
import GeminiAlternativeButton from '@/components/gemini/GeminiAlternativeButton';

interface CodeExplainerProps {
  code: string;
  context?: string;
}

export default function CodeExplainer({ code, context = 'data analysis' }: CodeExplainerProps) {
  const { data: session } = useSession();
  const [hasGeminiKey, setHasGeminiKey] = React.useState<boolean | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const checkGeminiKey = async () => {
      if (!session) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/user/apikey?service=gemini');
        const data = await response.json();

        if (response.ok) {
          setHasGeminiKey(data.hasKey);
        }
      } catch (error) {
        console.error('Error checking Gemini API key:', error);
      } finally {
        setLoading(false);
      }
    };

    checkGeminiKey();
  }, [session]);

  if (loading) {
    return <div className="text-sm text-gray-500 dark:text-gray-400">Loading...</div>;
  }

  if (!session) {
    return (
      <div className="text-sm text-gray-500 dark:text-gray-400">
        <Link href="/login" className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
          Sign in
        </Link>{' '}
        to use AI-powered code explanations.
      </div>
    );
  }

  if (hasGeminiKey === false) {
    return (
      <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-md">
        <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
          Add your Gemini API key to get AI-powered code explanations and suggestions.
        </p>
        <div className="flex space-x-4 items-center">
          <AddGeminiApiKeyButton
            size="sm"
            onApiKeyAdded={() => setHasGeminiKey(true)}
          />
          <Link
            href="/settings"
            className="text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
          >
            Learn more
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-4">
      <GeminiExplainButton code_snippet={code} context={context} />
      <GeminiAlternativeButton code_snippet={code} context={context} />
    </div>
  );
}
