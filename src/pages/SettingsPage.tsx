import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AI_PROVIDERS } from '../constants';
import { usePluginState } from '../hooks/usePluginState';
import { useLocalStorage } from "@uidotdev/usehooks";
import { Switch } from "@/components/ui/switch";

interface SettingsPageProps {
  db: IDBDatabase;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ db }) => {
  const [enabled, setEnabled] = useLocalStorage("enabled", true);
  const { pluginState, updatePluginState } = usePluginState(db);
  const [secretKey, setSecretKey] = useState('');

  const llmModels = AI_PROVIDERS ? Object.keys(AI_PROVIDERS).map(model => ({
    value: model,
    label: model
  })) : [];

  useEffect(() => {
    setSecretKey(pluginState.apiKey || '');
  }, [pluginState.apiKey]);

  const handleSaveSettings = () => {
    updatePluginState({
      selectedModel: pluginState.selectedModel,
      apiKey: secretKey
    });
    console.log('Settings saved', { model: pluginState.selectedModel, secretKey });
  };

  const handleToggle = (checked: boolean) => {
    setEnabled(checked);
    updatePluginState({ pluginActive: checked });
  };

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-bold">Settings</h1>
      
      <div className="space-y-2">
        <Label htmlFor="llm-model">LLM Model</Label>
        <Select
          value={pluginState.selectedModel}
          onValueChange={(value) => updatePluginState({ selectedModel: value })}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select LLM model..." />
          </SelectTrigger>
          <SelectContent>
            {llmModels.map((model) => (
              <SelectItem key={model.value} value={model.value}>
                {model.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="secret-key">Secret Key</Label>
        <Input
          id="secret-key"
          type="password"
          placeholder="Enter your secret key"
          value={secretKey}
          onChange={(e) => setSecretKey(e.target.value)}
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="insidious-mode"
          checked={enabled}
          onCheckedChange={handleToggle}
        />
        <Label htmlFor="insidious-mode">Enable InsidiousAI</Label>
      </div>

      <Button className="w-full" onClick={handleSaveSettings}>
        Save Settings
      </Button>
    </div>
  );
};

export default SettingsPage;