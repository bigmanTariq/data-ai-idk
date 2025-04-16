'use client';

import React, { useState, useEffect } from 'react';
import { Concept } from '@/lib/bookStructure';
import DynamicContent from '@/components/dynamic/DynamicContent';
import RelatedResources from '@/components/book/RelatedResources';
import BookExplanation from '@/components/book/BookExplanation';

interface DynamicContentWrapperProps {
  concept: Concept;
}

export default function DynamicContentWrapper({ concept }: DynamicContentWrapperProps) {
  const [explanation, setExplanation] = useState<string | null>(null);

  // Fetch existing explanation if available
  useEffect(() => {
    const fetchExplanation = async () => {
      try {
        const response = await fetch(`/api/book/concept/${concept.id}/explanation`);

        if (response.ok) {
          // Safely parse JSON response
          try {
            const text = await response.text();
            const data = JSON.parse(text);
            if (data.explanation) {
              setExplanation(data.explanation);
            }
          } catch (parseError) {
            console.error('Error parsing JSON response:', parseError);
          }
        }
      } catch (error) {
        console.error('Error fetching explanation:', error);
      }
    };

    fetchExplanation();
  }, [concept.id]);

  return (
    <div className="space-y-6">
      <DynamicContent concept={concept} />
      <BookExplanation concept={concept} initialExplanation={explanation} />
      <RelatedResources concept={concept} />
    </div>
  );
}
