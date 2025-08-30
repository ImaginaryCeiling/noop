export type Channel = {
  id: string;
  name: string;
  description?: string;
  createdAt: number;
  updatedAt: number;
};

export type Message = {
  id: string;
  channelId: string;
  content: string;
  author: string;
  createdAt: number;
};

export type AppState = {
  channels: Channel[];
  messages: Message[];
  activeChannelId: string | null;
  currentUser: string;
  darkMode: boolean;
};