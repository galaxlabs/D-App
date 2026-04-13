import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { Users, Play, Check, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';

export default function QueueManager() {
  const [session, setSession] = useState<any>(null);
  const [socket, setSocket] = useState<any>(null);

  // Hardcoded for prototype: qr-2 is the Queue QR
  const qrId = 'qr-2';

  useEffect(() => {
    fetch(`/api/queue/${qrId}`)
      .then(res => res.json())
      .then(data => {
        if (!data.error) setSession(data);
      });

    const newSocket = io();
    setSocket(newSocket);

    newSocket.on('queue_updated', (data: any) => {
      if (session && data.sessionId === session.id) {
        setSession((prev: any) => ({ ...prev, tokens: data.tokens }));
      } else if (!session) {
        // If we didn't have session, fetch it again
        fetch(`/api/queue/${qrId}`).then(res => res.json()).then(d => {
          if (!d.error) setSession(d);
        });
      }
    });

    return () => newSocket.close();
  }, [qrId]);

  const handleCall = async (tokenId: string) => {
    await fetch(`/api/queue/token/${tokenId}/call`, { method: 'POST' });
  };

  const handleComplete = async (tokenId: string) => {
    await fetch(`/api/queue/token/${tokenId}/complete`, { method: 'POST' });
  };

  if (!session) return <div className="p-4 text-white max-w-md mx-auto">Loading Queue Session...</div>;

  const waitingTokens = session.tokens.filter((t: any) => t.status === 'WAITING');
  const calledTokens = session.tokens.filter((t: any) => t.status === 'CALLED');
  const completedTokens = session.tokens.filter((t: any) => t.status === 'COMPLETED');

  return (
    <div className="p-4 max-w-md mx-auto pb-24">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Queue Manager</h2>
          <p className="text-gray-400 text-sm mt-1">Manage tokens for Reception Queue</p>
        </div>
      </div>

      <div className="flex gap-3 mb-6 text-center">
        <div className="flex-1 bg-[#121212] px-4 py-3 rounded-xl border border-gray-800 shadow-sm">
          <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">Waiting</p>
          <p className="text-2xl font-bold text-white">{waitingTokens.length}</p>
        </div>
        <div className="flex-1 bg-[#121212] px-4 py-3 rounded-xl border border-gray-800 shadow-sm">
          <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">Total Issued</p>
          <p className="text-2xl font-bold text-white">{session.currentTokenNo}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Currently Serving */}
        <div className="bg-[#121212] rounded-2xl border border-gray-800 shadow-sm overflow-hidden flex flex-col">
          <div className="bg-[#1a1a1a] border-b border-gray-800 p-4 text-white flex items-center gap-2">
            <Play className="w-5 h-5 text-orange-500" />
            <h3 className="font-semibold">Currently Serving</h3>
          </div>
          <div className="p-6 flex-1 flex flex-col">
            {calledTokens.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                No token currently called
              </div>
            ) : (
              <div className="space-y-4">
                {calledTokens.map((token: any) => (
                  <div key={token.id} className="flex items-center justify-between p-4 bg-orange-500/10 border border-orange-500/30 rounded-xl">
                    <div>
                      <p className="text-sm text-orange-500 font-medium mb-1">Token Number</p>
                      <p className="text-4xl font-bold text-orange-400">{token.displayName}</p>
                    </div>
                    <button
                      onClick={() => handleComplete(token.id)}
                      className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors"
                    >
                      <Check className="w-5 h-5" />
                      Complete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Waiting List */}
        <div className="bg-[#121212] rounded-2xl border border-gray-800 shadow-sm overflow-hidden flex flex-col">
          <div className="bg-[#1a1a1a] p-4 border-b border-gray-800 flex items-center gap-2">
            <Users className="w-5 h-5 text-gray-400" />
            <h3 className="font-semibold text-white">Waiting List</h3>
          </div>
          <div className="p-0 flex-1 overflow-auto max-h-[500px]">
            {waitingTokens.length === 0 ? (
              <div className="p-8 text-center text-gray-500">Queue is empty</div>
            ) : (
              <div className="divide-y divide-gray-800">
                {waitingTokens.map((token: any) => (
                  <div key={token.id} className="flex items-center justify-between p-4 hover:bg-[#1a1a1a] transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-[#222] rounded-full flex items-center justify-center text-lg font-bold text-white">
                        {token.tokenNumber}
                      </div>
                      <div>
                        <p className="font-medium text-white">{token.displayName}</p>
                        <p className="text-sm text-gray-500">Waiting</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleCall(token.id)}
                      className="text-gray-300 hover:text-white hover:bg-[#222] px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1 transition-colors border border-gray-700"
                    >
                      Call Next
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
