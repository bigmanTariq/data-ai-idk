import { GoogleGenerativeAI } from '@google/generative-ai';

// Function to create a Gemini client with the provided API key
export function createGeminiClient(apiKey: string) {
  if (!apiKey) {
    throw new Error('Gemini API key is required');
  }

  return new GoogleGenerativeAI(apiKey);
}

// Function to explain code using Gemini
export async function explainCode(
  apiKey: string,
  codeSnippet: string,
  context: string
): Promise<string> {
  try {
    const genAI = createGeminiClient(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `Explain the following Python code snippet for a beginner learning data analysis, focusing on ${context}:

\`\`\`python
${codeSnippet}
\`\`\`

Keep your explanation clear, concise, and focused on helping a beginner understand the code.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return text;
  } catch (error) {
    console.error('Error explaining code with Gemini:', error);
    throw error;
  }
}

// Function to elaborate on a concept using Gemini
export async function elaborateConcept(
  apiKey: string,
  conceptName: string,
  context: string
): Promise<string> {
  try {
    const genAI = createGeminiClient(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `Explain the concept of "${conceptName}" in the context of ${context} for a beginner learning data analysis.

Keep your explanation clear, concise, and focused on helping a beginner understand the concept.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return text;
  } catch (error) {
    console.error('Error elaborating concept with Gemini:', error);
    throw error;
  }
}

// Function to suggest alternative approaches using Gemini
export async function suggestAlternativeApproach(
  apiKey: string,
  codeSnippet: string,
  context: string
): Promise<string> {
  try {
    const genAI = createGeminiClient(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `Suggest an alternative approach for the following Python code snippet in the context of ${context}:

\`\`\`python
${codeSnippet}
\`\`\`

Focus on clarity, efficiency, and best practices. Explain why your alternative might be better in some situations.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return text;
  } catch (error) {
    console.error('Error suggesting alternative approach with Gemini:', error);
    throw error;
  }
}
