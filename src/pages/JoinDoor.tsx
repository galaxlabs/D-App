import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ScanLine, KeyRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function JoinDoor() {
  const { user } = useAuth();
  const [code, setCode] = useState('');
  const [name, setName] = useState(user?.displayName || '');

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Joining door with code ${code} as ${name}`);
  };

  return (
    <div className="p-4 max-w-md mx-auto pb-24">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/doors" className="p-2 -ml-2 text-gray-400 hover:text-white transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h2 className="text-2xl font-bold text-white tracking-tight">Join Door</h2>
      </div>

      <div className="space-y-6">
        <button 
          onClick={() => alert('Opening camera...')}
          className="w-full bg-[#121212] border-2 border-dashed border-gray-700 hover:border-orange-500 p-8 rounded-3xl flex flex-col items-center justify-center gap-4 transition-colors group"
        >
          <div className="w-16 h-16 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500 group-hover:scale-110 transition-transform">
            <ScanLine className="w-8 h-8" />
          </div>
          <div className="text-center">
            <h3 className="font-bold text-white text-lg">Scan QR Code</h3>
            <p className="text-sm text-gray-400 mt-1">Point your camera at the door's QR</p>
          </div>
        </button>

        <div className="relative flex items-center py-2">
          <div className="flex-grow border-t border-gray-800"></div>
          <span className="flex-shrink-0 mx-4 text-gray-500 text-sm font-medium">OR ENTER CODE</span>
          <div className="flex-grow border-t border-gray-800"></div>
        </div>

        <form onSubmit={handleJoin} className="bg-[#121212] p-6 rounded-3xl border border-gray-800 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">6-Digit Code</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <KeyRound className="w-5 h-5 text-gray-500" />
              </div>
              <input
                type="text"
                maxLength={6}
                required
                placeholder="000000"
                className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-700 bg-[#1a1a1a] text-white font-mono text-lg tracking-[0.5em] focus:ring-2 focus:ring-orange-500 outline-none"
                value={code}
                onChange={e => setCode(e.target.value.toUpperCase())}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Your Name</label>
            <input
              type="text"
              required
              className="w-full px-4 py-3.5 rounded-xl border border-gray-700 bg-[#1a1a1a] text-white focus:ring-2 focus:ring-orange-500 outline-none"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3.5 rounded-xl font-bold transition-colors mt-2"
          >
            Join Door
          </button>
        </form>
      </div>
    </div>
  );
}
