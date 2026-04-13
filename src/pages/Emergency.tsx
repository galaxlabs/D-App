import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Plus, X, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Emergency() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.displayName || '',
    bloodType: '',
    medicalCondition: '',
    message: '',
    phone1: '',
    phone2: ''
  });

  const [contacts, setContacts] = useState([{ name: '', phone: '' }]);

  const handleAddContact = () => {
    setContacts([...contacts, { name: '', phone: '' }]);
  };

  const handleRemoveContact = (index: number) => {
    setContacts(contacts.filter((_, i) => i !== index));
  };

  const handleContactChange = (index: number, field: 'name' | 'phone', value: string) => {
    const newContacts = [...contacts];
    newContacts[index][field] = value;
    setContacts(newContacts);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Emergency Card Created!');
  };

  return (
    <div className="p-4 max-w-md mx-auto pb-24">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/doors" className="p-2 -ml-2 text-gray-400 hover:text-white transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h2 className="text-2xl font-bold text-white tracking-tight">Emergency Card</h2>
      </div>

      <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 mb-6 flex gap-3">
        <AlertTriangle className="w-6 h-6 text-red-500 shrink-0" />
        <p className="text-sm text-red-200">This information will be accessible via your emergency QR code to help first responders.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-[#121212] p-5 rounded-3xl border border-gray-800 space-y-4">
          <h3 className="font-bold text-white mb-2">Personal Information</h3>
          
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Full Name</label>
            <input
              type="text"
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-700 bg-[#1a1a1a] text-white focus:ring-2 focus:ring-orange-500 outline-none"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Blood Type</label>
              <select
                className="w-full px-4 py-3 rounded-xl border border-gray-700 bg-[#1a1a1a] text-white focus:ring-2 focus:ring-orange-500 outline-none"
                value={formData.bloodType}
                onChange={e => setFormData({...formData, bloodType: e.target.value})}
              >
                <option value="">Select...</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Medical Conditions / Allergies</label>
            <textarea
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-gray-700 bg-[#1a1a1a] text-white focus:ring-2 focus:ring-orange-500 outline-none resize-none"
              value={formData.medicalCondition}
              onChange={e => setFormData({...formData, medicalCondition: e.target.value})}
              placeholder="e.g. Penicillin allergy, Asthma"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Emergency Message</label>
            <textarea
              rows={2}
              className="w-full px-4 py-3 rounded-xl border border-gray-700 bg-[#1a1a1a] text-white focus:ring-2 focus:ring-orange-500 outline-none resize-none"
              value={formData.message}
              onChange={e => setFormData({...formData, message: e.target.value})}
              placeholder="Message to display when scanned"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Primary Phone</label>
              <input
                type="tel"
                className="w-full px-4 py-3 rounded-xl border border-gray-700 bg-[#1a1a1a] text-white focus:ring-2 focus:ring-orange-500 outline-none"
                value={formData.phone1}
                onChange={e => setFormData({...formData, phone1: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Secondary Phone</label>
              <input
                type="tel"
                className="w-full px-4 py-3 rounded-xl border border-gray-700 bg-[#1a1a1a] text-white focus:ring-2 focus:ring-orange-500 outline-none"
                value={formData.phone2}
                onChange={e => setFormData({...formData, phone2: e.target.value})}
              />
            </div>
          </div>
        </div>

        <div className="bg-[#121212] p-5 rounded-3xl border border-gray-800 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-white">Emergency Contacts</h3>
            <button
              type="button"
              onClick={handleAddContact}
              className="text-orange-500 hover:text-orange-400 flex items-center gap-1 text-sm font-medium"
            >
              <Plus className="w-4 h-4" /> Add
            </button>
          </div>

          <div className="space-y-4">
            {contacts.map((contact, index) => (
              <div key={index} className="bg-[#1a1a1a] p-4 rounded-2xl border border-gray-700 relative">
                {contacts.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveContact(index)}
                    className="absolute top-2 right-2 p-1 text-gray-500 hover:text-red-500 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                <div className="space-y-3 mt-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">Contact Name</label>
                    <input
                      type="text"
                      required
                      className="w-full px-3 py-2.5 rounded-lg border border-gray-600 bg-[#121212] text-white focus:ring-2 focus:ring-orange-500 outline-none text-sm"
                      value={contact.name}
                      onChange={e => handleContactChange(index, 'name', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      required
                      className="w-full px-3 py-2.5 rounded-lg border border-gray-600 bg-[#121212] text-white focus:ring-2 focus:ring-orange-500 outline-none text-sm"
                      value={contact.phone}
                      onChange={e => handleContactChange(index, 'phone', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-red-500 hover:bg-red-600 text-white py-4 rounded-xl font-bold transition-colors shadow-lg shadow-red-500/20"
        >
          Create Emergency Card
        </button>
      </form>
    </div>
  );
}
