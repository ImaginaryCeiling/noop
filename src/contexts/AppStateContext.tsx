'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AppState, Channel, Message } from '@/types';
import { readState, writeState } from '@/lib/storage';
import { slugify, isValidChannelName } from '@/lib/utils';

interface AppStateContextType {
  state: AppState;
  // Channel operations
  createChannel: (name: string, description?: string) => string;
  updateChannel: (id: string, fields: Partial<Channel>) => void;
  deleteChannel: (id: string) => void;
  selectChannel: (id: string) => void;
  // Message operations
  sendMessage: (channelId: string, content: string) => string;
  deleteMessage: (id: string) => void;
  // Theme operations
  toggleDarkMode: () => void;
}

const AppStateContext = createContext<AppStateContextType | null>(null);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(() => readState());

  // Persist state changes to localStorage
  useEffect(() => {
    writeState(state);
  }, [state]);

  // Channel operations
  const createChannel = (name: string, description?: string): string => {
    const trimmedName = name.trim();
    
    if (!isValidChannelName(trimmedName)) {
      throw new Error('Invalid channel name. Use only letters, numbers, spaces, hyphens, and underscores.');
    }
    
    const baseId = slugify(trimmedName);
    
    // Check if channel ID already exists and add number suffix if needed
    let id = baseId;
    let counter = 1;
    while (state.channels.some(c => c.id === id)) {
      id = `${baseId}-${counter}`;
      counter++;
    }
    
    const now = Date.now();
    
    const newChannel: Channel = {
      id,
      name: trimmedName,
      description,
      createdAt: now,
      updatedAt: now,
    };

    setState(prev => ({
      ...prev,
      channels: [...prev.channels, newChannel],
      activeChannelId: id,
    }));

    return id;
  };

  const updateChannel = (id: string, fields: Partial<Channel>): void => {
    setState(prev => ({
      ...prev,
      channels: prev.channels.map(channel =>
        channel.id === id
          ? { ...channel, ...fields, updatedAt: Date.now() }
          : channel
      ),
    }));
  };

  const deleteChannel = (id: string): void => {
    setState(prev => {
      const newChannels = prev.channels.filter(c => c.id !== id);
      const newMessages = prev.messages.filter(m => m.channelId !== id);
      
      return {
        ...prev,
        channels: newChannels,
        messages: newMessages,
        activeChannelId: prev.activeChannelId === id 
          ? (newChannels[0]?.id || null) 
          : prev.activeChannelId,
      };
    });
  };

  const selectChannel = useCallback((id: string): void => {
    setState(prev => ({
      ...prev,
      activeChannelId: id,
    }));
  }, []);

  // Message operations
  const sendMessage = useCallback((channelId: string, content: string): string => {
    const id = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const now = Date.now();
    
    setState(prev => {
      const newMessage: Message = {
        id,
        channelId,
        content: content.trim(),
        author: prev.currentUser,
        createdAt: now,
      };

      return {
        ...prev,
        messages: [...prev.messages, newMessage],
      };
    });

    return id;
  }, []);

  const deleteMessage = useCallback((id: string): void => {
    setState(prev => ({
      ...prev,
      messages: prev.messages.filter(m => m.id !== id),
    }));
  }, []);

  // Theme operations
  const toggleDarkMode = useCallback((): void => {
    setState(prev => ({
      ...prev,
      darkMode: !prev.darkMode,
    }));
  }, []);

  const value: AppStateContextType = {
    state,
    createChannel,
    updateChannel,
    deleteChannel,
    selectChannel,
    sendMessage,
    deleteMessage,
    toggleDarkMode,
  };

  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
}