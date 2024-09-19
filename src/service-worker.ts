import { AI_PROVIDERS, DEFAULT_USER_SETTINGS } from "./constants";
import { init, tx, User } from '@instantdb/core';
import { DBSchema, Transformer,UserSettings } from "./types";

// ID for app: InsidiousAI
const APP_ID = 'c0f5375a-23e1-45ca-ae1c-18a334d4e18a'
const db = init<DBSchema>({ appId: APP_ID });

let currentUser: User | undefined;
let userSettings: UserSettings | null = null;
let transformers: Transformer[] | null = null;
db.subscribeAuth((auth) => {
  currentUser = auth.user;

  if (!currentUser) {
    return;
  }

  db.subscribeQuery(
  {userSettings: {$: {where: {id: currentUser.id}}}},
  (resp) => {
    if (resp.error) {
      console.error("Error fetching user settings:", resp.error);
    }

    if (resp.data && resp.data.userSettings.length > 0) {
      userSettings = resp.data.userSettings[0];
    }
  });
});

db.subscribeQuery(
  {transformers: {}},
  (resp) => {
    if (resp.error) {
      console.error("Error fetching transformers:", resp.error);
    }
    if (resp.data) {
      transformers = resp.data.transformers;
    }
  }
)

function formatSystemPrompt(trasnformerId: string) {
  const prefix = "You are a text modification assistant. Your task is to modify the given text according to the user's request. Respond only with the modified text, without any additional commentary or explanations. Keep your response concise and directly address the user's request. Preserve any non-textual styling or formatting present in the original text. If the original text contains HTML elements or other markup, maintain a similar structure in your response. Do not add any prefixes, suffixes, or additional formatting unless explicitly asked.";
  return {
    "role": "system",
    "content": `${prefix}\n\n${transformers?.find(t => t.id === trasnformerId)?.content}`
  }
}

type AIProviderKey = keyof typeof AI_PROVIDERS;

const insidiate = async (text: string, sendResponse: (response: string) => void) => {
  if (!currentUser || !userSettings) {
    console.log("User not logged in, settings not loaded, or transformer not selected");
    sendResponse('text');
    return;
  }

  if (!userSettings.pluginActive) {
    console.log("Insidious disabled");
    sendResponse(text);
    return;
  }

  const { apiKey, selectedModel } = userSettings;

  const provider = AI_PROVIDERS[selectedModel as AIProviderKey];
  if (!provider) {
    console.error(`Unsupported model: ${selectedModel}`);
    sendResponse(`Unsupported model: ${selectedModel}`);
    return;
  }

  fetch(
    provider.url,
    {
      method: "POST",
      headers: provider.headers(apiKey),
      body: JSON.stringify(
        provider.bodyFormatter([
          formatSystemPrompt(userSettings.transformerSelected),
          {
            "role": "user",
            "content": text
          }
        ])
      ),
    }
  ).then(async (response: Response) => {
    const body = await response.json();
    let content;
    if (selectedModel.startsWith('claude')) {
      content = body.content[0].text;
    } else {
      content = body.choices[0].message.content;
    }
    sendResponse(content);
  }).catch(error => {
    console.error('Error:', error);
    sendResponse('An error occurred while processing your request.');
  });
}

chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.type == "insidiate") {
    insidiate(request.text, sendResponse);
  } else if (request.type == "paragraphLimit") {
    sendResponse(userSettings?.paragraphLimit || DEFAULT_USER_SETTINGS.paragraphLimit);
  } else if (request.type === "getPluginState") {
    sendResponse({
      pluginActive: userSettings?.pluginActive || DEFAULT_USER_SETTINGS.pluginActive,
      hoverToReveal: userSettings?.hoverToReveal || DEFAULT_USER_SETTINGS.hoverToReveal
    });
  } else if (request.type === "pluginStateUpdated") {
    // Update the user settings in the database
    if (currentUser) {
      db.transact(tx.userSettings[currentUser.id].update(request.state));
    }
    
    // Broadcast the state change to all content scripts
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach((tab) => {
        if (tab.id) {
          chrome.tabs.sendMessage(tab.id, { type: "pluginStateUpdated", state: request.state });
        }
      });
    });
  } else if (request.type === "promptChanged") {
    // Broadcast the prompt change to all content scripts
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach((tab) => {
        if (tab.id) {
          chrome.tabs.sendMessage(tab.id, { type: "promptChanged" });
        }
      });
    });
  }
  return true;
});

