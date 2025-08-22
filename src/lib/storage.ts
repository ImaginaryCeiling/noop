import { AppState } from '@/types';

const STORAGE_KEY = 'channel-notes-app-state';

const getDefaultState = (): AppState => ({
  channels: [
    {
      id: 'general',
      name: 'general',
      description: 'Default channel for getting started',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
  ],
  notes: [],
  activeChannelId: 'general',
  activeNoteId: null,
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
    if (!state.notes) state.notes = [];
    if (!state.activeNoteId) state.activeNoteId = null;
    
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