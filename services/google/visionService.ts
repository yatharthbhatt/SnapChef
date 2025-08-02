import { ENV } from '@/config/env';

interface GoogleVisionResponse {
  responses: Array<{
    labelAnnotations?: Array<{
      description: string;
      score: number;
    }>;
    textAnnotations?: Array<{
      description: string;
    }>;
  }>;
}

class GoogleVisionService {
  private apiKey: string;
  private baseUrl: string = 'https://vision.googleapis.com/v1';

  constructor() {
    this.apiKey = ENV.GOOGLE.VISION_API_KEY;
  }

  // Check if Google Vision is configured
  isConfigured(): boolean {
    return this.apiKey && this.apiKey !== 'your-google-vision-api-key-here';
  }

  // Detect food items in image
  async detectFood(base64Image: string): Promise<string[]> {
    if (!this.isConfigured()) {
      console.warn('Google Vision not configured');
      return [];
    }

    try {
      const response = await fetch(`${this.baseUrl}/images:annotate?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requests: [
            {
              image: {
                content: base64Image,
              },
              features: [
                {
                  type: 'LABEL_DETECTION',
                  maxResults: 20,
                },
              ],
            },
          ],
        }),
      });

      const data: GoogleVisionResponse = await response.json();
      const labels = data.responses[0]?.labelAnnotations || [];
      
      // Filter for food-related labels
      const foodKeywords = ['food', 'fruit', 'vegetable', 'meat', 'dairy', 'grain', 'spice', 'herb'];
      const detectedFoods = labels
        .filter(label => 
          label.score > 0.7 && 
          foodKeywords.some(keyword => 
            label.description.toLowerCase().includes(keyword)
          )
        )
        .map(label => label.description);

      return detectedFoods;
    } catch (error) {
      console.error('Error detecting food:', error);
      return [];
    }
  }

  // Detect text in food packaging
  async detectText(base64Image: string): Promise<string[]> {
    if (!this.isConfigured()) {
      return [];
    }

    try {
      const response = await fetch(`${this.baseUrl}/images:annotate?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requests: [
            {
              image: {
                content: base64Image,
              },
              features: [
                {
                  type: 'TEXT_DETECTION',
                  maxResults: 10,
                },
              ],
            },
          ],
        }),
      });

      const data: GoogleVisionResponse = await response.json();
      const textAnnotations = data.responses[0]?.textAnnotations || [];
      
      return textAnnotations.map(annotation => annotation.description);
    } catch (error) {
      console.error('Error detecting text:', error);
      return [];
    }
  }
}

export const googleVisionService = new GoogleVisionService();