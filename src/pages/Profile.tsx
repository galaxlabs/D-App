import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { 
  User, DoorOpen, Activity, MapPin, Bell, Globe, 
  Moon, Shield, Trash2, LogOut, Info, Star, ChevronRight, Users, Contact, Edit2, X, Save
} from 'lucide-react';

export default function Profile() {
  const { user, signOut } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    displayName: user?.displayName || '',
    phone: '',
    company: ''
  });

  useEffect(() => {
    const saved = localStorage.getItem('userProfileData');
    if (saved) {
      setProfileData(prev => ({ ...prev, ...JSON.parse(saved) }));
    }
  }, []);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('userProfileData', JSON.stringify(profileData));
    setIsEditing(false);
  };

  return (
    <div className="p-4 max-w-md mx-auto pb-24">
      <h2 className="text-2xl font-bold text-white mb-6">Profile</h2>

      {/* My Visitor Card */}
      <div className="bg-[#121212] rounded-2xl border border-gray-800 p-6 mb-6 flex items-center gap-4 shadow-sm relative">
        <button 
          onClick={() => setIsEditing(true)}
          className="absolute top-4 right-4 p-2 bg-[#1a1a1a] rounded-full text-gray-400 hover:text-white transition-colors"
        >
          <Edit2 className="w-4 h-4" />
        </button>
        <div className="w-16 h-16 rounded-full bg-orange-500/20 flex items-center justify-center overflow-hidden shrink-0">
          {user?.photoURL ? (
            <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          ) : (
            <User className="w-8 h-8 text-orange-500" />
          )}
        </div>
        <div className="flex-1 overflow-hidden pr-8">
          <h3 className="text-xl font-bold text-white truncate">{profileData.displayName || user?.displayName || 'Visitor Name'}</h3>
          <p className="text-gray-400 text-sm truncate">{user?.email || 'email@example.com'}</p>
          {profileData.phone && <p className="text-gray-500 text-sm mt-1">{profileData.phone}</p>}
          {profileData.company && <p className="text-gray-500 text-xs mt-0.5">{profileData.company}</p>}
        </div>
      </div>

      <div className="space-y-4">
        {/* Door & Activity */}
        <div className="bg-[#121212] rounded-2xl border border-gray-800 overflow-hidden">
          <Link to="/qrs" className="w-full flex items-center justify-between p-4 hover:bg-[#1a1a1a] transition-colors border-b border-gray-800">
            <div className="flex items-center gap-3 text-white">
              <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500">
                <DoorOpen className="w-4 h-4" />
              </div>
              <span className="font-medium">Create Door Option</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-500" />
          </Link>
          <Link to="/" className="w-full flex items-center justify-between p-4 hover:bg-[#1a1a1a] transition-colors border-b border-gray-800">
            <div className="flex items-center gap-3 text-white">
              <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                <Activity className="w-4 h-4" />
              </div>
              <span className="font-medium">All Activity</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-500" />
          </Link>
          <Link to="/members" className="w-full flex items-center justify-between p-4 hover:bg-[#1a1a1a] transition-colors border-b border-gray-800">
            <div className="flex items-center gap-3 text-white">
              <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
                <Users className="w-4 h-4" />
              </div>
              <span className="font-medium">Members</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-500" />
          </Link>
          <Link to="/contacts" className="w-full flex items-center justify-between p-4 hover:bg-[#1a1a1a] transition-colors">
            <div className="flex items-center gap-3 text-white">
              <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500">
                <Contact className="w-4 h-4" />
              </div>
              <span className="font-medium">Contacts</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-500" />
          </Link>
        </div>

        {/* Settings */}
        <div className="bg-[#121212] rounded-2xl border border-gray-800 overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-gray-800">
            <div className="flex items-center gap-3 text-white">
              <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500">
                <Bell className="w-4 h-4" />
              </div>
              <span className="font-medium">General Notification</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
            </label>
          </div>
          <button className="w-full flex items-center justify-between p-4 hover:bg-[#1a1a1a] transition-colors border-b border-gray-800">
            <div className="flex items-center gap-3 text-white">
              <div className="w-8 h-8 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-500">
                <Globe className="w-4 h-4" />
              </div>
              <span className="font-medium">Language</span>
            </div>
            <div className="flex items-center gap-2 text-gray-500">
              <span className="text-sm">English</span>
              <ChevronRight className="w-5 h-5" />
            </div>
          </button>
          <button className="w-full flex items-center justify-between p-4 hover:bg-[#1a1a1a] transition-colors border-b border-gray-800">
            <div className="flex items-center gap-3 text-white">
              <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                <Moon className="w-4 h-4" />
              </div>
              <span className="font-medium">Theme</span>
            </div>
            <div className="flex items-center gap-2 text-gray-500">
              <span className="text-sm">Dark</span>
              <ChevronRight className="w-5 h-5" />
            </div>
          </button>
          <button className="w-full flex items-center justify-between p-4 hover:bg-[#1a1a1a] transition-colors border-b border-gray-800">
            <div className="flex items-center gap-3 text-white">
              <div className="w-8 h-8 rounded-full bg-teal-500/10 flex items-center justify-center text-teal-500">
                <Shield className="w-4 h-4" />
              </div>
              <span className="font-medium">Privacy</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-500" />
          </button>
          <button className="w-full flex items-center justify-between p-4 hover:bg-[#1a1a1a] transition-colors">
            <div className="flex items-center gap-3 text-red-500">
              <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center">
                <Trash2 className="w-4 h-4" />
              </div>
              <span className="font-medium">Delete Data</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* App Info & Sign Out */}
        <div className="bg-[#121212] rounded-2xl border border-gray-800 overflow-hidden">
          <button className="w-full flex items-center justify-between p-4 hover:bg-[#1a1a1a] transition-colors border-b border-gray-800">
            <div className="flex items-center gap-3 text-white">
              <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-gray-400">
                <Info className="w-4 h-4" />
              </div>
              <span className="font-medium">Quick Guide</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-500" />
          </button>
          <button className="w-full flex items-center justify-between p-4 hover:bg-[#1a1a1a] transition-colors border-b border-gray-800">
            <div className="flex items-center gap-3 text-white">
              <div className="w-8 h-8 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-500">
                <Star className="w-4 h-4" />
              </div>
              <span className="font-medium">Rate Us</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-500" />
          </button>
          <button 
            onClick={signOut}
            className="w-full flex items-center justify-between p-4 hover:bg-[#1a1a1a] transition-colors"
          >
            <div className="flex items-center gap-3 text-orange-500">
              <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center">
                <LogOut className="w-4 h-4" />
              </div>
              <span className="font-medium">Sign Out</span>
            </div>
          </button>
        </div>

        <div className="text-center py-4">
          <p className="text-xs text-gray-600">App Version 1.0.0</p>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setIsEditing(false)}>
          <div className="bg-[#121212] p-6 rounded-3xl border border-gray-800 max-w-sm w-full" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Edit Profile</h2>
              <button onClick={() => setIsEditing(false)} className="text-gray-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Display Name</label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-700 bg-[#1a1a1a] text-white focus:ring-2 focus:ring-orange-500 outline-none"
                  value={profileData.displayName}
                  onChange={e => setProfileData({...profileData, displayName: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Phone Number</label>
                <input
                  type="tel"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-700 bg-[#1a1a1a] text-white focus:ring-2 focus:ring-orange-500 outline-none"
                  placeholder="+1 234 567 8900"
                  value={profileData.phone}
                  onChange={e => setProfileData({...profileData, phone: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Company / Organization</label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-700 bg-[#1a1a1a] text-white focus:ring-2 focus:ring-orange-500 outline-none"
                  placeholder="Your Company"
                  value={profileData.company}
                  onChange={e => setProfileData({...profileData, company: e.target.value})}
                />
              </div>

              <button
                type="submit"
                className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-bold transition-colors mt-6 flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" /> Save Changes
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
