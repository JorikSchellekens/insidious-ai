export type UserSettings = {
  id: string; // This should already be the user's ID
  apiKey: string;
  isSubscribed: boolean;
  pluginActive: boolean;
  transformersSelected: string[];
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
