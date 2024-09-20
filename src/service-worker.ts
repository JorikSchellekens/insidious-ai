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
    console.log("User not logged in, settings not loaded, or transformer not selected");
    sendResponse('text');
    return;
  }

  if (!userSettings.pluginActive) {
    console.log("Insidious disabled");
    sendResponse(text);
    return;
  }

  try {
    const content = await insidiate(userSettings, text, userSettings.transformersSelected, transformers || []);
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

