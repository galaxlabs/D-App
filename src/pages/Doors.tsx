import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, AlertTriangle, Link as LinkIcon, DoorOpen, Settings } from 'lucide-react';

export default function Doors() {
  return (
    <div className="p-4 max-w-md mx-auto pb-24">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white tracking-tight">Doors</h2>
        <p className="text-gray-400 text-sm mt-1">Manage your doors and emergency settings.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 mb-8">
        <Link to="/doors/add" className="bg-[#121212] p-5 rounded-2xl border border-gray-800 hover:border-orange-500/50 transition-colors flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-500 shrink-0">
            <Plus className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Add Door</h3>
            <p className="text-sm text-gray-400">Create a new door and generate QR</p>
          </div>
        </Link>
        
        <Link to="/doors/emergency" className="bg-[#121212] p-5 rounded-2xl border border-gray-800 hover:border-red-500/50 transition-colors flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center text-red-500 shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Emergency</h3>
            <p className="text-sm text-gray-400">Set up your emergency card</p>
          </div>
        </Link>

        <Link to="/doors/join" className="bg-[#121212] p-5 rounded-2xl border border-gray-800 hover:border-blue-500/50 transition-colors flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500 shrink-0">
            <LinkIcon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Join Door</h3>
            <p className="text-sm text-gray-400">Scan QR or enter 6-digit code</p>
          </div>
        </Link>
      </div>

      {/* Placeholder for existing doors list */}
      <div>
        <h3 className="text-lg font-bold text-white mb-4">My Doors</h3>
        <div className="bg-[#121212] p-4 rounded-2xl border border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400">
              <DoorOpen className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white">Main Entrance</h4>
              <p className="text-xs text-green-500">Active</p>
            </div>
          </div>
          <Link to="/doors/1/settings" className="p-2 text-gray-400 hover:text-white transition-colors">
            <Settings className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
