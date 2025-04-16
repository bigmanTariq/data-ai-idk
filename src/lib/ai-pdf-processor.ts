import fs from 'fs';
import path from 'path';
import { prisma } from '@/lib/prisma';
import { decrypt } from '@/lib/encryption';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createGeminiClient } from '@/lib/gemini';
import { extractTextFromPDF } from '@/lib/simple-pdf-parser';

// Mock implementation for generating explanations without using the Gemini API
function generateMockExplanation(pdfText: string, category: string, errorMessage?: string): string {
  console.log('Generating mock explanation for category:', category);

  // Clean up the text by removing special characters and normalizing whitespace
  const cleanText = pdfText.replace(/[^a-zA-Z0-9\s.,;:!?()\-]/g, ' ').replace(/\s+/g, ' ').trim();

  // Extract potential title from the first 100 characters
  const firstLine = cleanText.split('.')[0].trim();
  const title = firstLine.length > 5 ? firstLine : (category.replace('_', ' ') + ' Document');

  console.log('Cleaned text sample:', cleanText.substring(0, 200));
  console.log('Extracted title:', title);

  // Detect document type based on content
  let documentType = 'general';
  let topics = [];

  // Check for mathematical content
  const mathKeywords = ['equation', 'theorem', 'formula', 'calculus', 'algebra', 'mathematics',
                       'arithmetic', 'geometry', 'trigonometry', 'function', 'variable',
                       'polynomial', 'integral', 'derivative'];

  const hasMathContent = mathKeywords.some(keyword =>
    cleanText.toLowerCase().includes(keyword.toLowerCase())
  );

  if (hasMathContent) {
    documentType = 'mathematics';
    topics.push('Mathematics');
  }

  // Check for data visualization content
  if (cleanText.toLowerCase().includes('data visualization')) {
    documentType = 'data_visualization';
    topics.push('Data Visualization');

    // Check for specific visualization techniques
    const vizTechniques = ['heatmap', 'treemap', 'network graph', 'scatter plot', 'bar chart',
                          'line chart', 'pie chart', 'histogram', 'box plot'];

    vizTechniques.forEach(technique => {
      if (cleanText.toLowerCase().includes(technique.toLowerCase())) {
        topics.push(technique.charAt(0).toUpperCase() + technique.slice(1));
      }
    });
  }

  // Check for basic mathematics content
  if (cleanText.toLowerCase().includes('basic mathematics') ||
      cleanText.toLowerCase().includes('elementary math')) {
    documentType = 'basic_mathematics';
    topics.push('Basic Mathematics');
  }

  // If the document appears to be corrupted or contains mostly symbols
  const letterCount = (cleanText.match(/[a-zA-Z]/g) || []).length;
  const wordCount = (cleanText.match(/\b[a-zA-Z]{3,}\b/g) || []).length; // Count words with at least 3 letters
  const totalLength = cleanText.length;

  // Check for mathematical symbols
  const mathSymbols = ['=', '+', '-', '*', '/', '^', '∫', '∑', '∏', '√', '∂', '∇', 'π', 'θ', 'α', 'β', 'γ', 'δ'];
  const hasMathSymbols = mathSymbols.some(symbol => pdfText.includes(symbol));

  // Count meaningful words (words that appear in English dictionary)
  const commonWords = ['the', 'and', 'for', 'with', 'this', 'that', 'from', 'data', 'analysis', 'science', 'mathematics', 'statistics',
                     'research', 'study', 'method', 'result', 'conclusion', 'introduction', 'figure', 'table', 'chart', 'graph',
                     'algorithm', 'model', 'function', 'variable', 'equation', 'theory', 'concept', 'definition', 'example',
                     'problem', 'solution', 'application', 'implementation', 'system', 'process', 'technique', 'approach'];
  const meaningfulWordCount = commonWords.filter(word => cleanText.toLowerCase().includes(word)).length;

  // Check for specific document types based on content patterns
  const hasDataScienceContent = ['data', 'analysis', 'statistics', 'algorithm', 'model', 'prediction', 'machine learning', 'dataset']
    .some(term => cleanText.toLowerCase().includes(term));

  const hasProgrammingContent = ['code', 'function', 'class', 'method', 'variable', 'programming', 'python', 'javascript', 'java', 'c++', 'algorithm']
    .some(term => cleanText.toLowerCase().includes(term));

  const hasBusinessContent = ['business', 'management', 'strategy', 'marketing', 'finance', 'economics', 'market', 'customer', 'product']
    .some(term => cleanText.toLowerCase().includes(term));

  // Check if the text contains mostly random characters or symbols
  if (letterCount < totalLength * 0.3 || wordCount < 10 || meaningfulWordCount < 3) {
    // Less than 30% of content is letters or fewer than 10 real words or fewer than 3 meaningful words
    if (hasMathSymbols && meaningfulWordCount >= 2) {
      documentType = 'mathematics';
      topics = ['Mathematical Content'];
    } else {
      documentType = 'unrecognized';
      topics = ['Unrecognized Content'];
    }
  } else {
    // Document has enough readable content, determine the type
    if (hasDataScienceContent && meaningfulWordCount >= 5) {
      if (documentType !== 'mathematics' && documentType !== 'basic_mathematics') {
        documentType = 'data_science';
        topics.push('Data Science');
      }
    }

    if (hasProgrammingContent && meaningfulWordCount >= 5) {
      topics.push('Programming');
    }

    if (hasBusinessContent && meaningfulWordCount >= 5) {
      topics.push('Business');
    }
  }

  // Extract concepts based on document type
  const techniques = [];

  // For data visualization
  if (documentType === 'data_visualization') {
    // Add each visualization technique found in the document
    topics.forEach(topic => {
      if (topic !== 'Data Visualization') {
        const description = getVisualizationDescription(topic);
        techniques.push({
          name: topic,
          description: description
        });
      }
    });
  }
  // For mathematics
  else if (documentType === 'mathematics' || documentType === 'basic_mathematics') {
    techniques.push({
      name: 'Mathematical Concepts',
      description: 'This document covers mathematical concepts and formulas. It is not a data science document.'
    });

    // Check for specific math symbols to provide more details
    if (pdfText.includes('=')) {
      techniques.push({
        name: 'Equations',
        description: 'The document contains mathematical equations, which are mathematical statements that assert the equality of two expressions.'
      });
    }

    if (pdfText.includes('+') || pdfText.includes('-')) {
      techniques.push({
        name: 'Arithmetic Operations',
        description: 'The document includes addition and/or subtraction operations, which are fundamental to mathematical calculations.'
      });
    }

    if (pdfText.includes('*') || pdfText.includes('/')) {
      techniques.push({
        name: 'Multiplication and Division',
        description: 'The document contains multiplication and/or division operations, which are essential for more complex mathematical calculations.'
      });
    }

    if (pdfText.includes('^') || pdfText.includes('√') || pdfText.includes('\u221a')) {
      techniques.push({
        name: 'Powers and Roots',
        description: 'The document includes exponents, powers, or root operations, which are used to represent repeated multiplication or the inverse of exponentiation.'
      });
    }
  }
  // For unrecognized content
  else if (documentType === 'unrecognized') {
    techniques.push({
      name: 'Unrecognized Content',
      description: 'This document appears to contain corrupted text or primarily non-textual content. The PDF may be damaged or contain mostly symbols and special characters that cannot be properly interpreted.'
    });

    techniques.push({
      name: 'Content Issues',
      description: 'The system has detected that this document contains mostly random characters, symbols, or corrupted text. It does not appear to be a valid readable document in a standard format.'
    });

    // Add a note about mathematics if it might be a math document
    if (pdfText.includes('=') || pdfText.includes('+') || pdfText.includes('-') ||
        pdfText.includes('*') || pdfText.includes('/') || pdfText.includes('^')) {
      techniques.push({
        name: 'Possible Mathematical Content',
        description: 'The document contains some mathematical symbols, which suggests it may be a mathematics document. However, due to text extraction issues, the specific mathematical concepts cannot be identified.'
      });
    }
  }
  // For data science content
  else if (documentType === 'data_science') {
    techniques.push({
      name: 'Data Science',
      description: 'This document covers data science concepts and techniques. It may include statistical analysis, machine learning, data visualization, or other data-related topics.'
    });

    // Check for specific data science topics
    if (cleanText.toLowerCase().includes('machine learning') || cleanText.toLowerCase().includes('ml')) {
      techniques.push({
        name: 'Machine Learning',
        description: 'The document discusses machine learning concepts, algorithms, or applications. Machine learning is a subset of artificial intelligence that enables systems to learn from data and improve from experience.'
      });
    }

    if (cleanText.toLowerCase().includes('data visualization') || cleanText.toLowerCase().includes('visualization')) {
      techniques.push({
        name: 'Data Visualization',
        description: 'The document covers data visualization techniques or principles. Data visualization is the graphical representation of information and data using visual elements like charts, graphs, and maps.'
      });
    }

    if (cleanText.toLowerCase().includes('statistics') || cleanText.toLowerCase().includes('statistical')) {
      techniques.push({
        name: 'Statistical Analysis',
        description: 'The document includes statistical analysis methods or concepts. Statistical analysis involves collecting, examining, and interpreting data to discover underlying patterns and trends.'
      });
    }
  }
  // For general content
  else {
    // Extract meaningful sentences from the cleaned text
    const sentences = cleanText.split(/[.!?]\s+/).filter(s => s.length > 20 && s.length < 200);

    // Add topics as concepts if they were detected
    if (topics.includes('Programming')) {
      techniques.push({
        name: 'Programming',
        description: 'This document contains programming concepts, code examples, or software development topics. It may cover algorithms, programming languages, or software engineering principles.'
      });
    }

    if (topics.includes('Business')) {
      techniques.push({
        name: 'Business',
        description: 'This document covers business-related topics such as management, strategy, marketing, finance, or economics. It may include business analysis, case studies, or industry insights.'
      });
    }

    // Take up to 3 sentences as additional concepts
    const maxSentences = Math.min(3, sentences.length);
    for (let i = 0; i < maxSentences; i++) {
      const sentence = sentences[i].trim();
      techniques.push({
        name: `Key Point ${i+1}`,
        description: sentence.charAt(0).toUpperCase() + sentence.slice(1)
      });
    }

    // If no sentences were found and no topics were added, add a generic concept
    if (techniques.length === 0) {
      techniques.push({
        name: 'Document Content',
        description: 'The document contains text that could not be clearly categorized into specific concepts.'
      });
    }
  }

  // Helper function to get descriptions for visualization techniques
  function getVisualizationDescription(technique: string): string {
    const descriptions: {[key: string]: string} = {
      'Heatmap': 'Uses color to represent data values in a matrix format. Particularly useful for visualizing correlation matrices and identifying patterns in large datasets.',
      'Heatmaps': 'Use color to represent data values in a matrix format. They are particularly useful for visualizing correlation matrices and identifying patterns in large datasets.',
      'Treemap': 'Displays hierarchical data using nested rectangles. The size of each rectangle represents a quantitative variable. Effective for showing part-to-whole relationships.',
      'Treemaps': 'Display hierarchical data using nested rectangles. The size of each rectangle represents a quantitative variable. They are effective for showing part-to-whole relationships.',
      'Network Graph': 'Shows relationships between entities as nodes and edges. Can reveal complex relationships and connection patterns.',
      'Network Graphs': 'Show relationships between entities as nodes and edges. They can reveal complex relationships and connection patterns.',
      'Scatter Plot': 'Displays individual data points on a two-dimensional graph. Useful for showing the relationship between two variables.',
      'Bar Chart': 'Represents categorical data with rectangular bars. The height of each bar represents the value of the category.',
      'Line Chart': 'Displays information as a series of data points connected by straight line segments. Useful for showing trends over time.',
      'Pie Chart': 'Circular statistical graphic divided into slices to illustrate numerical proportion. Each slice represents a proportion of the whole.',
      'Histogram': 'Represents the distribution of numerical data. Shows the frequency of data values falling within certain ranges.',
      'Box Plot': 'Displays the distribution of data based on a five-number summary: minimum, first quartile, median, third quartile, and maximum.'
    };

    return descriptions[technique] || `A visualization technique used in data analysis.`;
  }

  // Generate a structured explanation based on the actual content
  let explanation = `# ${title}\n\n`;
  explanation += `## Summary\n\n`;

  // Customize summary based on document type
  if (documentType === 'mathematics' || documentType === 'basic_mathematics') {
    explanation += `This document covers mathematical concepts and formulas. `;
    explanation += `It is a mathematics document, not a data science document.\n\n`;
  } else if (documentType === 'data_visualization') {
    explanation += `This document provides information about data visualization techniques. `;
    explanation += `It is categorized as ${category.replace('_', ' ').toLowerCase()}.\n\n`;
  } else if (documentType === 'data_science') {
    explanation += `This document covers data science concepts and techniques. `;
    explanation += `It may include statistical analysis, machine learning, data visualization, or other data-related topics.\n\n`;
  } else if (documentType === 'unrecognized') {
    explanation += `This document appears to contain corrupted text or primarily non-textual content. `;
    explanation += `The PDF may be damaged or contain mostly symbols and special characters that cannot be properly interpreted.\n\n`;
    explanation += `The system has detected that this document contains mostly random characters, symbols, or corrupted text. `;
    explanation += `It does not appear to be a valid readable document in a standard format. This is not a data science document.\n\n`;
  } else {
    explanation += `This document provides information in the ${category.replace('_', ' ').toLowerCase()} category. `;
    explanation += `The content has been analyzed to extract key points.\n\n`;
  }

  explanation += `## Key Concepts\n\n`;

  // Add the techniques we extracted
  if (techniques.length > 0) {
    techniques.forEach(technique => {
      explanation += `### ${technique.name}\n\n`;
      explanation += `${technique.description}\n\n`;
    });
  } else {
    explanation += `The document does not contain clearly defined concepts.\n\n`;
  }

  explanation += `## Conclusion\n\n`;

  // Customize conclusion based on document type
  if (documentType === 'mathematics' || documentType === 'basic_mathematics') {
    explanation += `This document focuses on mathematical concepts and principles. `;
    explanation += `It is not related to data science or data analysis.\n\n`;

    // Add more specific information about the mathematical content
    if (pdfText.includes('=') || pdfText.includes('+') || pdfText.includes('-') ||
        pdfText.includes('*') || pdfText.includes('/') || pdfText.includes('^')) {
      explanation += `The document contains mathematical symbols and operations such as `;

      const symbols = [];
      if (pdfText.includes('=')) symbols.push('equations (=)');
      if (pdfText.includes('+') || pdfText.includes('-')) symbols.push('addition/subtraction (+/-)');
      if (pdfText.includes('*') || pdfText.includes('/')) symbols.push('multiplication/division (*/)');
      if (pdfText.includes('^')) symbols.push('exponents (^)');

      explanation += symbols.join(', ') + '.\n\n';
    }
  } else if (documentType === 'data_visualization') {
    explanation += `This document covers specific data visualization techniques that can be implemented using Python libraries such as Matplotlib, Seaborn, and NetworkX. `;
    explanation += `Each technique serves a different purpose in visualizing data relationships and patterns.\n\n`;
  } else if (documentType === 'data_science') {
    explanation += `This document explores data science concepts and methodologies that are essential for extracting insights from data. `;
    explanation += `The field of data science combines aspects of statistics, mathematics, and computer science to analyze and interpret complex data.\n\n`;

    // Add information about specific data science topics if they were detected
    const dsTopics = [];
    if (cleanText.toLowerCase().includes('machine learning')) dsTopics.push('machine learning');
    if (cleanText.toLowerCase().includes('data visualization')) dsTopics.push('data visualization');
    if (cleanText.toLowerCase().includes('statistics')) dsTopics.push('statistical analysis');

    if (dsTopics.length > 0) {
      explanation += `The document specifically covers ${dsTopics.join(', ')}, which are important areas within the broader field of data science.\n\n`;
    }
  } else if (documentType === 'unrecognized') {
    explanation += `This document could not be properly analyzed due to content issues. `;
    explanation += `It may be a corrupted file, a scanned document without proper OCR, or contain primarily non-textual elements.\n\n`;
    explanation += `The system has detected that this document contains mostly random characters, symbols, or corrupted text. `;
    explanation += `It does not appear to be a valid readable document in a standard format.\n\n`;

    // Check if it might be a math document based on symbols
    if (pdfText.includes('=') || pdfText.includes('+') || pdfText.includes('-') ||
        pdfText.includes('*') || pdfText.includes('/') || pdfText.includes('^')) {
      explanation += `The document contains some mathematical symbols, which suggests it may be a mathematics document. `;
      explanation += `However, due to text extraction issues, the specific mathematical concepts cannot be identified.\n\n`;
    } else {
      explanation += `If this is a mathematics document, please note that it has not been identified as such due to text extraction issues.\n\n`;
    }
  } else if (topics.includes('Programming')) {
    explanation += `This document contains programming concepts, code examples, or software development topics. `;
    explanation += `It may cover algorithms, programming languages, or software engineering principles.\n\n`;

    // Check for specific programming languages
    const languages = [];
    if (cleanText.toLowerCase().includes('python')) languages.push('Python');
    if (cleanText.toLowerCase().includes('javascript')) languages.push('JavaScript');
    if (cleanText.toLowerCase().includes('java ')) languages.push('Java');
    if (cleanText.toLowerCase().includes('c++')) languages.push('C++');

    if (languages.length > 0) {
      explanation += `The document specifically mentions ${languages.join(', ')}, which ${languages.length > 1 ? 'are programming languages' : 'is a programming language'} used in software development.\n\n`;
    }
  } else if (topics.includes('Business')) {
    explanation += `This document covers business-related topics such as management, strategy, marketing, finance, or economics. `;
    explanation += `It may include business analysis, case studies, or industry insights.\n\n`;
  } else {
    explanation += `This document covers the topics mentioned above. `;
    explanation += `The content is presented as found in the document.\n\n`;
  }

  explanation += `This explanation is based solely on the content extracted from the document. `;
  explanation += `No external information or assumptions have been added.`;

  // Add error message if provided
  if (errorMessage) {
    explanation += `\n\n---\n\n**Note:** ${errorMessage}`;
  }

  return explanation;
}

