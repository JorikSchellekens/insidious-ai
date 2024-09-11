import { useState, useEffect } from 'react';
import { PluginState as BasePluginState } from '../types';

interface PluginState extends Omit<BasePluginState, 'id'> {
  id: string;
}

export const usePluginState = (db: IDBDatabase | null) => {
  const [pluginState, setPluginState] = useState<PluginState>({
    id: 'currentState',
    selectedModel: '',
    apiKey: '',
    paragraphLimit: 1,
    pluginActive: false,
    promptSelected: 'mem',
  });

  useEffect(() => {
    console.log('usePluginState effect running, db:', db ? 'initialized' : 'not initialized');
    const fetchPluginState = () => {
      if (!db) {
        console.warn('Database not initialized yet');
        return;
      }

      const transaction = db.transaction(['pluginState'], 'readonly');
      const objectStore = transaction.objectStore('pluginState');
      const request = objectStore.get('currentState');

      request.onsuccess = (event) => {
        const result = (event.target as IDBRequest).result;
        if (result) {
          console.log('Fetched plugin state:', result);
          setPluginState(result);
        } else {
          console.log('No existing plugin state found in database');
        }
      };

      request.onerror = (event) => {
        console.error('Error fetching plugin state:', (event.target as IDBRequest).error);
      };
    };

    fetchPluginState();
  }, [db]);

  const updatePluginState = (newState: Partial<PluginState>) => {
    console.log('updatePluginState called with:', newState);

    if (db) {
      const transaction = db.transaction(['pluginState'], 'readwrite');
      const objectStore = transaction.objectStore('pluginState');
      
      // First, get the current state from the database
      const getRequest = objectStore.get('currentState');

      getRequest.onsuccess = (event) => {
        const currentDbState = (event.target as IDBRequest).result || pluginState;
        console.log('Current state from DB:', currentDbState);

        // Merge the current DB state with the new state
        const updatedState = { ...currentDbState, ...newState };
        console.log('Merged updated state:', updatedState);

        // Now put the updated state back into the database
        const putRequest = objectStore.put(updatedState);

        putRequest.onsuccess = () => {
          console.log('Successfully updated plugin state in database');
          // Update the React state
          setPluginState(updatedState);
          // Notify the service worker about the state update
          chrome.runtime.sendMessage({ type: 'pluginStateUpdated', state: updatedState });
        };

        putRequest.onerror = (event) => {
          console.error('Error updating plugin state in database:', (event.target as IDBRequest).error);
        };
      };

      getRequest.onerror = (event) => {
        console.error('Error fetching current plugin state from database:', (event.target as IDBRequest).error);
      };
    } else {
      console.warn('Database not initialized, unable to save state');
      // If DB is not available, just update the React state
      setPluginState(prevState => ({ ...prevState, ...newState }));
    }
  };

  console.log('Current pluginState:', pluginState);
  return { pluginState, updatePluginState };
};