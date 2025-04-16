'use client';

import React from 'react';
import AddGeminiApiKeyButton from '@/components/gemini/AddGeminiApiKeyButton';

export default function GeminiApiButtonWrapper() {
  return (
    <AddGeminiApiKeyButton 
      variant="secondary" 
      size="sm" 
      className="flex items-center gap-1.5"
    />
  );
}
