import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { formatDistanceToNow } from 'date-fns';
import { BellRing, CheckCircle2, Clock, MessageSquare, MapPin, UserPlus, Reply, Settings, Share2, Copy, Maximize2, Plus, ScanLine, Activity, Users, User, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { Link, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';

interface Interaction {
  id: string;
  qrId: string;
  qrName: string;
  visitorName: string;
  purpose: string;
  location?: { lat: number, lng: number };
  customData?: Record<string, string>;
  status: 'NEW' | 'HANDLED';
  createdAt: string;
  handledAt?: string;
  reply?: string;
  repliedAt?: string;
}

const QUICK_REPLIES = [
  "I'm coming right now.",
  "Please leave it at the door.",
  "Give me 5 minutes.",
  "I'm not available right now."
];

export default function Home() {
  const navigate = useNavigate();
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [qrs, setQrs] = useState<any[]>([]);
  const [selectedQrId, setSelectedQrId] = useState<string | null>(null);
  const [socket, setSocket] = useState<any>(null);
  const [showQrExpanded, setShowQrExpanded] = useState(false);
  const [showSeasonalForm, setShowSeasonalForm] = useState(false);
  const [seasonalFormData, setSeasonalFormData] = useState({
    name: '',
    seasonType: 'Hajj',
    validFrom: '',
    validUntil: ''
  });

  const fetchQrs = () => {
    fetch('/api/qrs')
      .then(res => res.json())
      .then(data => {
        setQrs(data);
        if (data.length > 0 && !selectedQrId) {
          setSelectedQrId(data[0].id);
        }
      });
  };

  useEffect(() => {
    // Fetch initial data
    fetch('/api/interactions')
      .then(res => res.json())
      .then(data => setInteractions(data));

    fetchQrs();

    // Setup WebSocket
    const newSocket = io();
    setSocket(newSocket);

    newSocket.on('visitor_arrived', (interaction: Interaction) => {
      setInteractions(prev => [interaction, ...prev]);
    });

    newSocket.on('interaction_updated', (updated: Interaction) => {
      setInteractions(prev => prev.map(i => i.id === updated.id ? updated : i));
    });

    return () => {
      newSocket.close();
    };
  }, []);

  const handleMarkDone = async (id: string) => {
    await fetch(`/api/interactions/${id}/handle`, { method: 'POST' });
  };

  const handleSaveContact = async (name: string) => {
    await fetch('/api/contacts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, note: 'Added from inbox' })
    });
    alert(`${name} saved to contacts!`);
  };

  const handleQuickReply = async (id: string, reply: string) => {
    await fetch(`/api/interactions/${id}/reply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reply })
    });
  };

  const handleCreateSeasonalDoor = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: seasonalFormData.name,
      mode: 'BELL',
      isSeasonal: true,
      seasonType: seasonalFormData.seasonType,
      validFrom: seasonalFormData.validFrom,
      validUntil: seasonalFormData.validUntil
    };

    const res = await fetch('/api/qrs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    if (res.ok) {
      const newQr = await res.json();
      setShowSeasonalForm(false);
      setSeasonalFormData({ name: '', seasonType: 'Hajj', validFrom: '', validUntil: '' });
      fetchQrs();
      setSelectedQrId(newQr.id);
    }
  };

  const selectedQr = qrs.find(q => q.id === selectedQrId);
  const seasonalDoors = qrs.filter(q => q.isSeasonal);
  const selectedQrUrl = selectedQr ? `${window.location.origin}/scan/${selectedQr.slug}` : '';

  const handleCopyLink = () => {
    if (selectedQrUrl) {
      navigator.clipboard.writeText(selectedQrUrl);
      alert('Link copied to clipboard!');
    }
  };

  // Stats
  const totalInteractions = interactions.length;
  const answeredInteractions = interactions.filter(i => i.status === 'HANDLED').length;
  const missedInteractions = interactions.filter(i => i.status === 'NEW').length; // Assuming NEW means missed/unhandled for now

  return (
    <div className="p-4 max-w-md mx-auto pb-24 space-y-8">
      
      {/* Seasonal Doors */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Seasonal Doors</h3>
          <button 
            onClick={() => setShowSeasonalForm(true)}
            className="text-xs font-medium text-orange-500 hover:text-orange-400 flex items-center gap-1"
          >
            <Plus className="w-3 h-3" /> Create New
          </button>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {seasonalDoors.length === 0 ? (
            <div className="shrink-0 bg-[#121212] border border-gray-800 border-dashed rounded-xl p-4 w-40 flex flex-col items-center justify-center text-center">
              <p className="text-xs text-gray-500">No seasonal doors.</p>
              <button onClick={() => setShowSeasonalForm(true)} className="text-xs text-orange-500 mt-1">Create one</button>
            </div>
          ) : (
            seasonalDoors.map((door) => (
              <div 
                key={door.id} 
                onClick={() => setSelectedQrId(door.id)}
                className={cn(
                  "shrink-0 rounded-xl p-4 w-40 flex flex-col justify-between cursor-pointer transition-all",
                  selectedQrId === door.id 
                    ? "bg-gradient-to-br from-orange-500/20 to-purple-500/20 border border-orange-500/50" 
                    : "bg-[#121212] border border-gray-800 hover:border-gray-700"
                )}
              >
                <div className="w-8 h-8 bg-orange-500/20 rounded-full flex items-center justify-center mb-3">
                  <MapPin className="w-4 h-4 text-orange-400" />
                </div>
                <p className="text-sm font-bold text-white leading-tight truncate">{door.name}</p>
                <p className="text-[10px] text-gray-400 mt-1">{door.seasonType}</p>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Selected Door Big Card */}
      <section>
        {selectedQr ? (
          <div className="bg-[#121212] rounded-3xl border border-gray-800 p-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-bl-full -z-0"></div>
            
            <div className="relative z-10 flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white">{selectedQr.name}</h2>
                <p className="text-sm text-orange-400 font-medium mt-1">{selectedQr.mode.replace('_', ' ')}</p>
              </div>
              <button onClick={() => navigate(`/doors/${selectedQr.id}/settings`)} className="p-2 bg-[#1a1a1a] rounded-full text-gray-400 hover:text-white transition-colors">
                <Settings className="w-5 h-5" />
              </button>
            </div>

            <div className="relative z-10 flex items-center gap-4 mb-6">
              <div className="bg-[#1a1a1a] p-3 rounded-2xl border border-gray-800">
                <QRCodeSVG value={selectedQrUrl} size={64} level="H" includeMargin={false} className="bg-white p-1 rounded-lg" />
              </div>
              <div>
                <p className="text-3xl font-bold text-white">{selectedQr.currentVisitors}</p>
                <p className="text-xs text-gray-400 uppercase tracking-wider">Rings Today</p>
              </div>
            </div>

            <div className="relative z-10 flex gap-2">
              <button className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-colors">
                <Share2 className="w-4 h-4" /> Share
              </button>
              <button onClick={handleCopyLink} className="flex-1 bg-[#1a1a1a] border border-gray-700 hover:bg-[#222] text-white py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-colors">
                <Copy className="w-4 h-4" /> Copy Link
              </button>
              <button onClick={() => setShowQrExpanded(true)} className="px-4 bg-[#1a1a1a] border border-gray-700 hover:bg-[#222] text-white py-2.5 rounded-xl text-sm font-medium flex items-center justify-center transition-colors">
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-[#121212] rounded-3xl border border-gray-800 p-8 text-center">
            <p className="text-gray-500">No doors available. Create one to get started.</p>
          </div>
        )}

        {/* Door Selector */}
        {qrs.length > 0 && (
          <div className="flex gap-2 overflow-x-auto py-4 scrollbar-hide">
            {qrs.map(qr => (
              <button
                key={qr.id}
                onClick={() => setSelectedQrId(qr.id)}
                className={cn(
                  "shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all border",
                  selectedQrId === qr.id 
                    ? "bg-orange-500/20 border-orange-500/50 text-orange-400" 
                    : "bg-[#1a1a1a] border-gray-800 text-gray-400 hover:border-gray-700"
                )}
              >
                {qr.name}
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Action Buttons */}
      <section className="grid grid-cols-4 gap-3">
        <button className="flex flex-col items-center justify-center gap-2 p-3 bg-transparent border border-gray-800 rounded-2xl hover:bg-[#1a1a1a] transition-colors">
          <Share2 className="w-6 h-6 text-blue-400" />
          <span className="text-[10px] font-medium text-gray-300 text-center leading-tight">Share QR</span>
        </button>
        <button onClick={() => navigate('/doors/add')} className="flex flex-col items-center justify-center gap-2 p-3 bg-transparent border border-gray-800 rounded-2xl hover:bg-[#1a1a1a] transition-colors">
          <Plus className="w-6 h-6 text-green-400" />
          <span className="text-[10px] font-medium text-gray-300 text-center leading-tight">Add Door</span>
        </button>
        <button onClick={() => navigate('/doors/join')} className="flex flex-col items-center justify-center gap-2 p-3 bg-transparent border border-gray-800 rounded-2xl hover:bg-[#1a1a1a] transition-colors">
          <ScanLine className="w-6 h-6 text-purple-400" />
          <span className="text-[10px] font-medium text-gray-300 text-center leading-tight">Scan QR</span>
        </button>
        <button className="flex flex-col items-center justify-center gap-2 p-3 bg-transparent border border-gray-800 rounded-2xl hover:bg-[#1a1a1a] transition-colors">
          <Activity className="w-6 h-6 text-orange-400" />
          <span className="text-[10px] font-medium text-gray-300 text-center leading-tight">Activity</span>
        </button>
      </section>

      {/* Stats Cards */}
      <section className="grid grid-cols-3 gap-3">
        <div className="bg-[#121212] border border-gray-800 rounded-2xl p-4 text-center">
          <p className="text-2xl font-bold text-white">{totalInteractions}</p>
          <p className="text-[10px] text-gray-500 uppercase tracking-wider mt-1">Total</p>
        </div>
        <div className="bg-[#121212] border border-gray-800 rounded-2xl p-4 text-center">
          <p className="text-2xl font-bold text-green-500">{answeredInteractions}</p>
          <p className="text-[10px] text-gray-500 uppercase tracking-wider mt-1">Answered</p>
        </div>
        <div className="bg-[#121212] border border-gray-800 rounded-2xl p-4 text-center">
          <p className="text-2xl font-bold text-red-500">{missedInteractions}</p>
          <p className="text-[10px] text-gray-500 uppercase tracking-wider mt-1">Missed</p>
        </div>
      </section>

      {/* Recent Visitors */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white">Recent Visitors</h3>
          <div className="bg-orange-500/10 text-orange-500 px-2 py-1 rounded-md text-[10px] font-bold uppercase flex items-center gap-1.5">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-orange-500"></span>
            </span>
            Live
          </div>
        </div>
        
        <div className="space-y-3">
          {interactions.length === 0 ? (
            <div className="text-center py-8 bg-[#121212] rounded-2xl border border-gray-800">
              <BellRing className="w-8 h-8 text-gray-700 mx-auto mb-3" />
              <p className="text-sm text-gray-500">No visitors yet</p>
            </div>
          ) : (
            interactions.slice(0, 5).map((interaction) => (
              <div 
                key={interaction.id} 
                className={cn(
                  "bg-[#121212] p-4 rounded-2xl border transition-all duration-200",
                  interaction.status === 'NEW' 
                    ? "border-orange-500/30 shadow-md ring-1 ring-orange-500/10" 
                    : "border-gray-800 opacity-75"
                )}
              >
                <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                  <div className="flex gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                      interaction.status === 'NEW' ? "bg-orange-500/20 text-orange-500" : "bg-gray-800 text-gray-500"
                    )}>
                      {interaction.status === 'NEW' ? <BellRing className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="text-sm font-semibold text-white">{interaction.visitorName}</h3>
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-medium bg-gray-800 text-gray-300">
                          {interaction.qrName}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 flex items-center gap-1.5">
                        <MessageSquare className="w-3 h-3" />
                        {interaction.purpose || 'No purpose provided'}
                      </p>
                      {interaction.customData && Object.entries(interaction.customData).length > 0 && (
                        <div className="mt-2 space-y-1">
                          {Object.entries(interaction.customData).map(([key, value]) => {
                            const qr = qrs.find(q => q.id === interaction.qrId);
                            const fieldLabel = qr?.customFields?.find((f: any) => f.id === key)?.label || key;
                            return (
                              <p key={key} className="text-[10px] text-gray-400">
                                <span className="font-medium text-gray-300">{fieldLabel}:</span> {value}
                              </p>
                            );
                          })}
                        </div>
                      )}
                      <p className="text-[10px] text-gray-500 flex items-center gap-1 mt-1.5">
                        <Clock className="w-3 h-3" />
                        {formatDistanceToNow(new Date(interaction.createdAt), { addSuffix: true })}
                      </p>
                      {interaction.reply && (
                        <div className="mt-2 bg-blue-500/10 border border-blue-500/20 p-2 rounded-lg">
                          <p className="text-[10px] font-semibold text-blue-400 mb-0.5 flex items-center gap-1">
                            <Reply className="w-3 h-3" /> You replied:
                          </p>
                          <p className="text-xs text-blue-100">{interaction.reply}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-row sm:flex-col gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                    {interaction.status === 'NEW' && (
                      <button
                        onClick={() => handleMarkDone(interaction.id)}
                        className="flex-1 sm:flex-none bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                      >
                        Handled
                      </button>
                    )}
                  </div>
                </div>

                {/* Quick Replies Section */}
                {interaction.status === 'NEW' && !interaction.reply && (
                  <div className="mt-3 pt-3 border-t border-gray-800">
                    <div className="flex flex-wrap gap-1.5">
                      {QUICK_REPLIES.map((reply, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleQuickReply(interaction.id, reply)}
                          className="bg-[#1a1a1a] hover:bg-[#222] border border-gray-700 text-gray-300 text-[10px] px-2 py-1 rounded-md transition-colors"
                        >
                          {reply}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </section>

      {/* Family and Members */}
      <section>
        <h3 className="text-lg font-bold text-white mb-4">Family & Members</h3>
        <div className="bg-[#121212] border border-gray-800 rounded-2xl p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-gray-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">You</p>
                <span className="text-[10px] bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Owner</span>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-4 flex gap-3">
            <button className="flex-1 bg-transparent border border-gray-700 hover:bg-[#1a1a1a] text-white py-2.5 rounded-xl text-sm font-medium transition-colors">
              Add Option
            </button>
            <button className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2.5 rounded-xl text-sm font-medium transition-colors">
              Invite
            </button>
          </div>
        </div>
      </section>

      {/* Coming Soon */}
      <section className="text-center py-8">
        <div className="inline-block bg-gray-800/50 border border-gray-700/50 px-4 py-2 rounded-full">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">More Features Coming Soon</p>
        </div>
      </section>

      {/* Expanded QR Modal */}
      {showQrExpanded && selectedQr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setShowQrExpanded(false)}>
          <div className="bg-[#121212] p-8 rounded-3xl border border-gray-800 max-w-sm w-full text-center" onClick={e => e.stopPropagation()}>
            <h2 className="text-2xl font-bold text-white mb-2">{selectedQr.name}</h2>
            <p className="text-gray-400 mb-8">Scan to interact</p>
            <div className="bg-white p-4 rounded-2xl inline-block mb-8">
              <QRCodeSVG value={selectedQrUrl} size={200} level="H" includeMargin={false} />
            </div>
            <button 
              onClick={() => setShowQrExpanded(false)}
              className="w-full bg-[#1a1a1a] border border-gray-700 hover:bg-[#222] text-white py-3 rounded-xl font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Create Seasonal Door Modal */}
      {showSeasonalForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setShowSeasonalForm(false)}>
          <div className="bg-[#121212] p-6 rounded-3xl border border-gray-800 max-w-sm w-full" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Create Seasonal Door</h2>
              <button onClick={() => setShowSeasonalForm(false)} className="text-gray-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreateSeasonalDoor} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Door Name</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-700 bg-[#1a1a1a] text-white focus:ring-2 focus:ring-orange-500 outline-none"
                  placeholder="e.g. Hajj Camp 2026"
                  value={seasonalFormData.name}
                  onChange={e => setSeasonalFormData({...seasonalFormData, name: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Event Type</label>
                <select
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-700 bg-[#1a1a1a] text-white focus:ring-2 focus:ring-orange-500 outline-none"
                  value={seasonalFormData.seasonType}
                  onChange={e => setSeasonalFormData({...seasonalFormData, seasonType: e.target.value})}
                >
                  <option value="Hajj">Hajj</option>
                  <option value="Exhibition">Exhibition</option>
                  <option value="Ijtima">Ijtima</option>
                  <option value="Global Event">Global Event</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Start Date</label>
                  <input
                    type="datetime-local"
                    required
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-700 bg-[#1a1a1a] text-white focus:ring-2 focus:ring-orange-500 outline-none text-sm"
                    value={seasonalFormData.validFrom}
                    onChange={e => setSeasonalFormData({...seasonalFormData, validFrom: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">End Date</label>
                  <input
                    type="datetime-local"
                    required
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-700 bg-[#1a1a1a] text-white focus:ring-2 focus:ring-orange-500 outline-none text-sm"
                    value={seasonalFormData.validUntil}
                    onChange={e => setSeasonalFormData({...seasonalFormData, validUntil: e.target.value})}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-bold transition-colors mt-6"
              >
                Create Door
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
