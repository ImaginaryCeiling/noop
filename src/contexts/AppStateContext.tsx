'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppState, Channel, Note } from '@/types';
import { readState, writeState } from '@/lib/storage';

interface AppStateContextType {
  state: AppState;
  // Channel operations
  createChannel: (name: string, description?: string) => string;
  updateChannel: (id: string, fields: Partial<Channel>) => void;
  deleteChannel: (id: string) => void;
  selectChannel: (id: string) => void;
  // Note operations
  createNote: (channelId: string, title?: string) => string;
  updateNote: (id: string, fields: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  selectNote: (id: string) => void;
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
    const id = `channel-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const now = Date.now();
    
    const newChannel: Channel = {
      id,
      name,
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
      const newNotes = prev.notes.filter(n => n.channelId !== id);
      
      return {
        ...prev,
        channels: newChannels,
        notes: newNotes,
        activeChannelId: prev.activeChannelId === id 
          ? (newChannels[0]?.id || null) 
          : prev.activeChannelId,
        activeNoteId: prev.notes.find(n => n.id === prev.activeNoteId)?.channelId === id
          ? null
          : prev.activeNoteId,
      };
    });
  };

  const selectChannel = (id: string): void => {
    setState(prev => ({
      ...prev,
      activeChannelId: id,
      activeNoteId: null, // Clear active note when switching channels
    }));
  };

  // Note operations
  const createNote = (channelId: string, title?: string): string => {
    const id = `note-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const now = Date.now();
    
    const newNote: Note = {
      id,
      channelId,
      title: title || 'Untitled Note',
      content: '',
      createdAt: now,
      updatedAt: now,
    };

    setState(prev => ({
      ...prev,
      notes: [...prev.notes, newNote],
      activeNoteId: id,
    }));

    return id;
  };

  const updateNote = (id: string, fields: Partial<Note>): void => {
    setState(prev => ({
      ...prev,
      notes: prev.notes.map(note =>
        note.id === id
          ? { ...note, ...fields, updatedAt: Date.now() }
          : note
      ),
    }));
  };

  const deleteNote = (id: string): void => {
    setState(prev => ({
      ...prev,
      notes: prev.notes.filter(n => n.id !== id),
      activeNoteId: prev.activeNoteId === id ? null : prev.activeNoteId,
    }));
  };

  const selectNote = (id: string): void => {
    setState(prev => ({
      ...prev,
      activeNoteId: id,
    }));
  };

  const value: AppStateContextType = {
    state,
    createChannel,
    updateChannel,
    deleteChannel,
    selectChannel,
    createNote,
    updateNote,
    deleteNote,
    selectNote,
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