export const DBConfig = {
  name: "Insidious",
  version: 1,
  objectStoresMeta: [
    {
      store: "prompts",
      storeConfig: { keyPath: "name" },
      storeSchema: [
        { name: "name", keypath: "name", options: { unique: true } },
        { name: "prompt", keypath: "prompt", options: { unique: false } },
      ],
    },
    {
      store: "pluginState",
      storeConfig: { keyPath: "id", autoIncrement: true },
      storeSchema: [
      ],
    },
  ],
};
