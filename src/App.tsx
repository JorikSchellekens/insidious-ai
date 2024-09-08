import { useEffect, useState } from 'react';
import '@aws-amplify/ui-react/styles.css';
// Remove './App.css' import as we'll be using Tailwind classes
import initialiseDB from "./database";
import { Home } from './pages/Home';
import SettingsPageWrapper from './components/SettingsPageWrapper';
import SettingsPage from './pages/SettingsPage';

function App() {
  const [db, setDB] = useState<IDBDatabase | undefined>();

  useEffect(() => {
    initialiseDB(window.indexedDB, setDB);
  }, []);

  if (db === undefined) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <SettingsPageWrapper settingsPage={<SettingsPage />}>
      <div className="p-4 bg-gray-100 min-h-screen">
        <Home db={db} />
      </div>
    </SettingsPageWrapper>
  );
}

export default App;
