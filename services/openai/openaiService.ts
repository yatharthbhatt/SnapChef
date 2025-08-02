import { ENV } from '@/config/env';

interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

interface OpenAIVisionResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

class OpenAIService {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = ENV.OPENAI.BASE_URL;
    this.apiKey = ENV.OPENAI.API_KEY;
  }

  // Check if OpenAI is properly configured
  isConfigured(): boolean {
    return this.apiKey && this.apiKey !== 'your-openai-api-key-here';
  }

  // Get chat response from OpenAI
  async getChatResponse(message: string, systemPrompt?: string): Promise<string> {
    if (!this.isConfigured()) {
      return "I'm not connected to OpenAI yet. Please add your API key to get started!";
    }

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            { 
              role: 'system', 
              content: systemPrompt || `You are Snappy, a friendly AI chef assistant. 
              Provide helpful, personalized recipe suggestions and cooking advice.
              Keep responses concise but informative. Include calorie estimates when relevant.
              Focus on healthy, practical recipes that users can actually make.`
            },
            { role: 'user', content: message }
          ],
          max_tokens: 500,
          temperature: 0.7,
        }),
      });

      const responseText = await response.text();
      if (!responseText) {
        return 'Sorry, I couldn\'t process that request.';
      }
      
      try {
        const data: OpenAIResponse = JSON.parse(responseText);
        return data.choices[0]?.message?.content || 'Sorry, I couldn\'t process that request.';
      } catch (parseError) {
        console.error('Error parsing OpenAI response:', parseError);
        return 'Sorry, I\'m having trouble processing the response. Please try again.';
      }
    } catch (error) {
      console.error('Error getting chat response:', error);
      return 'Sorry, I\'m having trouble connecting right now. Please try again.';
    }
  }

  // Analyze food image using OpenAI Vision
  async analyzeFoodImage(base64Image: string): Promise<any[]> {
    if (!this.isConfigured()) {
      console.warn('OpenAI not configured');
      return [];
    }

    try {
      const prompt = `Analyze this food image and provide detailed recipe information. 
      Return a JSON array with recipes that can be made from the visible ingredients.
      Each recipe should include: name, confidence (0-100), calories, servings, cookTime, difficulty, 
      macros (protein, carbs, fats, fiber, sugar in grams), description, ingredients array, and instructions array.
      Only suggest recipes if you can clearly identify food items in the image.
      If no clear food items are visible, return an empty array.`;

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4-vision-preview',
          messages: [
            {
              role: 'user',
              content: [
                { type: 'text', text: prompt },
                { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${base64Image}` } }
              ]
            }
          ],
          max_tokens: 1500,
        }),
      });

      const responseText = await response.text();
      if (!responseText) return [];
      
      try {
        const data: OpenAIVisionResponse = JSON.parse(responseText);
        const content = data.choices[0]?.message?.content;
        
        if (content) {
          try {
            return JSON.parse(content);
          } catch {
            return [];
          }
        }
        return [];
      } catch (parseError) {
        console.error('Error parsing OpenAI vision response:', parseError);
        return [];
      }
    } catch (error) {
      console.error('Error analyzing food image:', error);
      return [];
    }
  }

  // Get time-based food suggestions
  async getTimeBasedSuggestions(): Promise<string> {
    const currentHour = new Date().getHours();
    let mealType = '';
    let timeContext = '';

    if (currentHour >= 4 && currentHour < 9) {
      mealType = 'breakfast';
      timeContext = 'morning energy boost';
    } else if (currentHour >= 9 && currentHour < 15) {
      mealType = 'lunch';
      timeContext = 'midday nutrition';
    } else if (currentHour >= 15 && currentHour < 19) {
      mealType = 'snack';
      timeContext = 'afternoon energy';
    } else if (currentHour >= 19 && currentHour < 24) {
      mealType = 'dinner';
      timeContext = 'evening meal';
    } else {
      mealType = 'night snack';
      timeContext = 'light late-night option';
    }

    const prompt = `Suggest 3 healthy ${mealType} options for ${timeContext}. 
    Include brief descriptions and approximate calories for each. 
    Keep it concise and appetizing. Focus on practical recipes people can actually make.`;

    return await this.getChatResponse(prompt);
  }
}

export const openaiService = new OpenAIService();