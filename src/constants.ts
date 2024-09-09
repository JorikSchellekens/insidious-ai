import {PluginState} from "./types";

export const DEFAULT_PLUGIN_STATE = {
  selectedModel: '',
  apiKey: '',
  paragraphLimit: 1,
  pluginActive: true,
};

export const DB_VERSION = 3; // Change this to match the version in database.ts

export const AI_PROVIDERS = {
  'gpt-4-1106-preview': {
    url: 'https://api.openai.com/v1/chat/completions',
    headers: (apiKey: string) => ({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    }),
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
