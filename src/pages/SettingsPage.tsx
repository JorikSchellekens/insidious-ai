import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AI_PROVIDERS, DEFAULT_USER_SETTINGS } from '../constants';
import { Switch } from "@/components/ui/switch";
import { DBSchema } from '@/types';
import { InstantReactWeb, User, tx } from '@instantdb/react';

interface SettingsPageProps {
  db: InstantReactWeb<DBSchema>;
  user: User;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ db, user }) => {
  const { isLoading, error, data } = db.useQuery({ userSettings: {$: {where: {id: user.id}}}});
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  const userSettings = data.userSettings.length > 0 ? data.userSettings[0] : DEFAULT_USER_SETTINGS;
  const [localSettings, setLocalSettings] = useState(userSettings);

  useEffect(() => {
    setLocalSettings(userSettings);
  }, [userSettings]);

  const llmModels = AI_PROVIDERS ? Object.keys(AI_PROVIDERS).map(model => ({
    value: model,
    label: model
  })) : [];

  const handleSaveSettings = () => {
    db.transact(tx.userSettings[user.id].update(localSettings));
  };

  const handleChange = (field: string, value: string | number | boolean) => {
    const updatedSettings = {
      ...localSettings,
      [field]: value
    };
    setLocalSettings(updatedSettings);
  };

  if (!db) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-bold">Settings</h1>
      
      <div className="space-y-2">
        <Label htmlFor="llm-model">LLM Model</Label>
        <Select
          value={localSettings.selectedModel}
          onValueChange={(value) => handleChange('selectedModel', value)}
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
          value={localSettings.apiKey}
          onChange={(e) => handleChange('apiKey', e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="paragraphCount">Paragraph Count</Label>
        <Input
          id="paragraphCount"
          type="number"
          value={localSettings.paragraphLimit}
          onChange={(e) => handleChange('paragraphLimit', parseInt(e.target.value, 10))}
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="insidious-mode"
          checked={localSettings.pluginActive}
          onCheckedChange={(checked) => handleChange('pluginActive', checked)}
        />
        <Label htmlFor="insidious-mode">Enable InsidiousAI</Label>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="hover-to-reveal"
          checked={localSettings.hoverToReveal}
          onCheckedChange={(checked) => handleChange('hoverToReveal', checked)}
        />
        <Label htmlFor="hover-to-reveal">Hover to Reveal Original Content</Label>
      </div>

      <Button className="w-full" onClick={handleSaveSettings}>
        Save Settings
      </Button>
    </div>
  );
};

export default SettingsPage;