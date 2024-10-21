export type UserSettings = {
  id: string;
  apiKey: string;
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

export type SubscriptionData = {
  id: string;
  stripeCustomerId: string;
  subscriptionStatus: string;
  cancelAt: string | null;
  updatedAt: number;
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
  subscriptionData: SubscriptionData;
};
