import { useState, useEffect, useCallback } from 'react';
import { DEFAULT_PLUGIN_STATE } from '../constants';

export interface PluginState {
  id: string;
  selectedModel: string;
  apiKey: string;
  paragraphLimit: number;
  pluginActive: boolean;
}

export const usePluginState = (db: IDBDatabase | undefined) => {
  const [pluginState, setPluginState] = useState<PluginState>({ id: 'currentState', ...DEFAULT_PLUGIN_STATE });

  useEffect(() => {
    if (db && db.objectStoreNames.contains('pluginState')) {
      const transaction = db.transaction(['pluginState'], 'readonly');
      const objectStore = transaction.objectStore('pluginState');
      const request = objectStore.get('currentState');

      request.onsuccess = (event) => {
        const result = (event.target as IDBRequest).result;
        if (result) {
          setPluginState({ ...DEFAULT_PLUGIN_STATE, ...result });
        }
      };

      request.onerror = (event) => {
        console.error("Error fetching plugin state:", (event.target as IDBRequest).error);
      };
    }
  }, [db]);

  const updatePluginState = useCallback((newState: Partial<PluginState>) => {
    if (db && db.objectStoreNames.contains('pluginState')) {
      const updatedState = { ...pluginState, ...newState, id: 'currentState' };
      setPluginState(updatedState);

      const transaction = db.transaction(['pluginState'], 'readwrite');
      const objectStore = transaction.objectStore('pluginState');
      const request = objectStore.put(updatedState);

      request.onerror = (event) => {
        console.error("Error updating plugin state:", (event.target as IDBRequest).error);
      };
    }
  }, [db, pluginState]);

  return { pluginState, updatePluginState };
};