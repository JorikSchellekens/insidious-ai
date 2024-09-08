import { useEffect, useState } from 'react';
import '@aws-amplify/ui-react/styles.css';
import './App.css';
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
    return <div>Loading...</div>;
  }

  return (
    <SettingsPageWrapper settingsPage={<SettingsPage />}>
      <Home db={db} />
    </SettingsPageWrapper>
  );
}

export default App;
