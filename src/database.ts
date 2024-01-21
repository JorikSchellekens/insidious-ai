import { DB_VERSION, DEFAULT_PLUGIN_STATE } from "./constants";
import { prompts } from "./prompts";

// Initialise app state
export default function initialiseDB(indexedDB: IDBFactory, setDB: (db: IDBDatabase | undefined) => void) {
  const request = indexedDB.open("Insidious", DB_VERSION);
  request.onupgradeneeded = (event) => {
    if (event.target === null) { console.log("DB null"); return }
    const db = (event.target as IDBOpenDBRequest).result;

    db.createObjectStore("pluginstate", { keyPath: "id", autoIncrement: true });
    const promptsStore = db.createObjectStore("prompts", { keyPath: "id", autoIncrement: true });
    promptsStore.transaction.oncomplete = () => {
      const promptsStore = db
        .transaction("prompts", "readwrite")
        .objectStore("prompts");

      prompts.forEach((prompt) => {
        promptsStore.add(prompt);
      });

      const store = db
        .transaction("pluginstate", "readwrite")
        .objectStore("pluginstate");
      store.add(DEFAULT_PLUGIN_STATE);
    }
  }

  request.onsuccess = (event) => {
    if (event.target === null) { return };
    setDB((event.target as IDBOpenDBRequest).result);
  };
}
