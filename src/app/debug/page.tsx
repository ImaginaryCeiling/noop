'use client';

import { useAppState } from '@/contexts/AppStateContext';

export default function DebugPage() {
  const { state, sendMessage } = useAppState();

  const testSendMessage = () => {
    sendMessage('general', 'Test message from debug page');
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Debug Page</h1>
      
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Current State:</h2>
        <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
          {JSON.stringify(state, null, 2)}
        </pre>
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Channels:</h2>
        <ul>
          {state.channels.map(channel => (
            <li key={channel.id} className="mb-1">
              <strong>{channel.name}</strong> (id: {channel.id})
            </li>
          ))}
        </ul>
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Messages:</h2>
        <ul>
          {state.messages.map(message => (
            <li key={message.id} className="mb-2 p-2 bg-gray-50 rounded">
              <div><strong>Channel:</strong> {message.channelId}</div>
              <div><strong>Author:</strong> {message.author}</div>
              <div><strong>Content:</strong> {message.content}</div>
              <div><strong>Time:</strong> {new Date(message.createdAt).toLocaleString()}</div>
            </li>
          ))}
        </ul>
      </div>

      <button
        onClick={testSendMessage}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Send Test Message to General
      </button>
    </div>
  );
}