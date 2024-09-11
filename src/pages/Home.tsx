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
    console.log('Home component mounted, current pluginState:', pluginState);
    // We don't need to fetch the state here anymore, as it's handled in usePluginState
  }, []);

  const handleEnable = () => {
    console.log('handleEnable called, current pluginActive:', pluginState.pluginActive);
    updatePluginState({ pluginActive: true });
  };

  console.log('Home component rendering, pluginState:', pluginState);

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