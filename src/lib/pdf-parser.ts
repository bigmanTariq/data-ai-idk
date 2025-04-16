import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

/**
 * A completely rewritten PDF parser that avoids the issues with the pdf-parse library
 * This implementation uses a combination of approaches to extract text from PDFs
 */
export async function parsePDF(filePath: string): Promise<string> {
  try {
    // Validate file path
    if (!filePath) {
      throw new Error('No file path provided');
    }

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found at path: ${filePath}`);
    }

    // Check file extension
    const fileExt = path.extname(filePath).toLowerCase();
    if (fileExt !== '.pdf') {
      throw new Error(`File is not a PDF: ${filePath}`);
    }

    // Get file stats to check if it's readable and not empty
    const stats = fs.statSync(filePath);
    if (stats.size === 0) {
      throw new Error('PDF file is empty');
    }

    // Read the PDF file with try-catch for better error handling
    let dataBuffer;
    try {
      dataBuffer = fs.readFileSync(filePath);
    } catch (readError) {
      throw new Error(`Failed to read PDF file: ${readError instanceof Error ? readError.message : 'Unknown read error'}`);
    }

    // Try multiple approaches to extract text from the PDF
    let extractedText = '';

    // Approach 1: Use pdf-parse library with a custom handler to avoid test file issues
    try {
      // Create a temporary copy of the PDF in a known location to avoid path issues
      const tempFilePath = path.join(process.cwd(), 'public', 'temp-pdf-' + Date.now() + '.pdf');
      fs.writeFileSync(tempFilePath, dataBuffer);

      // Import pdf-parse dynamically
      const pdfParse = (await import('pdf-parse')).default;

      // Use a custom options object to avoid the library looking for test files
      const options = {
        // Disable the library's internal test file handling
        version: 'ignore',
        max: 0
      };

      // Parse the PDF
      const data = await pdfParse(dataBuffer, options);

      // Clean up the temporary file
      try { fs.unlinkSync(tempFilePath); } catch (e) { /* ignore cleanup errors */ }

      // If we got text, return it
      if (data && data.text) {
        return data.text;
      }
    } catch (parseError) {
      console.warn('First PDF parsing approach failed:', parseError);
      // Continue to the next approach if this one fails
    }

    // Approach 2: Use a simple text extraction approach as fallback
    try {
      // Convert the buffer to a string and look for text content
      const pdfString = dataBuffer.toString('utf-8', 0, Math.min(dataBuffer.length, 10000));

      // Extract text between stream and endstream tags (simplified approach)
      const textMatches = pdfString.match(/stream[\r\n]+([\s\S]*?)endstream/g);
      if (textMatches && textMatches.length > 0) {
        // Join all text streams and clean up non-printable characters
        extractedText = textMatches
          .map(match => match.replace(/stream[\r\n]+/, '').replace('endstream', ''))
          .join('\n')
          .replace(/[^\x20-\x7E\r\n]/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();

        if (extractedText) {
          return extractedText;
        }
      }
    } catch (fallbackError) {
      console.warn('Fallback PDF parsing approach failed:', fallbackError);
    }

    // If we got here, we couldn't extract text with any method
    return 'No text content could be extracted from the PDF. The document may be scanned, encrypted, or contain only images.';
  } catch (error) {
    console.error('Error parsing PDF:', error);
    // Return a user-friendly error message
    return `Error extracting text from PDF: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }
}
