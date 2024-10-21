import { AI_PROVIDERS } from '../constants/stripe';

export interface AIResponse {
  content: string;
}

export async function callAI(
  apiKey: string,
  selectedModel: string,
  systemPrompt: string,
  userPrompt: string
): Promise<AIResponse> {
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
