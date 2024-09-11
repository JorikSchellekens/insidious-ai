import { useEffect } from 'react';
import { PromptList } from '../components/PromptList';
import { PromptProvider } from '../contexts/PromptContext';
import { usePluginState } from '../hooks/usePluginState';
import { DisabledBanner } from '../components/DisabledBanner';

interface HomeProps {
  db: IDBDatabase;
}

export function Home({ db }: HomeProps) {
  const { pluginState, updatePluginState } = usePluginState(db);

  useEffect(() => {
    // Check plugin state on component mount
    if (db) {
      const transaction = db.transaction(["pluginState"], "readonly");
      const objectStore = transaction.objectStore("pluginState");
      const request = objectStore.get("currentState");

      request.onsuccess = (event) => {
        const { pluginActive } = (event.target as IDBRequest).result;
        updatePluginState({ ...pluginState, pluginActive });
      };
    }
  }, [db]);

  const handleEnable = () => {
    updatePluginState({ ...pluginState, pluginActive: true });
  };

  return (
    <PromptProvider db={db}>
      <div className="flex flex-col h-full overflow-hidden">
        <DisabledBanner onEnable={handleEnable} isDisabled={!pluginState.pluginActive} />
        <h1 className="text-3xl font-bold text-center font-sans p-4">InsidiousAI</h1>
        
        <div className="flex-1 overflow-y-auto p-4">
          <PromptList
            pluginState={pluginState}
            updatePluginState={updatePluginState}
          />
        </div>
      </div>
    </PromptProvider>
  );
}