'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { bookStructure, Concept } from '@/lib/bookStructure';

interface RelatedConceptsProps {
  resourceTitle: string;
  resourceDescription: string;
  resourceCategory: string;
  aiExplanation?: string | null;
}

export default function RelatedConcepts({
  resourceTitle,
  resourceDescription,
  resourceCategory,
  aiExplanation,
}: RelatedConceptsProps) {
  const [relatedConcepts, setRelatedConcepts] = useState<Concept[]>([]);

  useEffect(() => {
    // Find related concepts based on resource metadata
    const findRelatedConcepts = () => {
      try {
        const allConcepts: Concept[] = [];

        // Extract more meaningful search terms
        // Remove common words and focus on domain-specific terms
        const stopWords = ['the', 'and', 'for', 'with', 'this', 'that', 'from', 'to', 'in', 'on', 'by', 'is', 'are', 'was', 'were'];

        // Extract noun phrases and important terms
        const titleTerms = resourceTitle.toLowerCase()
          .split(/\s+|[,.;:!?()\[\]{}'"-]/) // Split by spaces and punctuation
          .filter(term => term.length > 2 && !stopWords.includes(term));

        const descriptionTerms = resourceDescription.toLowerCase()
          .split(/\s+|[,.;:!?()\[\]{}'"-]/)
          .filter(term => term.length > 2 && !stopWords.includes(term));

        const categoryTerms = resourceCategory.toLowerCase()
          .replace('_', ' ')
          .split(/\s+/)
          .filter(term => term.length > 2 && !stopWords.includes(term));

        // Combine all terms and remove duplicates
        const searchTerms = [...new Set([...titleTerms, ...descriptionTerms, ...categoryTerms])];

        // Extract additional terms from the title that might be multi-word concepts
        // For example, "Basic Mathematics" should match "Mathematics" concepts
        const titlePhrases = [];
        const titleWords = resourceTitle.toLowerCase().split(/\s+/);
        for (let i = 0; i < titleWords.length; i++) {
          for (let j = i + 1; j <= titleWords.length; j++) {
            const phrase = titleWords.slice(i, j).join(' ');
            if (phrase.length > 3 && !stopWords.includes(phrase)) {
              titlePhrases.push(phrase);
            }
          }
        }

        // Add the title phrases to the search terms
        searchTerms.push(...titlePhrases);

        // Extract all concepts from the book structure
        bookStructure.forEach(chapter => {
          chapter.sections.forEach(section => {
            section.concepts.forEach(concept => {
              allConcepts.push(concept);
            });
          });
        });

        // Score each concept based on relevance with improved algorithm for mathematical content
        const scoredConcepts = allConcepts.map(concept => {
          let score = 0;
          const conceptNameLower = concept.name.toLowerCase();
          const conceptDescLower = concept.description.toLowerCase();

          // Domain-specific terms for mathematics and data analysis
          const mathTerms = ['mathematics', 'algebra', 'calculus', 'geometry', 'trigonometry', 'statistics',
                           'probability', 'theorem', 'equation', 'function', 'variable', 'matrix', 'vector'];
          const dataTerms = ['data', 'analysis', 'science', 'machine', 'learning', 'algorithm', 'model',
                           'regression', 'classification', 'clustering', 'visualization'];

          // Check for matches in concept name and description with improved scoring
          searchTerms.forEach(term => {
            // Exact match in concept name
            if (conceptNameLower === term) {
              score += 10;
            }
            // Concept name contains term as whole word
            else if (new RegExp(`\\b${term}\\b`).test(conceptNameLower)) {
              score += 5;
            }
            // Concept name contains term
            else if (conceptNameLower.includes(term)) {
              score += 3;
            }
            // Concept description contains term as whole word
            else if (new RegExp(`\\b${term}\\b`).test(conceptDescLower)) {
              score += 3;
            }
            // Concept description contains term
            else if (conceptDescLower.includes(term)) {
              score += 2;
            }

            // Boost score for mathematical terms in mathematics books
            if (resourceTitle.toLowerCase().includes('mathematics') ||
                resourceCategory.toLowerCase().includes('mathematics')) {
              if (mathTerms.some(mathTerm => term.includes(mathTerm))) {
                score *= 1.5;
              }
            }

            // Boost score for data analysis terms in data analysis resources
            if (resourceTitle.toLowerCase().includes('data') ||
                resourceCategory.toLowerCase().includes('data')) {
              if (dataTerms.some(dataTerm => term.includes(dataTerm))) {
                score *= 1.3;
              }
            }
          });

          // Check for matches in concept tags with improved scoring
          concept.tags.forEach(tag => {
            const tagLower = tag.toLowerCase();
            // Category contains tag
            if (resourceCategory.toLowerCase().includes(tagLower)) score += 5;
            // Title contains tag
            if (resourceTitle.toLowerCase().includes(tagLower)) score += 4;
            // Tag is a mathematical term and resource is about mathematics
            if (mathTerms.includes(tagLower) && resourceTitle.toLowerCase().includes('mathematics')) {
              score += 6;
            }
          });

          // Check for matches in AI explanation if available
          if (aiExplanation) {
            const aiExplanationLower = aiExplanation.toLowerCase();
            concept.tags.forEach(tag => {
              if (aiExplanationLower.includes(tag.toLowerCase())) score += 2;
            });

            if (aiExplanationLower.includes(conceptNameLower)) score += 4;
          }

          return { concept, score };
        });

        // Filter concepts with a score > 0 and sort by score
        const filteredConcepts = scoredConcepts
          .filter(item => item.score > 0)
          .sort((a, b) => b.score - a.score)
          .map(item => item.concept)
          .slice(0, 5);

        setRelatedConcepts(filteredConcepts);
      } catch (error) {
        console.error('Error finding related concepts:', error);
        setRelatedConcepts([]);
      }
    };

    findRelatedConcepts();
  }, [resourceTitle, resourceDescription, resourceCategory, aiExplanation]);

  if (relatedConcepts.length === 0) {
    return null;
  }

  return (
    <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-6">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
        Related Concepts in the Book
      </h3>
      <ul className="space-y-3">
        {relatedConcepts.map((concept) => (
          <li key={concept.id} className="border-l-2 border-indigo-500 pl-3 py-1">
            <Link
              href={`/book/concept/${concept.id}`}
              className="block"
            >
              <h4 className="text-sm font-medium text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400">
                {concept.name}
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                {concept.description}
              </p>
              <div className="flex flex-wrap gap-1 mt-1">
                {concept.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </Link>
          </li>
        ))}
      </ul>
      <div className="mt-4 text-right">
        <Link
          href="/book"
          className="text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 flex items-center justify-end"
        >
          <span>Go to Interactive Book</span>
          <svg className="ml-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
