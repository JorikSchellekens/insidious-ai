export type UserSettings = {
  email: string;
  apiKey: string;
  pluginActive: boolean;
  transformersSelected: string[]; // Changed from transformerSelected to transformersSelected
  paragraphLimit: number;
  selectedModel: string;
  hoverToReveal: boolean;
}

export type Transformer = {
    id: string;
    title: string;
    content: string;
    createdAt: number;
    updatedAt: number;
    authorId: string;
    categories?: string[]; // Make sure this is included
};

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
