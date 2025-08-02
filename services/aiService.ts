import { openaiService } from './openai/openaiService';
import { googleVisionService } from './google/visionService';

interface FoodAnalysisResult {
  name: string;
  confidence: number;
  calories: number;
  servings: number;
  cookTime: string;
  difficulty: string;
  macros: {
    protein: number;
    carbs: number;
    fats: number;
    fiber: number;
    sugar: number;
  };
  description: string;
  ingredients: string[];
  instructions: string[];
}

class AIService {
  // Analyze food image and return recipe suggestions
  async analyzeFoodImage(imageUri: string): Promise<FoodAnalysisResult[]> {
    try {
      // Convert image to base64
      const base64Image = await this.convertImageToBase64(imageUri);
      
      // Try Google Vision first for food detection
      if (googleVisionService.isConfigured()) {
        const detectedFoods = await googleVisionService.detectFood(base64Image);
        if (detectedFoods.length === 0) {
          // No food detected by Google Vision
          return [];
        }
      }

      // Use OpenAI Vision for recipe analysis
      const recipes = await openaiService.analyzeFoodImage(base64Image);
      return recipes;
    } catch (error) {
      console.error('Error analyzing food image:', error);
      return [];
    }
  }

  // Get chat response
  async getChatResponse(message: string, context?: string): Promise<string> {
    const systemPrompt = `You are Snappy, a friendly AI chef assistant. 
    Provide helpful, personalized recipe suggestions and cooking advice.
    Keep responses concise but informative. Include calorie estimates when relevant.
    ${context ? `Context: ${context}` : ''}`;

    return await openaiService.getChatResponse(message, systemPrompt);
  }

  // Get time-based food suggestions
  async getTimeBasedSuggestions(): Promise<string> {
    return await openaiService.getTimeBasedSuggestions();
  }

  // Check if AI services are configured
  isConfigured(): boolean {
    return openaiService.isConfigured();
  }

  // Convert image to base64
  private async convertImageToBase64(imageUri: string): Promise<string> {
    try {
      const response = await fetch(imageUri);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = (reader.result as string).split(',')[1];
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Error converting image to base64:', error);
      throw error;
    }
  }
}

export const aiService = new AIService();