import { DB_VERSION } from './constants';

export const DBConfig = {
  name: "InsidiousAIDB",
  version: DB_VERSION,
  objectStoresMeta: [
    {
      store: "prompts",
      storeConfig: { keyPath: "id", autoIncrement: true },
      storeSchema: [
        { name: "title", keypath: "title", options: { unique: false } },
        { name: "prompt", keypath: "prompt", options: { unique: false } },
      ],
    },
    {
      store: "pluginState",
      storeConfig: { keyPath: "id" },
      storeSchema: [
        { name: "selectedModel", keypath: "selectedModel", options: { unique: false } },
        { name: "apiKey", keypath: "apiKey", options: { unique: false } },
        { name: "paragraphLimit", keypath: "paragraphLimit", options: { unique: false } },
        { name: "pluginActive", keypath: "pluginActive", options: { unique: false } },
        { name: "promptSelected", keypath: "promptSelected", options: { unique: false } },
      ],
    },
  ],
};
