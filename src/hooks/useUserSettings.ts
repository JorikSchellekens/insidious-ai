import { useState, useEffect } from 'react';
import { UserSettings, DBSchema } from '../types';
import { InstantReactWeb, tx, User } from '@instantdb/react';

export const useUserSettings = (db: InstantReactWeb<DBSchema>) => {
  const [userSettings, setUserSettings] = useState<UserSettings>({
    email: '',
    selectedModel: '',
    apiKey: '',
    paragraphLimit: 1,
    pluginActive: false,
    promptSelected: 'mem',
    hoverToReveal: true,
  });

  const { isLoading, error, data } = db.useQuery({ userSettings: {} });

  useEffect(() => {
    if (!isLoading && !error && data && data.userSettings.length > 0) {
      setUserSettings(data.userSettings[0]);
    }
  }, [isLoading, error, data]);

  const updateUserSettings = async (newState: Partial<UserSettings>, user: User) => {
    const updatedSettings = { ...userSettings, ...newState };
      db.transact([
        tx.userSettings[user.id].merge(newState),
      ]);

    setUserSettings(updatedSettings);

    // Notify the service worker about the state update
    chrome.runtime.sendMessage({ type: 'userSettingsUpdated', state: updatedSettings });
  };

  const createUserSettings = async (user: User) => {
    const newSettings = {
      email: user.email,
      selectedModel: '',
      apiKey: '',
      paragraphLimit: 1,
      pluginActive: false,
      promptSelected: 'mem',
      hoverToReveal: true,
    };
    db.transact([
      tx.userSettings[user.id].update(newSettings),
    ]);
    setUserSettings(newSettings);
  };

  console.log('Current userSettings:', userSettings);
  return { userSettings, updateUserSettings, createUserSettings };
};