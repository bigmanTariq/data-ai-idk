const { GoogleGenerativeAI } = require('@google/generative-ai');

// The API key to test
const apiKey = 'AIzaSyCxSwg7l9bHWQ26jxWHCWLJpn_wKiNRb14';

async function listGeminiModels() {
  try {
    console.log('Listing available Gemini models...');
    
    // Create the Gemini client
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // List models
    console.log('Fetching models...');
    
    // Try to access the listModels method if it exists
    if (typeof genAI.listModels === 'function') {
      const models = await genAI.listModels();
      console.log('Available models:', models);
    } else {
      console.log('listModels method not available in this version of the SDK');
      
      // Try to use a different model name
      console.log('Trying with gemini-1.5-pro model...');
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
      const result = await model.generateContent('Hello, please respond with "valid" if you can read this message.');
      const response = await result.response;
      const text = response.text();
      console.log('Response from Gemini API:', text);
    }
  } catch (error) {
    console.error('Error listing Gemini models:');
    console.error(error.message);
    
    // Try with a different model name as a fallback
    try {
      console.log('Trying with gemini-1.0-pro model as fallback...');
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.0-pro' });
      const result = await model.generateContent('Hello, please respond with "valid" if you can read this message.');
      const response = await result.response;
      const text = response.text();
      console.log('Response from Gemini API:', text);
    } catch (fallbackError) {
      console.error('Fallback also failed:');
      console.error(fallbackError.message);
    }
  }
}

listGeminiModels();
