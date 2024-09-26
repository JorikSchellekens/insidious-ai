import React from 'react';
import { init, User } from '@instantdb/react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Home } from './pages/Home';
import SettingsPageWrapper from './components/SettingsPageWrapper';
import SettingsPage from './pages/SettingsPage';
import FirstTimeFlow from './components/FirstTimeFlow';
import { DBSchema } from './types';
import { ArrowUpRight } from 'lucide-react';
import Explorer from './pages/Explorer';

// ID for app: insidiousai
const APP_ID = 'c0f5375a-23e1-45ca-ae1c-18a334d4e18a';

const db = init<DBSchema>({ appId: APP_ID });

function App() {
  const { isLoading, user, error } = db.useAuth();

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  if (error) {
    return <div className="flex items-center justify-center h-screen">Uh oh! {error.message}</div>;
  }
  if (!user) return <FirstTimeFlow db={db} />

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoggedInApp user={user} />} />
        <Route path="/index.html" element={<LoggedInApp user={user} />} />
        <Route path="/explorer" element={<Explorer db={db} user={user} />} />
      </Routes>
    </Router>
  );
}

interface LoggedInAppProps {
  user: User;
}

function LoggedInApp({ user }: LoggedInAppProps) {
  const {isLoading: isLoadingUserSettings, data: userSettings, error: errorUserSettings} = db.useQuery({ userSettings: { $: { where: { id: user.id } } } });
  
  const openExplorer = () => {
    if (chrome && chrome.tabs) {
      chrome.tabs.create({ url: chrome.runtime.getURL('/explorer') });
    } else {
      window.open(chrome.runtime.getURL('/explorer'), '_blank');
    }
  };

  if (isLoadingUserSettings) return <div>Loading user settings...</div>
  if (errorUserSettings) return <div>Error loading user settings: {errorUserSettings.message}</div>
  if (!userSettings || userSettings.userSettings.length === 0) return <SettingsPage db={db} user={user} />

  return (
    <div className="min-w-[350px] min-h-[600px] relative">
      <div 
        className="absolute top-4 right-4 cursor-pointer hover:scale-110 transition-transform z-50"
        onClick={openExplorer}
      >
        <ArrowUpRight size={24} />
      </div>
      <SettingsPageWrapper settingsPage={<SettingsPage db={db} user={user} />}>
        <div className="p-4 bg-gray-100 min-h-screen">
          <Home db={db} user={user} />
        </div>
      </SettingsPageWrapper>
    </div>
  )
}

export default App;
