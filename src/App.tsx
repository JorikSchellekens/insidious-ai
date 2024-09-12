import { init, User, tx, id } from '@instantdb/react';
import { Home } from './pages/Home';
import SettingsPageWrapper from './components/SettingsPageWrapper';
import SettingsPage from './pages/SettingsPage';
import FirstTimeFlow from './components/FirstTimeFlow';
import { useLocalStorage } from "@uidotdev/usehooks";
import { DBSchema } from './types';

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
    <LoggedInApp user={user} />
  );
}

interface LoggedInAppProps {
  user: User;
}

function LoggedInApp({ user }: LoggedInAppProps) {

  const {isLoading: isLoadingUserSettings, data: userSettings, error: errorUserSettings} = db.useQuery({ userSettings: { $: { where: { id: user.id } } } });
  if (isLoadingUserSettings) return <div>Loading user settings...</div>
  if (errorUserSettings) return <div>Error loading user settings: {errorUserSettings.message}</div>
  if (!userSettings || userSettings.userSettings.length === 0) return <SettingsPage db={db} user={user} />

  
  return (
    <div className="min-w-[350px] min-h-[600px]">
        <SettingsPageWrapper settingsPage={<SettingsPage db={db} user={user} />}>
          <div className="p-4 bg-gray-100 min-h-screen">
            <Home db={db} user={user} />
          </div>
        </SettingsPageWrapper>
    </div>
  )
}

export default App;
