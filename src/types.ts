export type UserSettings = {
  email: string;
  apiKey: string;
  pluginActive: boolean;
  transformerSelected: string;
  paragraphLimit: number;
  selectedModel: string;
  hoverToReveal: boolean; // Add this line
}

export type Transformer = {
    id: string;
    title: string;
    content: string;
    createdAt: number;
    updatedAt: number;
    authorId: string;
    // likesCount: number; // Remove this line
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
