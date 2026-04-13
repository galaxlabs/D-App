import React, { useState, useEffect } from 'react';
import { Contact, Calendar, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Contacts() {
  const [contacts, setContacts] = useState<any[]>([]);

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    const res = await fetch('/api/contacts');
    setContacts(await res.json());
  };

  return (
    <div className="p-4 max-w-md mx-auto pb-24">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/profile" className="p-2 -ml-2 text-gray-400 hover:text-white transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h2 className="text-2xl font-bold text-white tracking-tight">Contacts</h2>
      </div>
      <div className="mb-6">
        <p className="text-gray-400 text-sm">Saved visitors from your inbox alerts.</p>
      </div>

      <div className="bg-[#121212] rounded-2xl border border-gray-800 shadow-sm overflow-hidden">
        <div className="divide-y divide-gray-800">
          {contacts.map(contact => (
            <div key={contact.id} className="p-4 hover:bg-[#1a1a1a] transition-colors">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-orange-500/20 text-orange-500 flex items-center justify-center font-bold shrink-0">
                  <Contact className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-medium text-white">{contact.name}</h4>
                  <p className="text-sm text-gray-400 mt-0.5">{contact.note}</p>
                </div>
              </div>
              <div className="text-xs text-gray-500 flex items-center gap-1.5 pl-13">
                <Calendar className="w-3.5 h-3.5" />
                {new Date(contact.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))}
          {contacts.length === 0 && (
            <div className="p-8 text-center text-gray-500 text-sm">
              No contacts saved yet. You can save contacts directly from the Inbox.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
