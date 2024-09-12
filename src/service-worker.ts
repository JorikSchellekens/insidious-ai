import initialiseDB from "./database";
import { AI_PROVIDERS } from "./constants";

console.log("Bending reality.");

function formatSystemPrompt(prompt: string) {
  const prefix = "You are a text modification assistant. Your task is to modify the given text according to the user's request. Respond only with the modified text, without any additional commentary or explanations. Keep your response concise and directly address the user's request. Preserve any non-textual styling or formatting present in the original text. If the original text contains HTML elements or other markup, maintain a similar structure in your response. Do not add any prefixes, suffixes, or additional formatting unless explicitly asked.";
  return {
    "role": "system",
    "content": `${prefix}\n\n${prompt}`
  }
}

let db: IDBDatabase | null;

// Initialize the database
initialiseDB(self.indexedDB, (database: IDBDatabase | null) => {
  db = database;
  console.log("Database initialized in service worker");
});

type AIProviderKey = keyof typeof AI_PROVIDERS;

const insidiate = async (text: string, sendResponse: (response: string) => void) => {
  if (!db) {
    console.error("Database not initialized");
    sendResponse('Database not initialized. Please try again later.');
    return;
  }

  const transaction = db.transaction(["pluginState"], "readonly");
  const objectStore = transaction.objectStore("pluginState");
  const request = objectStore.get("currentState");

  request.onsuccess = (event) => {
    const { apiKey, promptSelected, pluginActive, selectedModel } = (event.target as IDBRequest).result;
    if (!pluginActive) { 
      console.log("insidious disabled"); 
      sendResponse('Insidious is currently disabled.');
      return; 
    }

    if (!db) {
      console.error("Database not initialized");
      sendResponse('Database not initialized. Please try again later.');
      return;
    }

    const promptTransaction = db.transaction(["prompts"], "readonly");
    const promptObjectStore = promptTransaction.objectStore("prompts");
    const promptRequest = promptObjectStore.get(promptSelected);

    promptRequest.onsuccess = (event) => {
      const { prompt } = (event.target as IDBRequest).result;
      console.log(prompt);

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

    promptRequest.onerror = (event) => {
      console.error("Error fetching prompt:", (event.target as IDBRequest).error);
      sendResponse('Error fetching prompt. Please try again.');
    };
  };

  request.onerror = (event) => {
    console.error("Error fetching plugin state:", (event.target as IDBRequest).error);
    sendResponse('Error fetching plugin state. Please try again.');
  };
}

// @ts-ignore
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log(request.type)
  if (request.type == "insidiate") {
    insidiate(request.text, sendResponse);
  } else if (request.type == "paragraphLimit") {
    console.log("request received")
    if (!db) {
      console.error("Database not initialized");
      sendResponse(1); // Default value
      return true;
    }
    const transaction = db.transaction(["pluginState"], "readonly");
    const objectStore = transaction.objectStore("pluginState");
    const request = objectStore.get("currentState");
    request.onsuccess = (event) => {
      const { paragraphLimit } = (event.target as IDBRequest).result;
      sendResponse(paragraphLimit);
    };
    request.onerror = (event) => {
      console.error("Error fetching paragraph limit:", (event.target as IDBRequest).error);
      sendResponse(1); // Default value
    };
  }
  if (request.type === "getPluginState") {
    console.log("request received")
    if (!db) {
      console.error("Database not initialized");
      sendResponse({ pluginActive: false, hoverToReveal: true });
      return true;
    }
    const transaction = db.transaction(["pluginState"], "readonly");
    const objectStore = transaction.objectStore("pluginState");
    const request = objectStore.get("currentState");
    request.onsuccess = (event) => {
      const state = (event.target as IDBRequest).result;
      sendResponse({
        pluginActive: state.pluginActive,
        hoverToReveal: state.hoverToReveal !== undefined ? state.hoverToReveal : true
      });
    };
    request.onerror = (event) => {
      console.error("Error fetching plugin state:", (event.target as IDBRequest).error);
      sendResponse({ pluginActive: false, hoverToReveal: true });
    };
    return true;
  }
  if (request.type === "pluginStateUpdated") {
    // Update the local state in the service worker
    if (db) {
      const transaction = db.transaction(["pluginState"], "readwrite");
      const objectStore = transaction.objectStore("pluginState");
      objectStore.put(request.state);
      
      // Broadcast the state change to all content scripts
      chrome.tabs.query({}, (tabs) => {
        tabs.forEach((tab) => {
          if (tab.id) {
            chrome.tabs.sendMessage(tab.id, { type: "pluginStateUpdated", state: request.state });
          }
        });
      });
    }
  }
  if (request.type === "promptChanged") {
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

