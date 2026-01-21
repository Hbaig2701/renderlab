import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Model for enhancements (Flash - faster, cheaper)
export const flashModel = genAI.getGenerativeModel({
  model: 'gemini-2.0-flash-exp',
});

// Model for widget transforms (Pro - higher quality)
export const proModel = genAI.getGenerativeModel({
  model: 'gemini-2.0-flash-exp', // Using flash for now, can upgrade to pro when available
});

export { genAI };