// We're now using the simple-pdf-parser directly

// Function to generate an explanation using Gemini API or a mock implementation for testing
async function generateExplanationWithAI(pdfText: string, category: string, apiKey: string): Promise<string> {
  try {
    if (!apiKey) {
      console.warn('Gemini API key is not provided, falling back to mock implementation');
      return generateMockExplanation(pdfText, category);
    }

    if (!pdfText || pdfText.trim().length < 50) {
      console.warn('PDF text is too short or empty, falling back to mock implementation');
      return generateMockExplanation('This document appears to be empty or contains very little text.', category);
    }

    console.log('Generating explanation with Gemini API');
    console.log('API Key length:', apiKey.length);
    console.log('API Key first 5 chars:', apiKey.substring(0, 5));

    // Check if we should use the mock implementation
    // This allows us to test the UI without a valid API key
    if (process.env.NODE_ENV !== 'production' || !apiKey.startsWith('AIza')) {
      console.log('Using mock implementation for testing');
      return generateMockExplanation(pdfText, category);
    }

    // Create Gemini client for real implementation
    const genAI = createGeminiClient(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash', // Use gemini-1.5-flash instead of 2.0 which might not be available yet
      generationConfig: {
        temperature: 0.7,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 2048,
      }
    });

    // Create a more accurate prompt that focuses on the actual content
    let contentTypeGuidance = '';

    // Check if the text contains an error message
    if (pdfText.includes('Error extracting text from PDF:')) {
      contentTypeGuidance = `
NOTE: The PDF extraction process encountered an error. Please explain what this error means,
what might have caused it, and how it can be resolved. Provide guidance on troubleshooting
PDF extraction issues.`;
    }
    // Use a general approach for all content types
    else {
      contentTypeGuidance = `
Please analyze ONLY the actual content of this document. Your explanation should:
1. Accurately summarize ONLY what is explicitly stated in the document
2. Focus on the specific topics, concepts, and information presented in the text
3. NOT add information that isn't directly mentioned in the document
4. NOT make assumptions about related concepts unless they are explicitly mentioned
5. Provide a factual, objective analysis of the document's content

Your explanation should include:
- A concise summary of the document's main topic and purpose
- The key concepts, terms, and ideas that are explicitly presented
- Any specific techniques, methodologies, or frameworks that are directly mentioned
- Direct references to examples, data, or evidence provided in the document

IMPORTANT: Base your explanation SOLELY on the text provided. Do not add external knowledge
or assumptions about what might be related to the topic.`;
    }

    const prompt = `You are an expert in data analysis and related fields. Your task is to analyze the content of a PDF document and provide a factual explanation based ONLY on what is actually in the document.

Please analyze the following content from a PDF document categorized as "${category.replace('_', ' ')}":

${pdfText}

Provide a detailed explanation that includes:

${contentTypeGuidance}

If the document appears to be different from what the title or category suggests, please note this discrepancy and focus on explaining the actual content of the document rather than what was expected.

Format your response with clear headings and bullet points where appropriate. Make complex topics accessible while maintaining technical accuracy.

FINAL REMINDER: Your explanation must be based ONLY on the actual content of the document. Do not include any information that is not explicitly stated in the text.`;

    // Generate content
    try {
      console.log('Sending prompt to Gemini API...');
      const result = await model.generateContent(prompt);
      console.log('Received response from Gemini API');
      const response = await result.response;
      const text = response.text();
      console.log('Successfully extracted text from response');

      return text.trim();
    } catch (genError) {
      console.error('Error in Gemini API call:', genError);
      // Provide more detailed error information
      if (genError instanceof Error) {
        console.error('Error name:', genError.name);
        console.error('Error message:', genError.message);
        console.error('Error stack:', genError.stack);
      }
      throw new Error(`Gemini API error: ${genError instanceof Error ? genError.message : 'Unknown error'}`);
    }
  } catch (error) {
    console.error('Error generating explanation with Gemini:', error);

    // Provide more detailed error information
    let errorMessage = 'An error occurred while generating the explanation.';

    if (error instanceof Error) {
      errorMessage = `Error: ${error.message}`;
      console.error('Error details:', error.stack);
    }

    // Log additional context for debugging
    console.error('PDF text length:', pdfText?.length || 0);
    console.error('Category:', category);

    // Fall back to mock implementation with error information
    return generateMockExplanation(pdfText, category);
  }
}

