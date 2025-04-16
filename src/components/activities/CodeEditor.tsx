'use client';

import React, { useState } from 'react';
import { Editor } from '@monaco-editor/react';

interface CodeEditorProps {
  initialCode: string;
  language?: string;
  onSubmit: (code: string) => void;
  isSubmitting: boolean;
}

export default function CodeEditor({
  initialCode,
  language = 'python',
  onSubmit,
  isSubmitting,
}: CodeEditorProps) {
  const [code, setCode] = useState(initialCode);

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setCode(value);
    }
  };

  const handleSubmit = () => {
    onSubmit(code);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="border-b border-gray-200 px-4 py-3 flex justify-between items-center bg-gray-50">
        <h3 className="text-sm font-medium text-gray-700">Code Editor</h3>
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={() => setCode(initialCode)}
            className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white ${
              isSubmitting
                ? 'bg-indigo-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </div>
      <div className="h-96">
        <Editor
          height="100%"
          language={language}
          value={code}
          onChange={handleEditorChange}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            fontSize: 14,
            lineNumbers: 'on',
            automaticLayout: true,
          }}
        />
      </div>
    </div>
  );
}
