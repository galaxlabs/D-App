import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Settings, Bell, Users, Clock, Shield, MapPin, QrCode, Trash2, Download, RefreshCw, Share2, Plus, Save } from 'lucide-react';
import { cn } from '../lib/utils';

export default function DoorSettings() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [settings, setSettings] = useState({
    mode: 'BELL',
    requireName: true,
    requireSelfie: false,
    quietHours: false,
    quietHoursStart: '22:00',
    quietHoursEnd: '07:00',
    workingHoursStart: '',
    workingHoursEnd: '',
    offDays: [] as number[],
    deliveryMode: false,
    deliveryMessage: '',
    afterHourMessage: '',
    emergencyBypass: true,
    alertSound: 'DEFAULT',
    isActive: true,
    doorName: 'Main Entrance',
    slots: [] as {startTime: string, endTime: string, limit: string}[],
    customFields: [] as { id: string, label: string, type: string, required: boolean }[]
  });

  const FIELD_TYPES = [
    { value: 'text', label: 'Text' },
    { value: 'email', label: 'Email' },
    { value: 'date', label: 'Date' },
    { value: 'note', label: 'Note (Small Text)' },
    { value: 'phone', label: 'Phone' },
    { value: 'introduction', label: 'Introduction (Text Area)' }
  ];

  const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  useEffect(() => {
    fetch('/api/qrs')
      .then(res => res.json())
      .then(data => {
        const qr = data.find((q: any) => q.id === id);
        if (qr) {
          setSettings(prev => ({
            ...prev,
            doorName: qr.name || prev.doorName,
            mode: qr.mode || prev.mode,
            slots: qr.slots || [],
            customFields: qr.customFields || [],
            workingHoursStart: qr.workingHours?.start || '',
            workingHoursEnd: qr.workingHours?.end || '',
            offDays: qr.offDays || [],
            deliveryMode: qr.deliveryMode || false,
            deliveryMessage: qr.deliveryMessage || '',
            afterHourMessage: qr.afterHourMessage || '',
            emergencyBypass: qr.emergencyBypass ?? true,
            quietHours: qr.quietHours || false,
            quietHoursStart: qr.quietHoursStart || '22:00',
            quietHoursEnd: qr.quietHoursEnd || '07:00',
            requireName: qr.requireName ?? true,
            requireSelfie: qr.requireSelfie || false,
            alertSound: qr.alertSound || 'DEFAULT'
          }));
        }
        setLoading(false);
      });
  }, [id]);

  const handleSaveSettings = async () => {
    setSaving(true);
    await fetch(`/api/qrs/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: settings.doorName,
        mode: settings.mode,
        slots: settings.slots,
        customFields: settings.customFields,
        workingHours: settings.workingHoursStart && settings.workingHoursEnd 
          ? { start: settings.workingHoursStart, end: settings.workingHoursEnd } 
          : null,
        offDays: settings.offDays,
        deliveryMode: settings.deliveryMode,
        deliveryMessage: settings.deliveryMessage,
        afterHourMessage: settings.afterHourMessage,
        emergencyBypass: settings.emergencyBypass,
        quietHours: settings.quietHours,
        quietHoursStart: settings.quietHoursStart,
        quietHoursEnd: settings.quietHoursEnd,
        requireName: settings.requireName,
        requireSelfie: settings.requireSelfie,
        alertSound: settings.alertSound
      })
    });
    setSaving(false);
    alert('Settings saved successfully!');
  };

  const handleAddSlot = () => {
    setSettings({ ...settings, slots: [...settings.slots, { startTime: '', endTime: '', limit: '' }] });
  };

  const handleSlotChange = (index: number, field: string, value: string) => {
    const newSlots = [...settings.slots];
    newSlots[index] = { ...newSlots[index], [field]: value };
    setSettings({ ...settings, slots: newSlots });
  };

  const handleRemoveSlot = (index: number) => {
    setSettings({ ...settings, slots: settings.slots.filter((_, i) => i !== index) });
  };

  const handleAddCustomField = () => {
    setSettings({
      ...settings,
      customFields: [
        ...settings.customFields,
        { id: `field-${Date.now()}`, label: '', type: 'text', required: false }
      ]
    });
  };

  const handleCustomFieldChange = (index: number, field: string, value: any) => {
    const newFields = [...settings.customFields];
    newFields[index] = { ...newFields[index], [field]: value };
    setSettings({ ...settings, customFields: newFields });
  };

  const handleRemoveCustomField = (index: number) => {
    setSettings({ ...settings, customFields: settings.customFields.filter((_, i) => i !== index) });
  };

  const handleRegenerate = () => {
    if (window.confirm('CAUTION: Regenerating will invalidate all old sessions and screenshots. You will need to print a new QR code. Continue?')) {
      alert('New QR Code generated.');
    }
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this door? This cannot be undone.')) {
      navigate('/doors');
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto pb-24">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link to="/" className="p-2 -ml-2 text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h2 className="text-2xl font-bold text-white tracking-tight">Door Settings</h2>
        </div>
        <button 
          onClick={handleSaveSettings}
          disabled={saving || loading}
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading settings...</div>
      ) : (
        <div className="space-y-6">
        {/* Door Mode */}
        <div className="bg-[#121212] p-5 rounded-3xl border border-gray-800">
          <h3 className="font-bold text-white mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5 text-orange-500" /> Door Mode
          </h3>
          <select
            className="w-full px-4 py-3 rounded-xl border border-gray-700 bg-[#1a1a1a] text-white focus:ring-2 focus:ring-orange-500 outline-none"
            value={settings.mode}
            onChange={e => setSettings({...settings, mode: e.target.value})}
          >
            <option value="BELL">Door Bell</option>
            <option value="QUEUE">Token Queue</option>
            <option value="COWORKING">Coworking</option>
            <option value="VISITOR_LOG">Visitor Log</option>
            <option value="CHECK_POINT">Check Points</option>
          </select>
        </div>

        {/* Daily Visitor Settings */}
        <div className="bg-[#121212] p-5 rounded-3xl border border-gray-800 space-y-4">
          <h3 className="font-bold text-white mb-2 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-500" /> Daily Visitor Settings
          </h3>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-300">Require Name</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={settings.requireName} onChange={e => setSettings({...settings, requireName: e.target.checked})} />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-300">Require Selfie</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={settings.requireSelfie} onChange={e => setSettings({...settings, requireSelfie: e.target.checked})} />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-300">Quiet Hours</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={settings.quietHours} onChange={e => setSettings({...settings, quietHours: e.target.checked})} />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
            </label>
          </div>

          {settings.quietHours && (
            <div className="flex gap-4 pt-2">
              <div className="flex-1">
                <label className="block text-xs text-gray-500 mb-1">Quiet Start</label>
                <input type="time" className="w-full px-3 py-2 rounded-lg border border-gray-700 bg-[#1a1a1a] text-white outline-none" value={settings.quietHoursStart} onChange={e => setSettings({...settings, quietHoursStart: e.target.value})} />
              </div>
              <div className="flex-1">
                <label className="block text-xs text-gray-500 mb-1">Quiet End</label>
                <input type="time" className="w-full px-3 py-2 rounded-lg border border-gray-700 bg-[#1a1a1a] text-white outline-none" value={settings.quietHoursEnd} onChange={e => setSettings({...settings, quietHoursEnd: e.target.value})} />
              </div>
            </div>
          )}

          {/* Working Hours & Off Days */}
          <div className="pt-4 border-t border-gray-800">
            <h4 className="text-sm font-medium text-white mb-3">Schedule & Off Days</h4>
            
            <div className="mb-4">
              <label className="block text-xs text-gray-500 mb-2">Off Days (Closed)</label>
              <div className="flex flex-wrap gap-2">
                {DAYS.map((day, index) => (
                  <label key={day} className={cn(
                    "px-3 py-1.5 rounded-lg border text-xs cursor-pointer transition-colors",
                    settings.offDays.includes(index) ? "bg-red-500/20 border-red-500/50 text-red-400" : "bg-[#1a1a1a] border-gray-700 text-gray-400 hover:border-gray-500"
                  )}>
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={settings.offDays.includes(index)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSettings({ ...settings, offDays: [...settings.offDays, index] });
                        } else {
                          setSettings({ ...settings, offDays: settings.offDays.filter(d => d !== index) });
                        }
                      }}
                    />
                    {day}
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-xs text-gray-500 mb-1">Working Hours Start</label>
                <input type="time" className="w-full px-3 py-2 rounded-lg border border-gray-700 bg-[#1a1a1a] text-white outline-none" value={settings.workingHoursStart} onChange={e => setSettings({...settings, workingHoursStart: e.target.value})} />
              </div>
              <div className="flex-1">
                <label className="block text-xs text-gray-500 mb-1">Working Hours End</label>
                <input type="time" className="w-full px-3 py-2 rounded-lg border border-gray-700 bg-[#1a1a1a] text-white outline-none" value={settings.workingHoursEnd} onChange={e => setSettings({...settings, workingHoursEnd: e.target.value})} />
              </div>
            </div>
          </div>

          {/* Time Slots Section */}
          <div className="pt-4 border-t border-gray-800">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-orange-500" /> Time Slots
              </span>
              <button
                type="button"
                onClick={handleAddSlot}
                className="text-xs font-medium text-orange-500 hover:text-orange-400 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Slot
              </button>
            </div>
            
            {settings.slots.length > 0 ? (
              <div className="space-y-3">
                {settings.slots.map((slot, index) => (
                  <div key={index} className="flex items-center gap-2 bg-[#1a1a1a] p-3 rounded-xl border border-gray-700">
                    <div className="flex-1">
                      <label className="block text-[10px] text-gray-500 mb-1 uppercase tracking-wider">Start</label>
                      <input
                        type="time"
                        required
                        className="w-full px-2 py-1.5 rounded-md border border-gray-600 bg-[#121212] text-white text-sm outline-none"
                        value={slot.startTime}
                        onChange={e => handleSlotChange(index, 'startTime', e.target.value)}
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-[10px] text-gray-500 mb-1 uppercase tracking-wider">End</label>
                      <input
                        type="time"
                        required
                        className="w-full px-2 py-1.5 rounded-md border border-gray-600 bg-[#121212] text-white text-sm outline-none"
                        value={slot.endTime}
                        onChange={e => handleSlotChange(index, 'endTime', e.target.value)}
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-[10px] text-gray-500 mb-1 uppercase tracking-wider">Limit</label>
                      <input
                        type="number"
                        min="1"
                        placeholder="Max"
                        className="w-full px-2 py-1.5 rounded-md border border-gray-600 bg-[#121212] text-white text-sm outline-none"
                        value={slot.limit}
                        onChange={e => handleSlotChange(index, 'limit', e.target.value)}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveSlot(index)}
                      className="mt-4 p-1.5 text-red-500 hover:bg-red-500/10 rounded-md transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-500">No time slots defined. The door will be active at all times (except quiet hours).</p>
            )}
          </div>

          <div className="pt-2 border-t border-gray-800">
            <Link to="/contacts" className="text-sm text-orange-500 hover:text-orange-400 font-medium">Manage Blocked Visitors</Link>
          </div>
        </div>

        {/* Smart Rules */}
        <div className="bg-[#121212] p-5 rounded-3xl border border-gray-800 space-y-4">
          <h3 className="font-bold text-white mb-2 flex items-center gap-2">
            <Shield className="w-5 h-5 text-green-500" /> Smart Rules
          </h3>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-300">Delivery Mode</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={settings.deliveryMode} onChange={e => setSettings({...settings, deliveryMode: e.target.checked})} />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
            </label>
          </div>

          {settings.deliveryMode && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-200">
              <label className="block text-sm text-gray-300 mb-2">Delivery Message</label>
              <input
                type="text"
                className="w-full px-4 py-3 rounded-xl border border-gray-700 bg-[#1a1a1a] text-white focus:ring-2 focus:ring-orange-500 outline-none text-sm"
                placeholder="e.g. Please leave packages at the front desk"
                value={settings.deliveryMessage}
                onChange={e => setSettings({...settings, deliveryMessage: e.target.value})}
              />
            </div>
          )}

          {(settings.quietHours || (settings.workingHoursStart && settings.workingHoursEnd)) && (
            <>
              <div className="flex items-center justify-between pt-2 border-t border-gray-800">
                <span className="text-sm text-gray-300">Emergency Bypass (Quiet/Off Hours)</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={settings.emergencyBypass} onChange={e => setSettings({...settings, emergencyBypass: e.target.checked})} />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                </label>
              </div>

              <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                <label className="block text-sm text-gray-300 mb-2">After Hour Message</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 rounded-xl border border-gray-700 bg-[#1a1a1a] text-white focus:ring-2 focus:ring-orange-500 outline-none text-sm"
                  placeholder="e.g. We are currently closed. In case of emergency, ring anyway."
                  value={settings.afterHourMessage}
                  onChange={e => setSettings({...settings, afterHourMessage: e.target.value})}
                />
              </div>
            </>
          )}

          <div className="pt-4 border-t border-gray-800">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-white flex items-center gap-2">
                Custom Visitor Fields
              </span>
              <button
                type="button"
                onClick={handleAddCustomField}
                className="text-xs font-medium text-orange-500 hover:text-orange-400 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Field
              </button>
            </div>

            {settings.customFields.length > 0 ? (
              <div className="space-y-3">
                {settings.customFields.map((field, index) => (
                  <div key={field.id} className="bg-[#1a1a1a] p-3 rounded-xl border border-gray-700 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 space-y-2">
                        <input
                          type="text"
                          placeholder="Field Label (e.g. Company Name)"
                          className="w-full px-3 py-2 rounded-lg border border-gray-600 bg-[#121212] text-white text-sm outline-none"
                          value={field.label}
                          onChange={e => handleCustomFieldChange(index, 'label', e.target.value)}
                        />
                        <select
                          className="w-full px-3 py-2 rounded-lg border border-gray-600 bg-[#121212] text-white text-sm outline-none"
                          value={field.type}
                          onChange={e => handleCustomFieldChange(index, 'type', e.target.value)}
                        >
                          {FIELD_TYPES.map(ft => (
                            <option key={ft.value} value={ft.value}>{ft.label}</option>
                          ))}
                        </select>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveCustomField(index)}
                        className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={field.required}
                        onChange={e => handleCustomFieldChange(index, 'required', e.target.checked)}
                        className="rounded border-gray-600 bg-[#121212] text-orange-500 focus:ring-orange-500"
                      />
                      Required field
                    </label>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-500">No custom fields added.</p>
            )}
          </div>
        </div>

        {/* Alert and Sound */}
        <div className="bg-[#121212] p-5 rounded-3xl border border-gray-800">
          <h3 className="font-bold text-white mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5 text-purple-500" /> Alert and Sound
          </h3>
          <select
            className="w-full px-4 py-3 rounded-xl border border-gray-700 bg-[#1a1a1a] text-white focus:ring-2 focus:ring-orange-500 outline-none"
            value={settings.alertSound}
            onChange={e => setSettings({...settings, alertSound: e.target.value})}
          >
            <option value="DEFAULT">Default</option>
            <option value="DOORBELL">Door Bell</option>
            <option value="CHIME">Chime</option>
            <option value="URGENT">Urgent</option>
          </select>
        </div>

        {/* QR And Security */}
        <div className="bg-[#121212] p-5 rounded-3xl border border-gray-800 space-y-4">
          <h3 className="font-bold text-white mb-2 flex items-center gap-2">
            <QrCode className="w-5 h-5 text-white" /> QR & Security
          </h3>
          
          <button onClick={() => navigate(`/qrs/door-${id}/design`)} className="w-full bg-[#1a1a1a] border border-gray-700 hover:bg-[#222] text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors">
            <Download className="w-4 h-4" /> Download QR
          </button>
          
          <button onClick={handleRegenerate} className="w-full bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-500 py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors">
            <RefreshCw className="w-4 h-4" /> Regenerate QR
          </button>
        </div>

        {/* Advance and Management */}
        <div className="bg-[#121212] p-5 rounded-3xl border border-gray-800 space-y-4">
          <h3 className="font-bold text-white mb-2 flex items-center gap-2">
            <Settings className="w-5 h-5 text-gray-400" /> Advance & Management
          </h3>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Rename Door</label>
            <input
              type="text"
              className="w-full px-4 py-3 rounded-xl border border-gray-700 bg-[#1a1a1a] text-white focus:ring-2 focus:ring-orange-500 outline-none"
              value={settings.doorName}
              onChange={e => setSettings({...settings, doorName: e.target.value})}
            />
          </div>

          <button className="w-full bg-[#1a1a1a] border border-gray-700 hover:bg-[#222] text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors">
            <MapPin className="w-4 h-4" /> Set Door Location
          </button>

          <button className="w-full bg-[#1a1a1a] border border-gray-700 hover:bg-[#222] text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors">
            <Share2 className="w-4 h-4" /> Generate Invite Code
          </button>

          <button onClick={handleDelete} className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors mt-4">
            <Trash2 className="w-5 h-5" /> Delete This Door
          </button>
        </div>

      </div>
      )}
    </div>
  );
}
