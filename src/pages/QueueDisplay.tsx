import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import { Ticket, Users, BellRing } from 'lucide-react';
import { cn } from '../lib/utils';

export default function QueueDisplay() {
  const { slug } = useParams();
  const [qr, setQr] = useState<any>(null);
  const [myToken, setMyToken] = useState<any>(null);
  const [sessionTokens, setSessionTokens] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/qr/${slug}`)
      .then(res => res.json())
      .then(data => {
        if (!data.error) setQr(data);
        setLoading(false);
      });

    const socket = io();
    socket.on('queue_updated', (data: any) => {
      setSessionTokens(data.tokens);
    });

    socket.on('queue_token_called', (token: any) => {
      // If it's my token, maybe vibrate or play sound
      if (myToken && token.id === myToken.id) {
        if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
      }
    });

    return () => socket.close();
  }, [slug, myToken]);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleGenerateToken = async () => {
    setErrorMsg(null);
    const res = await fetch(`/api/queue/${slug}/generate`, { method: 'POST' });
    const token = await res.json();
    if (!token.error) {
      setMyToken(token);
    } else {
      setErrorMsg(token.error);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] text-white">Loading...</div>;
  if (!qr) return <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] text-white">Invalid QR</div>;

  const calledTokens = sessionTokens.filter(t => t.status === 'CALLED');
  const waitingCount = sessionTokens.filter(t => t.status === 'WAITING').length;

  // Update myToken status if it changed in sessionTokens
  const currentMyToken = myToken ? sessionTokens.find(t => t.id === myToken.id) || myToken : null;

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#121212] rounded-3xl shadow-xl overflow-hidden border border-gray-800">
        
        <div className="bg-[#1a1a1a] p-8 text-center text-white relative overflow-hidden border-b border-gray-800">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-orange-500 via-transparent to-transparent"></div>
          <div className="relative z-10">
            <h1 className="text-2xl font-bold tracking-tight">{qr.name}</h1>
            <p className="text-gray-400 mt-1">Live Token Queue</p>
          </div>
        </div>

        <div className="p-8">
          {!currentMyToken ? (
            <div className="text-center space-y-6">
              <div className="w-24 h-24 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto">
                <Ticket className="w-10 h-10 text-orange-500" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Get Your Token</h2>
                <p className="text-gray-400 mt-2">Join the queue digitally. No app required.</p>
              </div>
              <button
                onClick={handleGenerateToken}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-xl font-bold text-lg transition-all shadow-md hover:shadow-lg"
              >
                Generate Token
              </button>
              {errorMsg && (
                <div className="p-4 bg-red-500/10 text-red-500 rounded-xl text-sm font-medium text-center border border-red-500/20">
                  {errorMsg}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-8">
              {/* My Token Display */}
              <div className={cn(
                "text-center p-8 rounded-2xl border-2 transition-all duration-500",
                currentMyToken.status === 'CALLED' 
                  ? "border-orange-500 bg-orange-500/10 shadow-[0_0_30px_rgba(249,115,22,0.2)]" 
                  : "border-gray-800 bg-[#1a1a1a]"
              )}>
                <p className={cn(
                  "text-sm font-bold uppercase tracking-widest mb-2",
                  currentMyToken.status === 'CALLED' ? "text-orange-500 animate-pulse" : "text-gray-500"
                )}>
                  {currentMyToken.status === 'CALLED' ? "It's Your Turn!" : "Your Token Number"}
                </p>
                <div className={cn(
                  "text-6xl font-black tracking-tighter",
                  currentMyToken.status === 'CALLED' ? "text-orange-400" : "text-white"
                )}>
                  {currentMyToken.displayName}
                </div>
              </div>

              {/* Live Status */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#1a1a1a] p-4 rounded-xl border border-gray-800 text-center">
                  <div className="flex items-center justify-center gap-2 text-gray-500 mb-1">
                    <BellRing className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase">Now Serving</span>
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {calledTokens.length > 0 ? calledTokens[0].displayName : '--'}
                  </div>
                </div>
                <div className="bg-[#1a1a1a] p-4 rounded-xl border border-gray-800 text-center">
                  <div className="flex items-center justify-center gap-2 text-gray-500 mb-1">
                    <Users className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase">Waiting</span>
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {waitingCount}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
