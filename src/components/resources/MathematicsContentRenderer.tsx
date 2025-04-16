'use client';

import React, { useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';

interface MathematicsContentRendererProps {
  content: string;
  title: string;
}

export default function MathematicsContentRenderer({
  content,
  title,
}: MathematicsContentRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';

  useEffect(() => {
    // Load MathJax dynamically if it's not already loaded
    if (typeof window !== 'undefined' && !window.MathJax) {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js';
      script.async = true;
      script.onload = () => {
        if (window.MathJax) {
          window.MathJax.typeset();
        }
      };
      document.head.appendChild(script);
    } else if (window.MathJax) {
      // If MathJax is already loaded, typeset the content
      window.MathJax.typeset();
    }
  }, [content]);

  // Function to detect if content is likely mathematical
  const isMathematicalContent = (text: string): boolean => {
    const mathPatterns = [
      /\\\(.*?\\\)/g,  // Inline math delimiters \( ... \)
      /\\\[.*?\\\]/g,  // Display math delimiters \[ ... \]
      /\$\$.*?\$\$/g,  // Display math delimiters $$ ... $$
      /\$.*?\$/g,      // Inline math delimiters $ ... $
      /\\begin\{equation\}.*?\\end\{equation\}/gs,  // LaTeX equation environment
      /\\begin\{align\}.*?\\end\{align\}/gs,        // LaTeX align environment
      /\\frac\{.*?\}\{.*?\}/g,  // Fractions
      /\\sum_/g,       // Summation
      /\\int_/g,       // Integral
      /\\lim_/g,       // Limit
      /\\mathbb\{/g,   // Math blackboard bold
      /\\mathcal\{/g,  // Math calligraphic
      /\\sqrt\{/g,     // Square root
    ];

    // Check if the title contains mathematical terms
    const mathTerms = ['mathematics', 'algebra', 'calculus', 'geometry', 'trigonometry', 
                      'theorem', 'equation', 'formula', 'proof', 'lemma'];
    
    const titleContainsMathTerms = mathTerms.some(term => 
      title.toLowerCase().includes(term)
    );

    // Check if the content contains mathematical patterns
    const contentContainsMathPatterns = mathPatterns.some(pattern => 
      pattern.test(content)
    );

    return titleContainsMathTerms || contentContainsMathPatterns;
  };

  // Process content to enhance mathematical notation
  const processContent = (text: string): string => {
    if (!isMathematicalContent(text)) {
      return text;
    }

    // Replace common mathematical notation with LaTeX
    let processed = text;
    
    // Replace plain text fractions with LaTeX fractions
    processed = processed.replace(/(\d+)\/(\d+)/g, '\\(\\frac{$1}{$2}\\)');
    
    // Replace x^2, x^n with LaTeX superscripts
    processed = processed.replace(/(\w)\^(\d+|[a-zA-Z])/g, '\\($1^{$2}\\)');
    
    // Replace sqrt(x) with LaTeX square root
    processed = processed.replace(/sqrt\(([^)]+)\)/g, '\\(\\sqrt{$1}\\)');
    
    // Replace plain text integrals with LaTeX
    processed = processed.replace(/integral of/gi, '\\(\\int\\)');
    
    // Replace plain text summations with LaTeX
    processed = processed.replace(/sum of/gi, '\\(\\sum\\)');
    
    return processed;
  };

  return (
    <div 
      ref={containerRef}
      className={`math-content ${isDarkMode ? 'dark-math' : ''}`}
    >
      <div 
        className="prose max-w-none dark:prose-invert"
        dangerouslySetInnerHTML={{ __html: processContent(content) }} 
      />
      
      {/* Add custom styles for math rendering */}
      <style jsx global>{`
        .math-content .MathJax {
          font-size: 1.1em !important;
        }
        .dark-math .MathJax {
          color: #e2e8f0 !important;
        }
      `}</style>
    </div>
  );
}

// Add TypeScript interface for MathJax
declare global {
  interface Window {
    MathJax?: any;
  }
}
