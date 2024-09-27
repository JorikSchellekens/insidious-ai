import { DEFAULT_USER_SETTINGS } from "./constants";
import { init, tx, User } from '@instantdb/core';
import { DBSchema, Transformer,UserSettings } from "./types";
import { insidiate } from './utils/ai';

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

const handleInsidiate = async (text: string, sendResponse: (response: string) => void) => {
  if (!currentUser || !userSettings) {
    sendResponse(text);
    return;
  }

  if (!userSettings.pluginActive) {
    sendResponse(text);
    return;
  }

  try {
    let content: string;
    if (userSettings.isSubscribed) {
      // Send request to your server-side API
      const response = await fetch('https://your-server.com/api/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Include authentication if necessary
        },
        body: JSON.stringify({
          userId: userSettings.id, // Include user ID
          text,
          transformersSelected: userSettings.transformersSelected
        })
      });
      const data = await response.json();
      content = data.content;
    } else {
      // Existing code for non-subscribed users
      content = await insidiate(userSettings, text, userSettings.transformersSelected, transformers || []);
    }

    sendResponse(content);
  } catch (error) {
    console.error('Error:', error);
    sendResponse('An error occurred while processing your request.');
  }
}

chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.type == "insidiate") {
    handleInsidiate(request.text, sendResponse);
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

