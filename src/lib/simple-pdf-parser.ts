import fs from 'fs';
import path from 'path';

/**
 * A simple PDF parser that extracts text from PDFs without relying on external libraries
 * This avoids the issues with the pdf-parse library trying to access test files
 */
export async function extractTextFromPDF(filePath: string): Promise<string> {
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

    // Read the PDF file as a binary buffer
    const pdfBuffer = fs.readFileSync(filePath);

    // Convert the buffer to a string and look for text content
    const pdfString = pdfBuffer.toString('utf-8', 0, Math.min(pdfBuffer.length, 50000));

    // Extract text between stream and endstream tags (simplified approach)
    const textMatches = pdfString.match(/stream[\r\n]+([\s\S]*?)endstream/g);

    if (textMatches && textMatches.length > 0) {
      // Join all text streams and clean up non-printable characters
      let extractedText = textMatches
        .map(match => match.replace(/stream[\r\n]+/, '').replace('endstream', ''))
        .join('\n')
        .replace(/[^\x20-\x7E\r\n]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      // If we got text, return it
      if (extractedText && extractedText.length > 20) {
        return extractedText;
      }
    }

    // If we couldn't extract text with the simple approach, try a more advanced method
    try {
      // Use a simple string extraction approach as a last resort
      let extractedText = '';

      // Look for text strings in the PDF
      const stringMatches = pdfString.match(/\([^\)]+\)/g);
      if (stringMatches && stringMatches.length > 0) {
        extractedText = stringMatches
          .map(match => match.replace(/^\(/, '').replace(/\)$/, ''))
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim();
      }

      // If we got text, return it
      if (extractedText && extractedText.length > 50) {
        return extractedText;
      }

      // If all else fails, return a placeholder message
      return `This PDF contains content that could not be extracted as text. It may contain images, scanned text, or be in a format that's not easily parsed. Please review the original PDF file for its contents.`;

    } catch (error) {
      console.error('Error in advanced text extraction:', error);
      return `Error extracting text from PDF: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  } catch (error) {
    console.error('Error parsing PDF:', error);
    return `Error extracting text from PDF: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }
}
