import { useState, useEffect } from 'react';
import { PluginState } from '../types';
import { DEFAULT_PLUGIN_STATE } from '../constants';

export function usePluginState(db: IDBDatabase) {
  const [pluginState, setPluginState] = useState<PluginState>(DEFAULT_PLUGIN_STATE);

  useEffect(() => {
    db.transaction("pluginstate")
      .objectStore("pluginstate")
      .getAll().onsuccess = (event: Event) => {
        const result = (event.target as IDBRequest).result;
        if (result && result.length > 0) {
          setPluginState(result[0]);
        }
      };
  }, [db]);

  const updatePluginState = (newState: Partial<PluginState>) => {
    const updatedState = { ...pluginState, ...newState };
    setPluginState(updatedState);
    db.transaction("pluginstate", "readwrite")
      .objectStore("pluginstate")
      .put(updatedState);
  };

  return { pluginState, updatePluginState };
}