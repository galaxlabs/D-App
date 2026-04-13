import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Plus, QrCode, Clock, Users, Copy, Check, Trash2, CalendarDays, AlertCircle, CheckCircle2, ArrowLeft, ScanLine, Palette } from 'lucide-react';
import { cn } from '../lib/utils';
import { Link, useNavigate } from 'react-router-dom';

export default function QRManager() {
  const navigate = useNavigate();
  const [qrs, setQrs] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    mode: 'BELL',
    validFrom: '',
    validUntil: '',
    visitorLimit: '',
    sharedWith: [] as string[],
    workingHoursStart: '',
    workingHoursEnd: '',
    offDays: [] as number[]
  });

  const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const [slots, setSlots] = useState<{startTime: string, endTime: string, limit: string}[]>([]);

  useEffect(() => {
    fetchQrs();
    fetchMembers();
  }, []);

  const fetchQrs = async () => {
    const res = await fetch('/api/qrs');
    const data = await res.json();
    setQrs(data);
  };

  const fetchMembers = async () => {
    const res = await fetch('/api/members');
    const data = await res.json();
    setMembers(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      slots,
      workingHours: (formData.workingHoursStart && formData.workingHoursEnd) 
        ? { start: formData.workingHoursStart, end: formData.workingHoursEnd } 
        : null
    };

    if (isEditing && editingId) {
      await fetch(`/api/qrs/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } else {
      await fetch('/api/qrs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    }
    setShowForm(false);
    setIsEditing(false);
    setEditingId(null);
    setFormData({ name: '', mode: 'BELL', validFrom: '', validUntil: '', visitorLimit: '', sharedWith: [], workingHoursStart: '', workingHoursEnd: '', offDays: [] });
    setSlots([]);
    fetchQrs();
  };

  const handleEdit = (qr: any) => {
    setFormData({
      name: qr.name,
      mode: qr.mode,
      validFrom: qr.validFrom || '',
      validUntil: qr.validUntil || '',
      visitorLimit: qr.visitorLimit ? qr.visitorLimit.toString() : '',
      sharedWith: qr.sharedWith || [],
      workingHoursStart: qr.workingHours?.start || '',
      workingHoursEnd: qr.workingHours?.end || '',
      offDays: qr.offDays || []
    });
    setSlots(qr.slots || []);
    setEditingId(qr.id);
    setIsEditing(true);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this QR code?')) return;
    await fetch(`/api/qrs/${id}`, { method: 'DELETE' });
    fetchQrs();
  };

  const handleAddSlot = () => {
    setSlots([...slots, { startTime: '', endTime: '', limit: '' }]);
  };

  const handleSlotChange = (index: number, field: string, value: string) => {
    const newSlots = [...slots];
    newSlots[index] = { ...newSlots[index], [field]: value };
    setSlots(newSlots);
  };

  const handleRemoveSlot = (index: number) => {
    setSlots(slots.filter((_, i) => i !== index));
  };

  const handleCopy = (slug: string) => {
    const url = `${window.location.origin}/scan/${slug}`;
    navigator.clipboard.writeText(url);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  return (
    <div className="p-4 max-w-md mx-auto pb-24">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/" className="p-2 -ml-2 text-gray-400 hover:text-white transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h2 className="text-2xl font-bold text-white tracking-tight">QR Codes</h2>
      </div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-gray-400 text-sm">Manage your active QR codes and set limits.</p>
        <div className="flex gap-2">
          <button
            onClick={() => alert('Scanner opening...')}
            className="bg-[#1a1a1a] border border-gray-700 hover:bg-[#222] text-white p-2.5 rounded-xl transition-colors"
            title="Scan QR Code"
          >
            <ScanLine className="w-5 h-5" />
          </button>
          <button
            onClick={() => {
              setShowForm(!showForm);
              if (!showForm) {
                setIsEditing(false);
                setEditingId(null);
                setFormData({ name: '', mode: 'BELL', validFrom: '', validUntil: '', visitorLimit: '', sharedWith: [] });
                setSlots([]);
              }
            }}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            Create QR
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-[#121212] p-6 rounded-2xl border border-gray-800 shadow-sm mb-8">
          <h3 className="text-lg font-semibold text-white mb-4">{isEditing ? 'Edit QR Code' : 'Create New QR Code'}</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">QR Name</label>
              <input
                type="text"
                required
                className="w-full px-4 py-2.5 rounded-lg border border-gray-700 bg-[#1a1a1a] text-white focus:ring-2 focus:ring-orange-500 outline-none"
                placeholder="e.g. Clinic Entrance"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mode</label>
              <select
                className="w-full px-4 py-2.5 rounded-lg border border-gray-700 focus:ring-2 focus:ring-orange-500 outline-none bg-[#121212] text-white"
                value={formData.mode}
                onChange={e => setFormData({...formData, mode: e.target.value})}
              >
                <option value="BELL">QR Bell (Direct Alert)</option>
                <option value="QUEUE">Queue Token System</option>
                <option value="COWORKING">Co-working</option>
                <option value="TRIP_LOG">Trip Log</option>
                <option value="CHECK_POINT">Check Point</option>
                <option value="VISITOR_LOG">Visitor Log</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Valid From (Optional)</label>
              <input
                type="datetime-local"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-700 bg-[#1a1a1a] text-white focus:ring-2 focus:ring-orange-500 outline-none"
                value={formData.validFrom}
                onChange={e => setFormData({...formData, validFrom: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Valid Until (Optional)</label>
              <input
                type="datetime-local"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-700 bg-[#1a1a1a] text-white focus:ring-2 focus:ring-orange-500 outline-none"
                value={formData.validUntil}
                onChange={e => setFormData({...formData, validUntil: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Visitor / Patient Limit (Optional)</label>
              <input
                type="number"
                min="1"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-700 bg-[#1a1a1a] text-white focus:ring-2 focus:ring-orange-500 outline-none"
                placeholder="e.g. 50"
                value={formData.visitorLimit}
                onChange={e => setFormData({...formData, visitorLimit: e.target.value})}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-400 mb-2">Off Days (Closed)</label>
              <div className="flex flex-wrap gap-2">
                {DAYS.map((day, index) => (
                  <label key={day} className={cn(
                    "px-3 py-1.5 rounded-lg border text-sm cursor-pointer transition-colors",
                    formData.offDays.includes(index) ? "bg-red-500/20 border-red-500/50 text-red-400" : "bg-[#1a1a1a] border-gray-700 text-gray-400 hover:border-gray-500"
                  )}>
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={formData.offDays.includes(index)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({ ...formData, offDays: [...formData.offDays, index] });
                        } else {
                          setFormData({ ...formData, offDays: formData.offDays.filter(d => d !== index) });
                        }
                      }}
                    />
                    {day}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Working Hours Start (Optional)</label>
              <input
                type="time"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-700 bg-[#1a1a1a] text-white focus:ring-2 focus:ring-orange-500 outline-none"
                value={formData.workingHoursStart}
                onChange={e => setFormData({...formData, workingHoursStart: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Working Hours End (Optional)</label>
              <input
                type="time"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-700 bg-[#1a1a1a] text-white focus:ring-2 focus:ring-orange-500 outline-none"
                value={formData.workingHoursEnd}
                onChange={e => setFormData({...formData, workingHoursEnd: e.target.value})}
              />
            </div>

            {/* Share With Members */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-400 mb-2">Share Notifications With Members</label>
              {members.length === 0 ? (
                <p className="text-sm text-gray-500">No members available. Add members in the Members tab.</p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {members.map(member => (
                    <label key={member.id} className="flex items-center gap-2 bg-[#1a1a1a] p-3 rounded-lg border border-gray-800 cursor-pointer hover:border-gray-700 transition-colors">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-orange-500 bg-[#121212] border-gray-700 rounded focus:ring-orange-500 focus:ring-offset-gray-900"
                        checked={formData.sharedWith.includes(member.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({ ...formData, sharedWith: [...formData.sharedWith, member.id] });
                          } else {
                            setFormData({ ...formData, sharedWith: formData.sharedWith.filter((id: string) => id !== member.id) });
                          }
                        }}
                      />
                      <span className="text-sm text-white">{member.name}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Time Slots Section */}
            <div className="md:col-span-2 border-t border-gray-800 pt-6 mt-2">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-semibold text-white">Time Slots (Optional)</h4>
                <button
                  type="button"
                  onClick={handleAddSlot}
                  className="text-sm font-medium text-orange-500 hover:text-orange-400 flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" /> Add Slot
                </button>
              </div>
              
              {slots.length > 0 ? (
                <div className="space-y-3">
                  {slots.map((slot, index) => (
                    <div key={index} className="flex items-center gap-3 bg-[#1a1a1a] p-3 rounded-lg border border-gray-800">
                      <div className="flex-1">
                        <label className="block text-xs text-gray-500 mb-1">Start Time</label>
                        <input
                          type="time"
                          required
                          className="w-full px-3 py-2 rounded-md border border-gray-700 bg-[#121212] text-white text-sm outline-none"
                          value={slot.startTime}
                          onChange={e => handleSlotChange(index, 'startTime', e.target.value)}
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-xs text-gray-500 mb-1">End Time</label>
                        <input
                          type="time"
                          required
                          className="w-full px-3 py-2 rounded-md border border-gray-700 bg-[#121212] text-white text-sm outline-none"
                          value={slot.endTime}
                          onChange={e => handleSlotChange(index, 'endTime', e.target.value)}
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-xs text-gray-500 mb-1">Slot Limit</label>
                        <input
                          type="number"
                          min="1"
                          placeholder="Limit"
                          className="w-full px-3 py-2 rounded-md border border-gray-700 bg-[#121212] text-white text-sm outline-none"
                          value={slot.limit}
                          onChange={e => handleSlotChange(index, 'limit', e.target.value)}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveSlot(index)}
                        className="mt-5 p-2 text-red-500 hover:bg-red-500/10 rounded-md transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No time slots defined. The QR will be active at all times within the validity period.</p>
              )}
            </div>

            <div className="md:col-span-2 flex justify-end gap-3 mt-4">
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
                {isEditing ? 'Update QR' : 'Generate QR'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {qrs.map(qr => {
          const url = `${window.location.origin}/scan/${qr.slug}`;
          const isExpired = qr.validUntil && new Date(qr.validUntil) < new Date();
          const isLimitReached = qr.visitorLimit && qr.currentVisitors >= qr.visitorLimit;
          const isActive = !isExpired && !isLimitReached;
          const sharedMembers = qr.sharedWith ? members.filter(m => qr.sharedWith.includes(m.id)) : [];

          return (
            <div key={qr.id} className="bg-[#121212] rounded-2xl border border-gray-800 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col">
              {/* Header */}
              <div className="p-5 border-b border-gray-800 flex justify-between items-start bg-[#1a1a1a]">
                <div>
                  <h3 className="text-xl font-bold text-white">{qr.name}</h3>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={cn(
                      "px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider",
                      qr.mode === 'QUEUE' ? "bg-purple-500/20 text-purple-400" : 
                      qr.mode === 'CHECK_POINT' ? "bg-orange-500/20 text-orange-400" :
                      "bg-blue-500/20 text-blue-400"
                    )}>
                      {qr.mode.replace('_', ' ')}
                    </span>
                    <span className={cn(
                      "flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider",
                      isActive ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                    )}>
                      {isActive ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                      {isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(qr)} className="text-gray-400 hover:text-white transition-colors p-1" title="Edit">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                  </button>
                  <button onClick={() => handleDelete(qr.id)} className="text-gray-400 hover:text-red-500 transition-colors p-1" title="Delete">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="p-5 flex-1 flex flex-col gap-5">
                {/* QR Code */}
                <div className="flex justify-center">
                  <div className="p-3 bg-white border border-gray-200 shadow-sm rounded-xl">
                    <QRCodeSVG value={url} size={100} level="H" includeMargin={false} />
                  </div>
                </div>

                {/* Overall Limit */}
                <div className="bg-[#1a1a1a] p-4 rounded-xl border border-gray-800">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-semibold text-gray-400 flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-gray-500" /> Total Visitors
                    </span>
                    <span className="text-sm font-bold text-white">
                      {qr.currentVisitors} {qr.visitorLimit ? `/ ${qr.visitorLimit}` : ''}
                    </span>
                  </div>
                  {qr.visitorLimit && (
                    <div className="w-full bg-gray-800 rounded-full h-1.5 mt-2 overflow-hidden">
                      <div 
                        className={cn("h-1.5 rounded-full transition-all", qr.currentVisitors >= qr.visitorLimit ? "bg-red-500" : "bg-orange-500")} 
                        style={{ width: `${Math.min(100, (qr.currentVisitors / qr.visitorLimit) * 100)}%` }}
                      ></div>
                    </div>
                  )}
                </div>

                {/* Shared With */}
                {sharedMembers.length > 0 && (
                  <div className="flex items-start gap-3 text-sm px-1">
                    <Users className="w-4 h-4 text-gray-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-gray-300">Shared With</p>
                      <p className="text-gray-500 text-xs mt-1 leading-relaxed">
                        {sharedMembers.map(m => m.name).join(', ')}
                      </p>
                    </div>
                  </div>
                )}

                {/* Validity Period & Working Hours */}
                <div className="space-y-3">
                  {(qr.validFrom || qr.validUntil) && (
                    <div className="flex items-start gap-3 text-sm px-1">
                      <CalendarDays className="w-4 h-4 text-gray-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-gray-300">Validity Period</p>
                        <p className="text-gray-500 text-xs mt-1 leading-relaxed">
                          {qr.validFrom ? new Date(qr.validFrom).toLocaleString(undefined, {dateStyle: 'medium', timeStyle: 'short'}) : 'Now'} 
                          <br/><span className="text-gray-600">to</span><br/>
                          {qr.validUntil ? new Date(qr.validUntil).toLocaleString(undefined, {dateStyle: 'medium', timeStyle: 'short'}) : 'Forever'}
                        </p>
                      </div>
                    </div>
                  )}

                  {(qr.workingHours || (qr.offDays && qr.offDays.length > 0)) && (
                    <div className="flex items-start gap-3 text-sm px-1">
                      <Clock className="w-4 h-4 text-gray-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-gray-300">Schedule</p>
                        {qr.workingHours && (
                          <p className="text-gray-500 text-xs mt-1">
                            {qr.workingHours.start} - {qr.workingHours.end}
                          </p>
                        )}
                        {qr.offDays && qr.offDays.length > 0 && (
                          <p className="text-red-400 text-xs mt-1">
                            Closed on: {qr.offDays.map((d: number) => DAYS[d]).join(', ')}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Time Slots */}
                {qr.slots && qr.slots.length > 0 && (
                  <div className="pt-2">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5 px-1">
                      <Clock className="w-3.5 h-3.5" /> Daily Time Slots
                    </p>
                    <div className="space-y-2.5">
                      {qr.slots.map((slot: any) => {
                        const now = new Date();
                        const currentStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
                        const isSlotActive = currentStr >= slot.startTime && currentStr <= slot.endTime;
                        const slotPercentage = slot.limit ? Math.min(100, (slot.currentVisitors / slot.limit) * 100) : 0;
                        const isSlotFull = slot.limit && slot.currentVisitors >= slot.limit;

                        return (
                          <div key={slot.id} className={cn(
                            "p-3 rounded-xl border text-sm relative overflow-hidden transition-colors", 
                            isSlotActive ? "bg-orange-500/10 border-orange-500/30" : "bg-[#1a1a1a] border-gray-800"
                          )}>
                            {isSlotActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-500"></div>}
                            <div className="flex justify-between items-center mb-1.5">
                              <span className={cn("font-semibold flex items-center gap-2", isSlotActive ? "text-orange-400" : "text-gray-400")}>
                                {slot.startTime} - {slot.endTime}
                                {isSlotActive && <span className="text-[9px] bg-orange-500/20 text-orange-400 px-1.5 py-0.5 rounded-full font-bold tracking-wide">ACTIVE NOW</span>}
                              </span>
                              <span className={cn("text-xs font-bold", isSlotFull ? "text-red-500" : "text-gray-500")}>
                                {slot.currentVisitors} {slot.limit ? `/ ${slot.limit}` : ''}
                              </span>
                            </div>
                            {slot.limit && (
                              <div className="w-full bg-gray-800 rounded-full h-1.5 mt-2 overflow-hidden">
                                <div 
                                  className={cn("h-1.5 rounded-full", isSlotFull ? "bg-red-500" : (isSlotActive ? "bg-orange-500" : "bg-gray-600"))} 
                                  style={{ width: `${slotPercentage}%` }}
                                ></div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 bg-[#1a1a1a] border-t border-gray-800 flex gap-2">
                <button
                  onClick={() => handleCopy(qr.slug)}
                  className="flex-1 flex items-center justify-center gap-2 bg-[#222] border border-gray-700 hover:border-gray-600 hover:bg-[#2a2a2a] text-gray-300 py-2.5 rounded-xl font-medium transition-all text-sm shadow-sm"
                >
                  {copiedSlug === qr.slug ? (
                    <><Check className="w-4 h-4 text-green-500" /> Copied</>
                  ) : (
                    <><Copy className="w-4 h-4" /> Copy Link</>
                  )}
                </button>
                <button
                  onClick={() => navigate(`/qrs/${qr.slug}/design`)}
                  className="flex-1 flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white py-2.5 rounded-xl font-medium transition-all text-sm shadow-sm"
                >
                  <Palette className="w-4 h-4" /> Design & Print
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
