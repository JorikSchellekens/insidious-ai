import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AI_PROVIDERS } from '../constants';
import { usePluginState } from '../hooks/usePluginState';
import { Switch } from "@/components/ui/switch";

interface SettingsPageProps {
  db: IDBDatabase | null;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ db }) => {
  const { pluginState, updatePluginState } = usePluginState(db);
  const [localSettings, setLocalSettings] = useState(pluginState);

  useEffect(() => {
    console.log('SettingsPage: pluginState updated:', pluginState);
    setLocalSettings(pluginState);
  }, [pluginState]);

  const llmModels = AI_PROVIDERS ? Object.keys(AI_PROVIDERS).map(model => ({
    value: model,
    label: model
  })) : [];

  console.log('SettingsPage: Current localSettings:', localSettings);
  console.log('SettingsPage: Available LLM models:', llmModels);

  useEffect(() => {
    // Update local settings when pluginState changes
    setLocalSettings({
      selectedModel: pluginState.selectedModel || '',
      apiKey: pluginState.apiKey || '',
      paragraphLimit: pluginState.paragraphLimit || 1,
      pluginActive: pluginState.pluginActive || false,
      promptSelected: pluginState.promptSelected || '',
      id: pluginState.id || '',
      hoverToReveal: pluginState.hoverToReveal ?? true, // Add this line
    });
  }, [pluginState]);

  const handleSaveSettings = () => {
    console.log('Saving settings:', localSettings);
    updatePluginState(localSettings);
    console.log('Settings saved', { ...localSettings, apiKey: '******' });
  };

  const handleChange = (field: string, value: string | number | boolean) => {
    const updatedSettings = {
      ...localSettings,
      [field]: value
    };
    console.log(`SettingsPage: Updating ${field}:`, value);
    setLocalSettings(updatedSettings);
  };

  if (!db) {
    console.log('SettingsPage: Database not initialized');
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