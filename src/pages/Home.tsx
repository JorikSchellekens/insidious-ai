import { PromptList } from '../components/PromptList';
import { PromptProvider } from '../contexts/PromptContext';
import { usePluginState } from '../hooks/usePluginState';

interface HomeProps {
  db: IDBDatabase;
}

export function Home({ db }: HomeProps) {
  const { pluginState, updatePluginState } = usePluginState(db);

  return (
    <PromptProvider db={db}>
      <div className="flex flex-col h-full overflow-hidden">
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