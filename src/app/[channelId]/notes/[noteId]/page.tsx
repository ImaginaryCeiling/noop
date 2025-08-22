'use client';

import { useParams } from 'next/navigation';
import { useAppState } from '@/contexts/AppStateContext';
import { useEffect } from 'react';
import ChannelSidebar from '@/components/ChannelSidebar';
import NoteEditor from '@/components/NoteEditor';

export default function NotePage() {
  const params = useParams();
  const { selectNote } = useAppState();
  
  const channelId = params.channelId as string;
  const noteId = params.noteId as string;

  useEffect(() => {
    selectNote(noteId);
  }, [noteId, selectNote]);

  return (
    <div className="h-screen flex">
      <ChannelSidebar />
      <NoteEditor channelId={channelId} noteId={noteId} />
    </div>
  );
}