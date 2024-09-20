export type UserSettings = {
  email: string;
  apiKey: string;
  pluginActive: boolean;
  transformersSelected: string[]; // Changed from transformerSelected to transformersSelected
  paragraphLimit: number;
  selectedModel: string;
  hoverToReveal: boolean;
}

export interface Transformer {
  id: string;
  title: string;
  content: string;
  categories?: string[];
  createdAt: number;
  updatedAt: number;
  authorId: string;
}

export type DBSchema = {
  userSettings: UserSettings;
  transformers: Transformer;
  likes: {
    id: string;
    userId: string;
    transformerId: string;
    createdAt: number;
  };
  bookmarks: {
    id: string;
    userId: string;
    transformerId: string;
    createdAt: number;
  };
};
