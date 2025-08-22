export type Channel = {
  id: string;
  name: string;
  description?: string;
  createdAt: number;
  updatedAt: number;
};

export type Note = {
  id: string;
  channelId: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
};

export type AppState = {
  channels: Channel[];
  notes: Note[];
  activeChannelId: string | null;
  activeNoteId: string | null;
};