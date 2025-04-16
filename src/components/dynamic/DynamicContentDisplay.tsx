'use client';

import React from 'react';
import { ContentType } from '@/lib/dynamicContent';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface DynamicContentDisplayProps {
  content: string;
  contentType: ContentType;
}

export default function DynamicContentDisplay({
  content,
  contentType,
}: DynamicContentDisplayProps) {
  return (
    <div className="prose prose-indigo max-w-none dark:prose-invert">
      <div className="text-gray-800 dark:text-gray-200">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
          // Handle code blocks separately to avoid nesting <pre> inside <p>
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            const language = match ? match[1] : 'python';

            // Only apply inline styling for inline code
            if (inline) {
              return (
                <code className="px-1 py-0.5 bg-gray-100 dark:bg-gray-800 rounded" {...props}>
                  {children}
                </code>
              );
            }

            // For code blocks, return null to prevent rendering inside <p>
            // The actual code block will be handled by the pre component
            return null;
          },
          // Handle pre blocks directly to avoid nesting issues
          pre({ children, ...props }) {
            // Extract the code content and language from children
            const childArray = React.Children.toArray(children);
            let language = 'python';
            let codeContent = '';

            // Find the code element and extract its content
            React.Children.forEach(childArray, (child) => {
              if (React.isValidElement(child) && child.type === 'code') {
                const className = child.props.className || '';
                const match = /language-(\w+)/.exec(className);
                if (match) language = match[1];
                codeContent = child.props.children;
              }
            });

            return (
              <div className="my-4 rounded-md overflow-hidden">
                <SyntaxHighlighter
                  language={language}
                  style={tomorrow}
                  customStyle={{
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem',
                  }}
                >
                  {String(codeContent).replace(/\n$/, '')}
                </SyntaxHighlighter>
              </div>
            );
          },
          p({ children }) {
            return <p className="my-2">{children}</p>;
          },
          h1({ children }) {
            return <h1 className="text-2xl font-bold mt-6 mb-4">{children}</h1>;
          },
          h2({ children }) {
            return <h2 className="text-xl font-bold mt-5 mb-3">{children}</h2>;
          },
          h3({ children }) {
            return <h3 className="text-lg font-bold mt-4 mb-2">{children}</h3>;
          },
          ul({ children }) {
            return <ul className="list-disc pl-6 my-3">{children}</ul>;
          },
          ol({ children }) {
            return <ol className="list-decimal pl-6 my-3">{children}</ol>;
          },
          li({ children }) {
            return <li className="my-1">{children}</li>;
          },
          blockquote({ children }) {
            return <blockquote className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 italic my-4">{children}</blockquote>;
          },
          strong({ children }) {
            return <strong className="font-bold">{children}</strong>;
          },
          em({ children }) {
            return <em className="italic">{children}</em>;
          }
        }}
      >
        {content}
      </ReactMarkdown>
      </div>
    </div>
  );
}
