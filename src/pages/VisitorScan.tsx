import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { QrCode, Send, CheckCircle2, MapPin, MessageSquare } from 'lucide-react';
import { io } from 'socket.io-client';

export default function VisitorScan() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [qr, setQr] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [interactionId, setInteractionId] = useState<string | null>(null);
  const [reply, setReply] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    visitorName: '',
    purpose: '',
    customData: {} as Record<string, string>
  });

  useEffect(() => {
    fetch(`/api/qr/${slug}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setQr(null);
        } else {
          setQr(data);
          // If it's a queue QR, redirect to queue display
          if (data.mode === 'QUEUE') {
            navigate(`/queue-display/${slug}`);
          }
        }
        setLoading(false);
      });
  }, [slug, navigate]);

  useEffect(() => {
    let socket: any;
    if (submitted && interactionId) {
      socket = io();
      socket.on('interaction_updated', (updated: any) => {
        if (updated.id === interactionId && updated.reply) {
          setReply(updated.reply);
        }
      });
    }
    return () => {
      if (socket) socket.close();
    };
  }, [submitted, interactionId]);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [locating, setLocating] = useState(false);

  const handleGetLocation = () => {
    setLocating(true);
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      setLocating(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
      },
      (err) => {
        console.error(err);
        alert("Could not get location. Please enable permissions.");
        setLocating(false);
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);

    const res = await fetch(`/api/interactions/${slug}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        visitorName: formData.visitorName,
        purpose: formData.purpose,
        customData: formData.customData,
        location 
      })
    });

    const data = await res.json();
    setSubmitting(false);

    if (data.error) {
      setErrorMsg(data.error);
    } else {
      setInteractionId(data.id);
      setSubmitted(true);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] text-white">Loading...</div>;
  }

  if (!qr) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] p-4">
        <div className="bg-[#121212] p-8 rounded-2xl shadow-sm border border-gray-800 text-center max-w-md w-full">
          <QrCode className="w-16 h-16 text-gray-700 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white">Invalid QR Code</h2>
          <p className="text-gray-500 mt-2">This QR code might have expired or doesn't exist.</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] p-4">
        <div className="bg-[#121212] p-8 rounded-2xl shadow-sm border border-gray-800 text-center max-w-md w-full">
          {reply ? (
            <>
              <div className="w-16 h-16 bg-blue-500/20 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Message Received</h2>
              <div className="bg-[#1a1a1a] border border-gray-700 p-4 rounded-xl mt-4">
                <p className="text-sm text-gray-400 mb-1">Reply from {qr.name}:</p>
                <p className="text-lg font-medium text-blue-400">"{reply}"</p>
              </div>
            </>
          ) : (
            <>
              <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-white">Alert Sent!</h2>
              <p className="text-gray-400 mt-2">
                We've notified the owner of <strong className="text-white">{qr.name}</strong>. Please wait a moment.
              </p>
              <div className="mt-6 flex justify-center">
                <div className="flex items-center gap-2 text-sm text-orange-500 bg-orange-500/10 px-4 py-2 rounded-full">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                  </span>
                  Waiting for reply...
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#121212] rounded-2xl shadow-xl overflow-hidden border border-gray-800">
        <div className="bg-[#1a1a1a] p-8 text-center text-white border-b border-gray-800">
          <div className={cn(
            "w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4",
            qr.mode === 'EMERGENCY' ? "bg-red-500/20" : "bg-orange-500/20"
          )}>
            {qr.mode === 'EMERGENCY' ? (
              <ShieldAlert className="w-8 h-8 text-red-500" />
            ) : (
              <QrCode className="w-8 h-8 text-orange-500" />
            )}
          </div>
          <h1 className="text-2xl font-bold tracking-tight">{qr.name}</h1>
          <p className="text-gray-400 mt-1">
            {qr.mode === 'EMERGENCY' ? 'Emergency Medical Information' : 'Please fill in your details to notify them.'}
          </p>
        </div>

        {qr.mode === 'EMERGENCY' && qr.customData && (
          <div className="p-6 bg-red-500/5 border-b border-red-500/10 space-y-4">
            {qr.customData.bloodGroup && (
              <div className="flex items-center gap-3 text-white">
                <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
                  <Droplet className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Blood Group</p>
                  <p className="font-bold text-lg text-red-400">{qr.customData.bloodGroup}</p>
                </div>
              </div>
            )}
            
            {qr.customData.medicalConditions && (
              <div className="flex items-start gap-3 text-white">
                <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center shrink-0 mt-1">
                  <FileText className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Medical Conditions / Allergies</p>
                  <p className="font-medium text-sm mt-0.5">{qr.customData.medicalConditions}</p>
                </div>
              </div>
            )}

            {qr.customData.emergencyContacts && qr.customData.emergencyContacts.length > 0 && (
              <div className="pt-4 border-t border-gray-800/50">
                <p className="text-xs text-gray-400 mb-3">Emergency Contacts</p>
                <div className="space-y-2">
                  {qr.customData.emergencyContacts.map((contact: string, idx: number) => (
                    <a key={idx} href={`tel:${contact}`} className="flex items-center justify-between p-3 rounded-xl bg-[#1a1a1a] border border-gray-800 hover:border-gray-700 transition-colors">
                      <span className="text-white font-medium">{contact}</span>
                      <Phone className="w-4 h-4 text-green-500" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {qr.deliveryMode && qr.deliveryMessage && (
          <div className="bg-blue-500/10 border-b border-blue-500/20 p-4 text-center">
            <p className="text-sm font-medium text-blue-400">{qr.deliveryMessage}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          {qr.requireName !== false && (
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Your Name</label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-700 bg-[#1a1a1a] text-white focus:ring-2 focus:ring-orange-500 transition-all outline-none"
                placeholder="e.g. John Doe"
                value={formData.visitorName}
                onChange={e => setFormData({...formData, visitorName: e.target.value})}
              />
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Purpose of Visit</label>
            <input
              type="text"
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-700 bg-[#1a1a1a] text-white focus:ring-2 focus:ring-orange-500 transition-all outline-none"
              placeholder="e.g. Delivery, Meeting"
              value={formData.purpose}
              onChange={e => setFormData({...formData, purpose: e.target.value})}
            />
          </div>

          {/* Dynamic Custom Fields */}
          {qr.customFields && qr.customFields.map((field: any) => (
            <div key={field.id}>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                {field.label} {field.required && <span className="text-red-500">*</span>}
              </label>
              {field.type === 'introduction' || field.type === 'note' ? (
                <textarea
                  required={field.required}
                  rows={field.type === 'introduction' ? 4 : 2}
                  className="w-full px-4 py-3 rounded-xl border border-gray-700 bg-[#1a1a1a] text-white focus:ring-2 focus:ring-orange-500 transition-all outline-none resize-none"
                  placeholder={`Enter ${field.label.toLowerCase()}`}
                  value={formData.customData[field.id] || ''}
                  onChange={e => setFormData({
                    ...formData,
                    customData: { ...formData.customData, [field.id]: e.target.value }
                  })}
                />
              ) : (
                <input
                  type={field.type === 'phone' ? 'tel' : field.type}
                  required={field.required}
                  className="w-full px-4 py-3 rounded-xl border border-gray-700 bg-[#1a1a1a] text-white focus:ring-2 focus:ring-orange-500 transition-all outline-none"
                  placeholder={`Enter ${field.label.toLowerCase()}`}
                  value={formData.customData[field.id] || ''}
                  onChange={e => setFormData({
                    ...formData,
                    customData: { ...formData.customData, [field.id]: e.target.value }
                  })}
                />
              )}
            </div>
          ))}

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Location (Optional)</label>
            {!location ? (
              <button
                type="button"
                onClick={handleGetLocation}
                disabled={locating}
                className="w-full px-4 py-3 rounded-xl border border-gray-700 bg-[#1a1a1a] text-gray-300 hover:bg-[#222] flex items-center justify-center gap-2 transition-all font-medium disabled:opacity-70"
              >
                <MapPin className="w-5 h-5" />
                {locating ? 'Getting Location...' : 'Share Current Location'}
              </button>
            ) : (
              <div className="w-full px-4 py-3 rounded-xl border border-green-500/30 bg-green-500/10 text-green-500 flex items-center justify-center gap-2 font-medium">
                <CheckCircle2 className="w-5 h-5" />
                Location Shared Successfully
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3.5 rounded-xl font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-70"
          >
            {submitting ? 'Sending Alert...' : (
              <>
                <Send className="w-5 h-5" />
                Ring Bell
              </>
            )}
          </button>

          {errorMsg && (
            <div className="p-4 bg-red-500/10 text-red-500 rounded-xl text-sm font-medium text-center border border-red-500/20">
              {errorMsg}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
