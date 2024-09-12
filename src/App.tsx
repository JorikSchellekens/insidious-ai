import { init, User } from '@instantdb/react';
import { Home } from './pages/Home';
import SettingsPageWrapper from './components/SettingsPageWrapper';
import SettingsPage from './pages/SettingsPage';
import FirstTimeFlow from './components/FirstTimeFlow';
import { useLocalStorage } from "@uidotdev/usehooks";
import { DBSchema } from './types';
import { useUserSettings } from './hooks/useUserSettings';

// ID for app: insidiousai
const APP_ID = 'c0f5375a-23e1-45ca-ae1c-18a334d4e18a';

const db = init<DBSchema>({ appId: APP_ID });

function App() {
  const [isFirstTime, setIsFirstTime] = useLocalStorage("isFirstTime", true);
  const { isLoading, user, error } = db.useAuth();
  const { updateUserSettings } = useUserSettings(db);

  const handleFirstTimeComplete = (model: string, apiKey: string, user: User) => {
    // Update user settings using useUserSettings hook
    updateUserSettings({
      selectedModel: model,
      apiKey: apiKey,
      paragraphLimit: 1,
      pluginActive: true
    }, user);
    setIsFirstTime(false);
  };
  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (error) {
    return <div className="flex items-center justify-center h-screen">Uh oh! {error.message}</div>;
  }

  return (
    <div className="min-w-[350px] min-h-[600px]">
      {!user || isFirstTime ? (
        <FirstTimeFlow onComplete={handleFirstTimeComplete} db={db} />
      ) : (
        <SettingsPageWrapper settingsPage={<SettingsPage db={db} user={user} />}>
          <div className="p-4 bg-gray-100 min-h-screen">
            <Home db={db} user={user} />
          </div>
        </SettingsPageWrapper>
      )}
    </div>
  );
}

export default App;
