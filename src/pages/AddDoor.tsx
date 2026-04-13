import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Home, Factory, Store, GraduationCap, Car, MapPin, HeartPulse, Bell, Users, Clock, FileText, ShieldAlert } from 'lucide-react';
import { cn } from '../lib/utils';

const DOOR_TYPES = [
  { id: 'home', icon: Home, label: 'Home', description: 'Standard doorbell for your house or apartment.', defaultMode: 'BELL' },
  { id: 'office', icon: Factory, label: 'Office / Factory', description: 'Visitor log and delivery management.', defaultMode: 'VISITOR_LOG' },
  { id: 'clinic', icon: HeartPulse, label: 'Clinic / Hospital', description: 'Token queue system and appointments.', defaultMode: 'QUEUE' },
  { id: 'school', icon: GraduationCap, label: 'School', description: 'Secure visitor logging and check points.', defaultMode: 'VISITOR_LOG' },
  { id: 'shop', icon: Store, label: 'Shop / Restaurant', description: 'Delivery drop-offs and customer queues.', defaultMode: 'QUEUE' },
  { id: 'trip', icon: Car, label: 'Trip Record', description: 'Log travel details and check-ins.', defaultMode: 'CHECK_POINT' },
  { id: 'checkpoint', icon: MapPin, label: 'Check Point', description: 'Security patrol and location tagging.', defaultMode: 'CHECK_POINT' },
  { id: 'emergency', icon: ShieldAlert, label: 'Emergency (Kids/Elderly)', description: 'Medical info & GPS alerts for vulnerable family members.', defaultMode: 'EMERGENCY' },
];

export default function AddDoor() {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState(DOOR_TYPES[0].id);
  const [doorName, setDoorName] = useState('');
  
  // Dynamic options state
  const [hasMultipleDoctors, setHasMultipleDoctors] = useState(false);
  const [requireAppointments, setRequireAppointments] = useState(false);
  
  // Emergency specific state
  const [bloodGroup, setBloodGroup] = useState('');
  const [medicalConditions, setMedicalConditions] = useState('');
  const [emergencyContacts, setEmergencyContacts] = useState(['', '']);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const typeDef = DOOR_TYPES.find(t => t.id === selectedType);
    
    const payload: any = {
      name: doorName,
      mode: typeDef?.defaultMode || 'BELL',
      customFields: []
    };

    if (selectedType === 'clinic' && requireAppointments) {
      payload.customFields.push({ id: `field-app-${Date.now()}`, label: 'Appointment ID / Patient Name', type: 'text', required: true });
    }

    if (selectedType === 'emergency') {
      payload.customData = {
        bloodGroup,
        medicalConditions,
        emergencyContacts: emergencyContacts.filter(c => c.trim() !== '')
      };
      payload.mode = 'EMERGENCY';
    }

    const res = await fetch('/api/qrs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      const newQr = await res.json();
      navigate(`/doors/${newQr.id}/settings`);
    }
  };

  const selectedTypeDef = DOOR_TYPES.find(t => t.id === selectedType);

  return (
    <div className="p-4 max-w-md mx-auto pb-24">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/doors" className="p-2 -ml-2 text-gray-400 hover:text-white transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h2 className="text-2xl font-bold text-white tracking-tight">Create New Door</h2>
      </div>

      <form onSubmit={handleCreate} className="space-y-6">
        <div className="space-y-4">
          <label className="block text-sm font-bold text-white mb-2">Select Door Type</label>
          <div className="grid grid-cols-1 gap-3">
            {DOOR_TYPES.map(item => {
              const Icon = item.icon;
              const isSelected = selectedType === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedType(item.id)}
                  className={cn(
                    "flex items-center gap-4 p-4 rounded-2xl border transition-all text-left w-full",
                    isSelected 
                      ? "bg-orange-500/10 border-orange-500" 
                      : "bg-[#121212] border-gray-800 hover:border-gray-700"
                  )}
                >
                  <div className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-colors",
                    isSelected ? "bg-orange-500 text-white" : "bg-[#1a1a1a] text-gray-400"
                  )}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className={cn("font-bold", isSelected ? "text-orange-500" : "text-white")}>{item.label}</h3>
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{item.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="bg-[#121212] p-5 rounded-3xl border border-gray-800 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Door Name</label>
            <input
              type="text"
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-700 bg-[#1a1a1a] text-white focus:ring-2 focus:ring-orange-500 outline-none"
              value={doorName}
              onChange={e => setDoorName(e.target.value)}
              placeholder={`e.g. ${selectedTypeDef?.label || 'Main Entrance'}`}
            />
          </div>

          {/* Dynamic Options based on Type */}
          {selectedType === 'clinic' && (
            <div className="pt-4 border-t border-gray-800 space-y-4 animate-in fade-in slide-in-from-top-2">
              <h4 className="text-sm font-bold text-white">Clinic Options</h4>
              
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm text-gray-300 block">Multiple Doctors</span>
                  <span className="text-xs text-gray-500">Generate sub-QRs for each doctor</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={hasMultipleDoctors} onChange={e => setHasMultipleDoctors(e.target.checked)} />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm text-gray-300 block">Require Appointments</span>
                  <span className="text-xs text-gray-500">Visitors must enter appointment details</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={requireAppointments} onChange={e => setRequireAppointments(e.target.checked)} />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                </label>
              </div>
            </div>
          )}

          {selectedType === 'emergency' && (
            <div className="pt-4 border-t border-gray-800 space-y-4 animate-in fade-in slide-in-from-top-2">
              <h4 className="text-sm font-bold text-red-500">Emergency Profile Details</h4>
              <p className="text-xs text-gray-400">This information will be shown to anyone who scans the QR code in an emergency.</p>
              
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Blood Group</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 rounded-xl border border-gray-700 bg-[#1a1a1a] text-white focus:ring-2 focus:ring-red-500 outline-none"
                  value={bloodGroup}
                  onChange={e => setBloodGroup(e.target.value)}
                  placeholder="e.g. O+, A-"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Medical Conditions / Allergies</label>
                <textarea
                  className="w-full px-4 py-3 rounded-xl border border-gray-700 bg-[#1a1a1a] text-white focus:ring-2 focus:ring-red-500 outline-none resize-none"
                  rows={2}
                  value={medicalConditions}
                  onChange={e => setMedicalConditions(e.target.value)}
                  placeholder="e.g. Asthma, Diabetic, Peanut Allergy"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-2">Emergency Contacts (SMS/Call)</label>
                {emergencyContacts.map((contact, idx) => (
                  <input
                    key={idx}
                    type="tel"
                    className="w-full px-4 py-3 rounded-xl border border-gray-700 bg-[#1a1a1a] text-white focus:ring-2 focus:ring-red-500 outline-none mb-2"
                    value={contact}
                    onChange={e => {
                      const newContacts = [...emergencyContacts];
                      newContacts[idx] = e.target.value;
                      setEmergencyContacts(newContacts);
                    }}
                    placeholder={`Contact ${idx + 1} Phone Number`}
                  />
                ))}
                <button
                  type="button"
                  onClick={() => setEmergencyContacts([...emergencyContacts, ''])}
                  className="text-xs text-red-500 font-medium mt-1"
                >
                  + Add another contact
                </button>
              </div>
            </div>
          )}

        </div>

        <button
          type="submit"
          className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-xl font-bold transition-colors shadow-lg shadow-orange-500/20"
        >
          Create Door & Configure Settings
        </button>
      </form>
    </div>
  );
}
