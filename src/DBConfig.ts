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
    // ... other object stores ...
  ],
};
