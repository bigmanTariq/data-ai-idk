const { GoogleGenerativeAI } = require('@google/generative-ai');

// The API key to test
const apiKey = 'AIzaSyCxSwg7l9bHWQ26jxWHCWLJpn_wKiNRb14';

async function testGeminiKey() {
  try {
    console.log('Testing Gemini API key...');
    
    // Create the Gemini client
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Get the model
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    // Make a simple request
    console.log('Making test request to Gemini API...');
    const result = await model.generateContent('Hello, please respond with "valid" if you can read this message.');
    
    // Get the response
    const response = await result.response;
    const text = response.text();
    
    console.log('Response from Gemini API:', text);
    console.log('API key is valid!');
  } catch (error) {
    console.error('Error testing Gemini API key:');
    console.error(error.message);
    
    if (error.message.includes('API key')) {
      console.error('The API key appears to be invalid.');
    } else if (error.message.includes('rate limit')) {
      console.error('The API is rate limiting requests. Try again later.');
    } else {
      console.error('An unexpected error occurred.');
    }
  }
}

testGeminiKey();
