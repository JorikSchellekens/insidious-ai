import { useState } from 'react';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { UserSettings } from '../types';

interface SecretKeyInputProps {
  db: IDBDatabase;
  userSettings: UserSettings;
  updateUserSettings: (newState: Partial<UserSettings>) => void;
}

export function SecretKeyInput({ userSettings, updateUserSettings }: SecretKeyInputProps) {
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  
  const validateApiKey = (key: string, model: string) => {
    if (model.startsWith('gpt-')) {
      return /^sk-[A-Za-z0-9]{48}$/.test(key);
    } else if (model.startsWith('claude-')) {
      return /^sk-ant-api\d{2}-.{32,100}$/.test(key);
    }
    return false;
  };

  const handleValidate = () => {
    if (validateApiKey(userSettings.apiKey, userSettings.selectedModel)) {
      updateUserSettings({ apiKey: userSettings.apiKey });
      setHasError(false);
      setErrorMessage("");
    } else {
      setHasError(true);
      setErrorMessage(`Invalid API key format for ${userSettings.selectedModel}`);
    }
  };

  const handleSubscribe = () => {
    // Open the subscription page in a new tab
    if (chrome && chrome.tabs) {
      chrome.tabs.create({ url: '/subscribe' });
    } else {
      window.open('/subscribe', '_blank');
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor="api-key">API Key</Label>
      <Input
        id="api-key"
        className={hasError ? "border-red-500" : ""}
        placeholder={userSettings.apiKey || "Enter your API key"}
        onChange={(e) => {
          updateUserSettings({ apiKey: e.currentTarget.value });
          setHasError(false);
          setErrorMessage("");
        }}
      />
      <Button onClick={handleValidate}>Validate</Button>
      {hasError && <p className="text-red-500">{errorMessage}</p>}
      
      {/* Updated subscription button */}
      <Button onClick={handleSubscribe}>Or Subscribe to use our API</Button>
    </div>
  );
}