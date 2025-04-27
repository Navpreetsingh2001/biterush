
const { genkit } = require('genkit');
const { googleAI } = require('@genkit-ai/googleai');

// Ensure GOOGLE_GENAI_API_KEY is accessible, potentially using dotenv if not set globally
// require('dotenv').config();

const ai = genkit({
  promptDir: './prompts',
  plugins: [
    googleAI({
      apiKey: process.env.GOOGLE_GENAI_API_KEY,
    }),
  ],
  model: 'googleai/gemini-2.0-flash',
});

module.exports = { ai };
