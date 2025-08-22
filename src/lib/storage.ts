import { AppState } from '@/types';

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
      content: 'Welcome to Channel Chat! 👋',
      author: 'System',
      createdAt: Date.now() - 1000,
    },
    {
      id: 'welcome-2',
      channelId: 'general',
      content: 'This is a Discord-style chat interface. Try typing a message below!',
      author: 'System',
      createdAt: Date.now(),
    }
  ],
  activeChannelId: 'general',
  currentUser: 'You',
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
    if (!state.channels || state.channels.length === 0) {
      state.channels = getDefaultState().channels;
    }
    
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