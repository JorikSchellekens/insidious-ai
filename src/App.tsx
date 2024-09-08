import React, { useEffect, useState } from 'react';
import '@aws-amplify/ui-react/styles.css';
import './App.css';
import initialiseDB from "./database";
import { Home } from './pages/Home';

function App() {
  const [db, setDB] = useState<IDBDatabase | undefined>();

  useEffect(() => {
    initialiseDB(window.indexedDB, setDB);
  }, []);

  if (db === undefined) {
    return <div>Loading...</div>;
  }

  return <Home db={db} />;
}

export default App;
