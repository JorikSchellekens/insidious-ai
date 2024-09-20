import { AI_PROVIDERS } from '../constants';
import { UserSettings } from '../types';

interface AIResponse {
  content: string;
}

async function callAI(
  userSettings: UserSettings,
  systemPrompt: string,
  userPrompt: string
): Promise<AIResponse> {
  const { apiKey, selectedModel } = userSettings;
  const provider = AI_PROVIDERS[selectedModel as keyof typeof AI_PROVIDERS];

  if (!provider) {
    throw new Error(`Unsupported model: ${selectedModel}`);
  }

  const response = await fetch(provider.url, {
    method: "POST",
    headers: provider.headers(apiKey),
    body: JSON.stringify(
      provider.bodyFormatter([
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ])
    ),
  });

  const body = await response.json();
  let content: string;

  if (selectedModel.startsWith('claude')) {
    content = body.content[0].text;
  } else {
    content = body.choices[0].message.content;
  }

  return { content };
}

export async function improveTransformer(
  userSettings: UserSettings,
  title: string,
  content: string
): Promise<{ title: string; content: string }> {
  const systemPrompt = 'You are an AI assistant that improves transformer prompts for text modification tasks.';
  const userPrompt = `Improve the following transformer prompt. Your task is to make it clear, concise, and effectively implement the intention of what's specified. If the original is high-level or poorly specified, expand on it appropriately. Focus on creating a prompt that can be used to modify text according to the user's request.

Respond only with the improved transformer, without any additional commentary or explanations. Format your response as a JSON object with 'title' and 'content' fields.

Original Title: ${title}
Original Content: ${content}

Your response should follow this format exactly:
{
  "title": "Improved Title Here",
  "content": "Improved content here. This should be a clear, concise instruction for modifying text according to the transformer's purpose."
}`;

  const { content: responseContent } = await callAI(userSettings, systemPrompt, userPrompt);
  const improved = JSON.parse(responseContent);
  return { title: improved.title, content: improved.content };
}

const DEFAULT_CATEGORIES = [
  "Educational", "Entertaining", "Professional", "Creative", "Analytical",
  "Persuasive", "Informative", "Emotional", "Formal", "Casual",
  "Technical", "Simplified", "Detailed", "Concise", "Expanded",
  "Positive", "Negative", "Neutral", "Humorous", "Serious",
  "Academic", "Journalistic", "Literary", "Scientific", "Philosophical",
  "Historical", "Futuristic", "Cultural", "Political", "Economic",
  "Environmental", "Technological", "Artistic", "Musical", "Cinematic",
  "Sports-related", "Health-focused", "Business-oriented", "Legal",
  "Religious", "Ethical", "Controversial", "Inspirational", "Motivational",
  "Instructional", "Narrative", "Descriptive", "Argumentative", "Comparative",
  "Misc"
];

export async function generateCategories(
  userSettings: UserSettings,
  text: string
): Promise<string[]> {
  const systemPrompt = `You are an AI assistant that generates relevant categories for text transformation prompts. Your task is to provide 1-5 categories that best describe the purpose, style, or domain of the given transformer prompt.

Important guidelines:
1. Do not generate categories that simply describe what a transformer does (e.g., "text manipulation", "text modification", "language processing").
2. Focus on categories that describe the purpose, style, tone, or domain of the transformed text.
3. Consider the perspective of someone who already knows what a transformer is.
4. If the transformer is very small or general in nature, you can use the 'Misc' category.
5. Prefer selecting from the following list of categories, but you may suggest new ones if they are particularly relevant:

${DEFAULT_CATEGORIES.join(", ")}

Provide your response as a comma-separated list of 1-5 categories. Use 'Misc' for small or general transformers that don't fit well into other categories.`;

  const userPrompt = `Generate categories for the following transformer prompt: ${text}`;

  const { content } = await callAI(userSettings, systemPrompt, userPrompt);
  return content.split(',').map((cat: string) => cat.trim());
}

export async function insidiate(
  userSettings: UserSettings,
  text: string,
  transformerIds: string[],
  transformers: any[]
): Promise<string> {
  const selectedTransformers = transformers.filter(t => transformerIds.includes(t.id)) || [];
  
  const prefix = "You are a text modification assistant. Your task is to modify the given text according to the user's request. Respond only with the modified text, without any additional commentary or explanations. Keep your response concise and directly address the user's request. Preserve any non-textual styling or formatting present in the original text. If the original text contains HTML elements or other markup, maintain a similar structure in your response. Do not add any prefixes, suffixes, or additional formatting unless explicitly asked.";

  let systemPrompt: string;

  if (selectedTransformers.length === 1) {
    systemPrompt = `${prefix}\n\nYour specific modification task is:\n${selectedTransformers[0].content}`;
  } else {
    systemPrompt = `${prefix}\n\nYour specific modification tasks are:

${selectedTransformers.map((t, index) => `${index + 1}. ${t.content}`).join('\n')}

Apply all these modifications simultaneously while maintaining the essence and structure of the original text. Balance these objectives appropriately in your response.`;
  }

  const { content } = await callAI(userSettings, systemPrompt, text);
  return content;
}

export async function remixTransformers(
  userSettings: UserSettings,
  transformers: { title: string; content: string }[]
): Promise<{ title: string; content: string }> {
  const systemPrompt = `You are an AI assistant that combines multiple text transformation prompts into a single, cohesive prompt. Your task is to create a new transformer that effectively merges the functionality of the given transformers.

Important guidelines:
1. Analyze the purpose and functionality of each input transformer.
2. Create a new transformer that combines these functionalities in a logical and efficient manner.
3. The new transformer should be able to perform all the tasks of the input transformers, but as a single, unified operation.
4. Generate a concise yet descriptive title for the new transformer that reflects its combined functionality.
5. The content should be clear, concise, and effectively implement the intention of all input transformers.
6. Ensure the new transformer is coherent and doesn't contain contradictory instructions.`;

  const userPrompt = `Combine the following transformers into a single, more powerful transformer:

${transformers.map((t, i) => `Transformer ${i + 1}:
Title: ${t.title}
Content: ${t.content}`).join('\n\n')}

Respond with a JSON object containing the 'title' and 'content' for the new, combined transformer. The title should be creative and reflect the combined functionality, not just a list of the original titles.`;

  const { content: responseContent } = await callAI(userSettings, systemPrompt, userPrompt);
  const remixed = JSON.parse(responseContent);
  return { title: remixed.title, content: remixed.content };
}