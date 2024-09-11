export type PluginState = {
  apiKey: string;
  pluginActive: boolean;
  promptSelected: string;
  paragraphLimit: number;
  id: string;
  selectedModel: string;
  hoverToReveal: boolean; // Add this line
}

export type Prompt = {
  id: string;
  title: string;
  prompt: string;
}