import { useEffect, useState } from 'react';
import initialiseDB from "./database";
import { Home } from './pages/Home';
import SettingsPageWrapper from './components/SettingsPageWrapper';
import SettingsPage from './pages/SettingsPage';
import FirstTimeFlow from './components/FirstTimeFlow';
import { useLocalStorage } from "@uidotdev/usehooks";
import { usePluginState } from './hooks/usePluginState';

function App() {
  const [db, setDB] = useState<IDBDatabase | undefined>();
  const [isFirstTime, setIsFirstTime] = useLocalStorage("isFirstTime", true);
  const { updatePluginState } = usePluginState(db);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initDB = async () => {
      await initialiseDB(window.indexedDB, setDB);
      setIsLoading(false);
    };
    initDB();
  }, []);

  const handleFirstTimeComplete = (model: string, apiKey: string) => {
    if (db) {
      updatePluginState({
        selectedModel: model,
        apiKey: apiKey,
        paragraphLimit: 1,
        pluginActive: true
      });
      setIsFirstTime(false);
    }
  };

  if (isLoading || db === undefined) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="min-w-[350px]">
      {isFirstTime ? (
        <FirstTimeFlow onComplete={handleFirstTimeComplete} />
      ) : (
        <SettingsPageWrapper settingsPage={<SettingsPage db={db} />}>
          <div className="p-4 bg-gray-100 min-h-screen">
            <Home db={db} />
          </div>
        </SettingsPageWrapper>
      )}
    </div>
  );
}

export default App;
