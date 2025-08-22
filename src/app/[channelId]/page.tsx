'use client';

import { useParams } from 'next/navigation';
import { useAppState } from '@/contexts/AppStateContext';
import { useEffect } from 'react';
import ChannelSidebar from '@/components/ChannelSidebar';
import NoteList from '@/components/NoteList';

export default function ChannelPage() {
  const params = useParams();
  const { selectChannel } = useAppState();
  
  const channelId = params.channelId as string;

  useEffect(() => {
    selectChannel(channelId);
  }, [channelId, selectChannel]);

  return (
    <div className="h-screen flex">
      <ChannelSidebar />
      <NoteList channelId={channelId} />
    </div>
  );
}