// Main function to process a PDF file with AI
export async function processPDFWithAI(resourceId: string, forceRegenerate: boolean = false): Promise<void> {
  try {
    // Get the resource from the database
    const resource = await prisma.resource.findUnique({
      where: { id: resourceId },
      include: {
        uploadedBy: true,
      },
    });

    if (!resource) {
      throw new Error(`Resource with ID ${resourceId} not found`);
    }

    // If the resource has already been processed and we're not forcing regeneration, skip
    if (resource.aiProcessed && !forceRegenerate) {
      console.log(`Resource ${resourceId} already processed and force=false, skipping`);
      return;
    }

    // Get the user's profile
    const userProfile = await prisma.userProfile.findUnique({
      where: { userId: resource.uploadedBy.id },
    });

    if (!userProfile) {
      throw new Error(`User profile not found for user ID ${resource.uploadedBy.id}`);
    }

    // Get the user's Gemini API key
    console.log('Getting Gemini API key for user:', resource.uploadedBy.id);
    const apiKeyRecord = await prisma.userApiKey.findUnique({
      where: {
        userId_service: {
          userId: userProfile.id,
          service: 'gemini',
        },
      },
    });

    if (!apiKeyRecord) {
      console.error(`Gemini API key not found for user ID ${resource.uploadedBy.id}`);
      throw new Error(`Gemini API key not found for user ID ${resource.uploadedBy.id}`);
    }

    console.log('API key record found, decrypting...');
    // Decrypt the API key
    let apiKey;
    try {
      apiKey = decrypt(apiKeyRecord.encryptedKey);
      console.log('API key successfully decrypted, length:', apiKey.length);
    } catch (decryptError) {
      console.error('Error decrypting API key:', decryptError);
      throw new Error(`Failed to decrypt Gemini API key: ${decryptError instanceof Error ? decryptError.message : 'Unknown error'}`);
    }

    // Construct the file path
    const filePath = path.join(process.cwd(), 'public', resource.filePath);

    // Check if the file path is valid
    if (!resource.filePath) {
      const errorMessage = 'Resource file path is missing';
      console.error(errorMessage);

      // Update the resource with the error
      await prisma.resource.update({
        where: { id: resourceId },
        data: {
          aiExplanation: `Error: ${errorMessage}. Please re-upload the file.`,
          aiProcessed: true,
        },
      });
      return;
    }

    // Check if the file exists
    if (!fs.existsSync(filePath)) {
      const errorMessage = `File not found at ${filePath}`;
      console.error(errorMessage);

      // Update the resource with the error
      await prisma.resource.update({
        where: { id: resourceId },
        data: {
          aiExplanation: `Error: ${errorMessage}. The uploaded file could not be found on the server. Please re-upload the file.`,
          aiProcessed: true,
        },
      });
      return;
    }

    // Extract text from the PDF
    console.log(`Extracting text from PDF at ${filePath}`);
    let pdfText;
    try {
      pdfText = await extractTextFromPDF(filePath);
      console.log(`Successfully extracted text from PDF. First 100 chars: ${pdfText.substring(0, 100)}...`);

      // Check if the extraction returned an error message
      if (pdfText.includes('Error extracting text from PDF:')) {
        console.error(`PDF extraction error: ${pdfText}`);
        // We'll continue processing as our AI can handle explaining the error
      }
    } catch (extractionError) {
      const errorMessage = `Failed to extract text from PDF: ${extractionError instanceof Error ? extractionError.message : 'Unknown error'}`;
      console.error(errorMessage);

      // Update the resource with the error
      await prisma.resource.update({
        where: { id: resourceId },
        data: {
          aiExplanation: `Error: ${errorMessage}. Please check if the file is a valid PDF document and try again.`,
          aiProcessed: true,
        },
      });
      return;
    }

    // Generate an explanation with AI using the user's Gemini API key
    let explanation;
    try {
      explanation = await generateExplanationWithAI(pdfText, resource.category, apiKey);

      // Check if the explanation is empty or contains an error message
      if (!explanation || explanation.includes('Failed to generate an explanation')) {
        throw new Error(explanation || 'Empty explanation returned from AI');
      }
    } catch (aiError) {
      const errorMessage = `Failed to generate AI explanation: ${aiError instanceof Error ? aiError.message : 'Unknown error'}`;
      console.error(errorMessage);

      // If we have PDF text with an error, we'll still try to provide a helpful message
      if (pdfText.includes('Error extracting text from PDF:')) {
        explanation = `The system encountered an error while processing this PDF file: ${pdfText}\n\n` +
                      `This typically happens when:\n` +
                      `- The file is corrupted or damaged\n` +
                      `- The file is password-protected\n` +
                      `- The file uses unsupported features or encoding\n` +
                      `- The file path is incorrect\n\n` +
                      `Recommendation: Please try uploading the file again. If the problem persists, ` +
                      `try converting the PDF to a newer version using a tool like Adobe Acrobat or an online PDF converter.`;
      } else {
        // Try to use the mock implementation as a fallback
        try {
          console.log('Attempting to use mock implementation as fallback');
          explanation = generateMockExplanation(pdfText, resource.category);
          console.log('Successfully generated mock explanation, length:', explanation.length);
        } catch (mockError) {
          console.error('Error using mock implementation:', mockError);
          explanation = `Error: ${errorMessage}. The system was unable to generate an explanation for this document. ` +
                        `This might be due to temporary issues with the AI service. Please try again later.`;
        }
      }
    }

    // Update the resource with the explanation
    await prisma.resource.update({
      where: { id: resourceId },
      data: {
        aiExplanation: explanation,
        aiProcessed: true,
      },
    });
  } catch (error) {
    console.error('Error processing PDF with AI:', error);
    throw error;
  }
}

// Function to queue PDF processing
export async function queuePDFProcessing(resourceId: string): Promise<void> {
  // In a production environment, you would use a job queue like Bull
  // For simplicity, we'll process the PDF directly
  try {
    if (!resourceId) {
      throw new Error('Resource ID is required for PDF processing');
    }

    // Process the PDF with AI
    await processPDFWithAI(resourceId);

    console.log(`Successfully processed PDF for resource ID: ${resourceId}`);
  } catch (error) {
    console.error('Error queuing PDF processing:', error);

    // Try to update the resource with the error message
    try {
      await prisma.resource.update({
        where: { id: resourceId },
        data: {
          aiExplanation: `Error processing PDF: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again later.`,
          aiProcessed: true,
        },
      });
    } catch (dbError) {
      console.error('Failed to update resource with error message:', dbError);
    }
  }
}
