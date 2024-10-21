// Stripe configuration
export function getStripeConfig() {
  return {
    STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_51QC6DXBhlzfquWDT2kYPuwetzzmEKdlmPwzJIWNaCHe9GlF7cCRu3BjCc3twJO3rvyNpOzSdqgwNGYRLdeytYiIn00IUIIEJxU',
    PRICE_ID: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID || 'price_1QC6EpBhlzfquWDTZlzigRPV',
    IS_TEST_MODE: process.env.NEXT_PUBLIC_STRIPE_TEST_MODE === 'true',
  };
}

// AI provider configurations
export const AI_PROVIDERS = {
  'gpt-4-1106-preview': {
    url: 'https://api.openai.com/v1/chat/completions',
    headers: (apiKey: string) => ({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    bodyFormatter: (messages: any[]) => ({
      model: 'gpt-4-1106-preview',
      messages: messages,
    }),
  },
  'claude-3-sonnet-20240229': {
    url: 'https://api.anthropic.com/v1/messages',
    headers: (apiKey: string) => ({
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    bodyFormatter: (messages: any[]) => {
      const systemMessage = messages.find(msg => msg.role === 'system');
      const userMessages = messages.filter(msg => msg.role !== 'system');
      return {
        model: 'claude-3-sonnet-20240229',
        messages: userMessages.map(msg => ({
          role: msg.role,
          content: [{ type: 'text', text: msg.content }],
        })),
        system: systemMessage ? systemMessage.content : '',
        max_tokens: 1024,
      };
    },
  },
};

// You can add more Stripe-related utility functions here if needed
