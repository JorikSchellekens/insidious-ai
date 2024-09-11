import initialiseDB from "./database";
import { AI_PROVIDERS } from "./constants";

console.log("Bending reality.");

function formatSystemPrompt(prompt: string) {
  return {
    "role": "system",
    "content": prompt
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

    // Comment out the original AI request code
    /*
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
    */

    // Add a 3-second delay and then respond with "text replacement"
    setTimeout(() => {
      sendResponse("text replacement");
    }, 9000);
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
      sendResponse({ pluginActive: false }); // Assume inactive if DB is not ready
      return true;
    }
    const transaction = db.transaction(["pluginState"], "readonly");
    const objectStore = transaction.objectStore("pluginState");
    const request = objectStore.get("currentState");
    request.onsuccess = (event) => {
      const { pluginActive } = (event.target as IDBRequest).result;
      sendResponse({ pluginActive });
    };
    request.onerror = (event) => {
      console.error("Error fetching plugin state:", (event.target as IDBRequest).error);
      sendResponse({ pluginActive: false }); // Assume inactive on error
    };
    return true; // Indicates that the response is sent asynchronously
  }
  if (request.type === "pluginStateUpdated") {
    // Update the local state in the service worker
    if (db) {
      const transaction = db.transaction(["pluginState"], "readwrite");
      const objectStore = transaction.objectStore("pluginState");
      objectStore.put(request.state);
    }
  }
  return true;
});

