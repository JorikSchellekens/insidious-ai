import initialiseDB from "./database";

console.log("Bending reality.");

function formatSystemPrompt(prompt: string) {
  return {
    "role": "system",
    "content": prompt
  }
}

let db: IDBDatabase;

initialiseDB(indexedDB, (_db: IDBDatabase | undefined) => {
  if (_db === undefined) return;
  db = _db;
});

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

type AIProviderKey = keyof typeof AI_PROVIDERS;

const insidiate = async (text: string, sendResponse: (response: string) => void) => {
  db
    .transaction("pluginstate")
    .objectStore("pluginstate")
    .getAll().onsuccess = (event: Event) => {
      const { apiKey, promptSelected, pluginActive, selectedModel } = (event.target as IDBRequest).result[0];
      if (!pluginActive) { console.log("insidious disabled"); return; }

      db
        .transaction("prompts")
        .objectStore("prompts")
        .get(promptSelected).onsuccess = (event: Event) => {
          const { prompt } = (event.target as IDBRequest).result;
          console.log(prompt);

          const provider = AI_PROVIDERS[selectedModel as AIProviderKey];
          if (!provider) {
            console.error(`Unsupported model: ${selectedModel}`);
            return;
          }

          fetch(
            provider.url,
            {
              method: "POST",
              headers: provider.headers(apiKey),
              body: JSON.stringify(
                provider.bodyFormatter([
                  formatSystemPrompt(prompt),
                  {
                    "role": "user",
                    "content": text
                  }
                ])
              ),
            }
          ).then(async (response: Response) => {
            const body = await response.json();
            console.log(body);
            let content;
            if (selectedModel.startsWith('claude')) {
              content = body.content[0].text;
            } else {
              content = body.choices[0].message.content;
            }
            console.log(content);
            sendResponse(content);
          }).catch(error => {
            console.error('Error:', error);
            sendResponse('An error occurred while processing your request.');
          });
        };
    }
}

// @ts-ignore
chrome.runtime.onMessage.addListener((request: Message, _: MessageSender, sendResponse: (response: any) => void) => {
  console.log(request.type)
  if (request.type == "insidiate") {
    insidiate(request.text, sendResponse);
  } else if (request.type == "paragraphLimit") {
    console.log("request received")
    db
      .transaction("pluginstate")
      .objectStore("pluginstate")
      .getAll().onsuccess = (event: Event) => {
        console.log("asdasdfasdf")
        const { paragraphLimit } = (event.target as IDBRequest).result[0];
        sendResponse(paragraphLimit);
      }
  }
  return true;
});

