import React, { useState, useEffect } from 'react';
import { Users, Plus, Shield, Mail, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Members() {
  const [members, setMembers] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', role: 'Family', email: '' });

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    const res = await fetch('/api/members');
    setMembers(await res.json());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/members', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    setShowForm(false);
    setFormData({ name: '', role: 'Family', email: '' });
    fetchMembers();
  };

  return (
    <div className="p-4 max-w-md mx-auto pb-24">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/profile" className="p-2 -ml-2 text-gray-400 hover:text-white transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h2 className="text-2xl font-bold text-white tracking-tight">Members</h2>
      </div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-gray-400 text-sm">Manage family and office members.</p>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Member
        </button>
      </div>

      {showForm && (
        <div className="bg-[#121212] p-4 rounded-2xl border border-gray-800 shadow-sm mb-6">
          <h3 className="text-lg font-semibold text-white mb-4">Add New Member</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Name</label>
              <input
                type="text"
                required
                className="w-full px-4 py-2.5 rounded-lg border border-gray-700 bg-[#1a1a1a] text-white focus:ring-2 focus:ring-orange-500 outline-none"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Role</label>
              <select
                className="w-full px-4 py-2.5 rounded-lg border border-gray-700 bg-[#1a1a1a] text-white focus:ring-2 focus:ring-orange-500 outline-none"
                value={formData.role}
                onChange={e => setFormData({...formData, role: e.target.value})}
              >
                <option value="Family">Family Member</option>
                <option value="Office">Office Staff</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
              <input
                type="email"
                required
                className="w-full px-4 py-2.5 rounded-lg border border-gray-700 bg-[#1a1a1a] text-white focus:ring-2 focus:ring-orange-500 outline-none"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
              />
            </div>
            <div className="flex justify-end gap-3 mt-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-5 py-2.5 rounded-lg font-medium text-gray-400 hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-lg font-medium transition-colors"
              >
                Save Member
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-[#121212] rounded-2xl border border-gray-800 shadow-sm overflow-hidden">
        <div className="divide-y divide-gray-800">
          {members.map(member => (
            <div key={member.id} className="p-4 hover:bg-[#1a1a1a] transition-colors">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-orange-500/20 text-orange-500 flex items-center justify-center font-bold shrink-0">
                  {member.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-medium text-white">{member.name}</h4>
                  <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded text-[10px] font-medium bg-gray-800 text-gray-300">
                    <Shield className="w-3 h-3" />
                    {member.role}
                  </span>
                </div>
              </div>
              <div className="text-sm text-gray-400 flex items-center gap-2 pl-13">
                <Mail className="w-4 h-4 text-gray-500" />
                {member.email}
              </div>
            </div>
          ))}
          {members.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              No members added yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
