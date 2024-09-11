export type PluginState = {
  apiKey: string;
  pluginActive: boolean;
  promptSelected: number;
  paragraphLimit: number;
  id: string;
  selectedModel: string;
}

export type Prompt = {
  id: number;
  title: string;
  prompt: string;
}