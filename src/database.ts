import { DEFAULT_PLUGIN_STATE } from './constants';
import { DBConfig } from './DBConfig';
import { prompts as defaultPrompts } from './prompts';

export default function initialiseDB(
  indexedDB: IDBFactory,
  setDB: (db: IDBDatabase | undefined) => void
) {
  const request = indexedDB.open(DBConfig.name, DBConfig.version);

  request.onerror = (event) => {
    console.error("Database error:", (event.target as IDBOpenDBRequest).error);
  };

  request.onsuccess = (event) => {
    const db = (event.target as IDBOpenDBRequest).result;
    setDB(db);
  };

  request.onupgradeneeded = (event) => {
    const db = (event.target as IDBOpenDBRequest).result;
    
    DBConfig.objectStoresMeta.forEach(storeMeta => {
      if (!db.objectStoreNames.contains(storeMeta.store)) {
        console.log(`Creating '${storeMeta.store}' object store`);
        const objectStore = db.createObjectStore(storeMeta.store, storeMeta.storeConfig);
        
        if (storeMeta.store === 'pluginState') {
          objectStore.add({ id: 'currentState', ...DEFAULT_PLUGIN_STATE });
        } else if (storeMeta.store === 'prompts') {
          // Add default prompts from prompts.ts
          defaultPrompts.forEach(prompt => {
            objectStore.add(prompt);
          });
        }
        
        storeMeta.storeSchema.forEach(schema => {
          objectStore.createIndex(schema.name, schema.keypath, schema.options);
        });
      }
    });
  };
}
