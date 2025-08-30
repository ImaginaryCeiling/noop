import { AppState } from '@/types';
import { slugify } from './utils';

const STORAGE_KEY = 'channel-chat-app-state';

const getDefaultState = (): AppState => ({
  channels: [
    {
      id: 'general',
      name: 'general',
      description: 'General discussion',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    {
      id: 'random',
      name: 'random',
      description: 'Random conversations',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
  ],
  messages: [
    {
      id: 'welcome-1',
      channelId: 'general',
      content: 'Welcome to Channel Notes! 👋',
      author: 'System',
      createdAt: Date.now() - 1000,
    },
    {
      id: 'welcome-2',
      channelId: 'general',
      content: 'This is a Discord-style note-taking interface. Try typing a message below!',
      author: 'System',
      createdAt: Date.now(),
    }
  ],
  activeChannelId: 'general',
  currentUser: 'You',
  darkMode: true,
});

export const readState = (): AppState => {
  if (typeof window === 'undefined') {
    return getDefaultState();
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    
    if (!stored) {
      return getDefaultState();
    }

    const state = JSON.parse(stored) as AppState;
    
    // Migration for existing users
    if (!state.messages) state.messages = [];
    if (!state.currentUser) state.currentUser = 'You';
    if (state.darkMode === undefined) state.darkMode = true;
    if (!state.channels || state.channels.length === 0) {
      state.channels = getDefaultState().channels;
    }

    // Migrate channels with UUID IDs to name-based IDs
    const channelIdMigrationMap = new Map<string, string>();
    const migratedChannels = state.channels.map(channel => {
      // Check if channel ID looks like a UUID (contains hyphens and long strings)
      if (channel.id.includes('channel-') || channel.id.length > 20) {
        const newId = slugify(channel.name);
        let uniqueId = newId;
        let counter = 1;
        
        // Ensure uniqueness
        while (state.channels.some(c => c.id === uniqueId && c.id !== channel.id)) {
          uniqueId = `${newId}-${counter}`;
          counter++;
        }
        
        channelIdMigrationMap.set(channel.id, uniqueId);
        return { ...channel, id: uniqueId };
      }
      return channel;
    });

    // Update messages to use new channel IDs
    const migratedMessages = state.messages.map(message => {
      const newChannelId = channelIdMigrationMap.get(message.channelId);
      return newChannelId ? { ...message, channelId: newChannelId } : message;
    });

    // Update active channel ID
    const newActiveChannelId = channelIdMigrationMap.get(state.activeChannelId || '') || state.activeChannelId;

    state.channels = migratedChannels;
    state.messages = migratedMessages;
    state.activeChannelId = newActiveChannelId;
    
    return state;
  } catch (error) {
    console.error('Failed to read state from localStorage:', error);
    return getDefaultState();
  }
};

export const writeState = (state: AppState): void => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Failed to write state to localStorage:', error);
  }
};