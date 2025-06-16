import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface PromptMetadata {
  category: string;
  title: string;
}

export async function analyzePrompt(prompt: string): Promise<PromptMetadata> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: `You are a content analysis assistant. Your task is to analyze user prompts and return both a category and a concise title.

For the given prompt, return a JSON object with:
1. category: A single-word category that best describes the content type
2. title: A brief, clear title (3-5 words) that describes what this notification will show

Examples:
- "Show me the surf forecast for Bondi Beach"
  → { "category": "Weather", "title": "Bondi Beach Surf Report" }
- "Show me Elon Musk's tweets"
  → { "category": "Social", "title": "Elon Musk Tweet Updates" }
- "Show me Bitcoin price changes"
  → { "category": "Finance", "title": "Bitcoin Price Alerts" }
- "Show me NBA scores"
  → { "category": "Sports", "title": "Daily NBA Scores" }

Respond with only the JSON object, no other text.`
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    temperature: 0.3,
    max_tokens: 10
  });

  const content = response.choices[0].message.content?.trim() || '{"category":"Misc","title":"Custom Alert"}';
  try {
    return JSON.parse(content) as PromptMetadata;
  } catch (error) {
    console.error('Failed to parse GPT response:', content, error);
    return { category: 'Misc', title: 'Custom Alert' };
  }
}

export async function generateContent(prompt: string, category: string): Promise<string> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: `You are a specialized ${category} content generator. Generate a concise, informative response based on the user's request. Focus on accuracy and relevance.`
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    temperature: 0.7,
    max_tokens: 150
  });

  return response.choices[0].message.content?.trim() || 'Unable to generate content';
}
