
import { Injectable, signal } from '@angular/core';
import { GoogleGenAI, GenerateContentResponse, Type } from '@google/genai';

@Injectable({
  providedIn: 'root',
})
export class GeminiService {
  private ai: GoogleGenAI | null = null;
  public error = signal<string | null>(null);

  constructor() {
    try {
      if (typeof process === 'undefined' || !process.env['API_KEY']) {
         console.warn('API_KEY environment variable not found. GeminiService will be disabled.');
         return;
      }
      this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    } catch (e) {
      console.error('Error initializing GoogleGenAI:', e);
      this.error.set('Failed to initialize AI service. Please check your API key.');
    }
  }

  async generateBlogPost(topic: string): Promise<{ title: string; summary: string } | null> {
    this.error.set(null);
    if (!this.ai) {
      this.error.set('AI Service is not available. Ensure API_KEY is configured.');
      console.error('GeminiService not initialized.');
      return null;
    }

    const model = 'gemini-2.5-flash';
    const prompt = `Generate a creative and engaging blog post title and a 2-sentence summary for a personal anime-style blog. The topic is "${topic}". The tone should be cheerful and friendly.`;

    try {
      const response: GenerateContentResponse = await this.ai.models.generateContent({
        model: model,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: {
                type: Type.STRING,
                description: 'The blog post title.',
              },
              summary: {
                type: Type.STRING,
                description: 'A 2-sentence summary of the blog post.',
              },
            },
            required: ['title', 'summary'],
          },
          temperature: 0.8,
        }
      });
      
      const jsonString = response.text.trim();
      const result = JSON.parse(jsonString);
      return result as { title: string; summary: string };

    } catch (e) {
      console.error('Error generating blog post:', e);
      this.error.set('Failed to generate content. The AI might be busy. Please try again later.');
      return null;
    }
  }
}
