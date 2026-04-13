import express from 'express';
import { createServer as createViteServer } from 'vite';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';

// --- In-Memory Database Simulation ---
const qrs: any[] = [
  { 
    id: 'qr-1', 
    name: 'Main Gate', 
    slug: 'main-gate-123', 
    mode: 'BELL',
    validFrom: null,
    validUntil: null,
    visitorLimit: null,
    currentVisitors: 0,
    slots: [],
    sharedWith: []
  },
  { 
    id: 'qr-2', 
    name: 'Reception Queue', 
    slug: 'reception-q-456', 
    mode: 'QUEUE',
    validFrom: null,
    validUntil: null,
    visitorLimit: null,
    currentVisitors: 0,
    slots: [],
    sharedWith: []
  }
];

const interactions: any[] = [];
const queueSessions: any[] = [
  { id: 'session-1', qrId: 'qr-2', isActive: true, currentTokenNo: 0, tokens: [] }
];
const members: any[] = [
  { id: 'm-1', name: 'Admin User', role: 'Owner', email: 'admin@example.com' }
];
const contacts: any[] = [];

async function startServer() {
  const app = express();
  const PORT = 3000;
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: { origin: '*' }
  });

  app.use(express.json());

  // --- API Routes ---

  // Members API
  app.get('/api/members', (req, res) => res.json(members));
  app.post('/api/members', (req, res) => {
    const newMember = { id: `m-${Date.now()}`, name: req.body.name, role: req.body.role, email: req.body.email };
    members.push(newMember);
    res.json(newMember);
  });

  // Contacts API
  app.get('/api/contacts', (req, res) => res.json(contacts));
  app.post('/api/contacts', (req, res) => {
    const newContact = { id: `c-${Date.now()}`, name: req.body.name, note: req.body.note, createdAt: new Date().toISOString() };
    contacts.push(newContact);
    res.json(newContact);
  });

  // List all QRs
  app.get('/api/qrs', (req, res) => {
    res.json(qrs);
  });

  // Create a new QR
  app.post('/api/qrs', (req, res) => {
    const { name, mode, validFrom, validUntil, visitorLimit, slots, sharedWith, isSeasonal, seasonType, customData } = req.body;
    const newQr = {
      id: `qr-${Date.now()}`,
      name: name || 'Untitled QR',
      slug: `qr-${Math.random().toString(36).substring(2, 8)}`,
      mode: mode || 'BELL',
      validFrom: validFrom || null,
      validUntil: validUntil || null,
      visitorLimit: visitorLimit ? parseInt(visitorLimit, 10) : null,
      workingHours: req.body.workingHours || null,
      offDays: req.body.offDays || [],
      isSeasonal: isSeasonal || false,
      seasonType: seasonType || null,
      customFields: req.body.customFields || [],
      customData: customData || null,
      currentVisitors: 0,
      sharedWith: sharedWith || [],
      slots: slots ? slots.map((s: any) => ({
        id: `slot-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        startTime: s.startTime,
        endTime: s.endTime,
        limit: s.limit ? parseInt(s.limit, 10) : null,
        currentVisitors: 0
      })) : []
    };
    qrs.push(newQr);

    if (newQr.mode === 'QUEUE') {
      queueSessions.push({
        id: `session-${Date.now()}`,
        qrId: newQr.id,
        isActive: true,
        currentTokenNo: 0,
        tokens: []
      });
    }

    res.json(newQr);
  });

  // Update an existing QR
  app.put('/api/qrs/:id', (req, res) => {
    const { 
      name, mode, validFrom, validUntil, visitorLimit, slots, sharedWith, 
      workingHours, offDays, isSeasonal, seasonType, customFields, customData,
      deliveryMode, deliveryMessage, afterHourMessage, emergencyBypass,
      quietHours, quietHoursStart, quietHoursEnd, requireName, requireSelfie, alertSound
    } = req.body;
    
    const index = qrs.findIndex(q => q.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'QR not found' });

    const qr = qrs[index];
    qr.name = name || qr.name;
    qr.mode = mode || qr.mode;
    qr.validFrom = validFrom !== undefined ? validFrom : qr.validFrom;
    qr.validUntil = validUntil !== undefined ? validUntil : qr.validUntil;
    qr.visitorLimit = visitorLimit ? parseInt(visitorLimit, 10) : null;
    qr.workingHours = workingHours !== undefined ? workingHours : qr.workingHours;
    qr.offDays = offDays !== undefined ? offDays : qr.offDays;
    qr.sharedWith = sharedWith || qr.sharedWith;
    qr.isSeasonal = isSeasonal !== undefined ? isSeasonal : qr.isSeasonal;
    qr.seasonType = seasonType !== undefined ? seasonType : qr.seasonType;
    qr.customFields = customFields !== undefined ? customFields : qr.customFields;
    qr.customData = customData !== undefined ? customData : qr.customData;
    
    // New settings
    qr.deliveryMode = deliveryMode !== undefined ? deliveryMode : qr.deliveryMode;
    qr.deliveryMessage = deliveryMessage !== undefined ? deliveryMessage : qr.deliveryMessage;
    qr.afterHourMessage = afterHourMessage !== undefined ? afterHourMessage : qr.afterHourMessage;
    qr.emergencyBypass = emergencyBypass !== undefined ? emergencyBypass : qr.emergencyBypass;
    qr.quietHours = quietHours !== undefined ? quietHours : qr.quietHours;
    qr.quietHoursStart = quietHoursStart !== undefined ? quietHoursStart : qr.quietHoursStart;
    qr.quietHoursEnd = quietHoursEnd !== undefined ? quietHoursEnd : qr.quietHoursEnd;
    qr.requireName = requireName !== undefined ? requireName : qr.requireName;
    qr.requireSelfie = requireSelfie !== undefined ? requireSelfie : qr.requireSelfie;
    qr.alertSound = alertSound !== undefined ? alertSound : qr.alertSound;
    
    if (slots) {
      qr.slots = slots.map((s: any) => ({
        id: s.id || `slot-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        startTime: s.startTime,
        endTime: s.endTime,
        limit: s.limit ? parseInt(s.limit, 10) : null,
        currentVisitors: s.currentVisitors || 0
      }));
    }

    res.json(qr);
  });

  // Delete a QR
  app.delete('/api/qrs/:id', (req, res) => {
    const index = qrs.findIndex(q => q.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'QR not found' });
    
    qrs.splice(index, 1);
    res.json({ success: true });
  });

  // Get QR by slug
  app.get('/api/qr/:slug', (req, res) => {
    const qr = qrs.find(q => q.slug === req.params.slug);
    if (qr) res.json(qr);
    else res.status(404).json({ error: 'QR not found' });
  });

  // Submit Visitor Interaction (Phase 1A)
  app.post('/api/interactions/:slug', (req, res) => {
    const qr = qrs.find(q => q.slug === req.params.slug);
    if (!qr) return res.status(404).json({ error: 'QR not found' });

    const now = new Date();
    if (qr.validFrom && new Date(qr.validFrom) > now) {
      return res.status(400).json({ error: 'QR code is not active yet' });
    }
    if (qr.validUntil && new Date(qr.validUntil) < now) {
      return res.status(400).json({ error: 'QR code has expired' });
    }
    
    // Check Off Days
    if (qr.offDays && qr.offDays.includes(now.getDay())) {
      return res.status(400).json({ error: 'This door is closed today (Off Day)' });
    }

    // Check Working Hours
    if (qr.workingHours && qr.workingHours.start && qr.workingHours.end) {
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const currentTimeStr = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
      if (currentTimeStr < qr.workingHours.start || currentTimeStr > qr.workingHours.end) {
        return res.status(400).json({ error: `Outside of working hours (${qr.workingHours.start} - ${qr.workingHours.end})` });
      }
    }

    if (qr.visitorLimit && qr.currentVisitors >= qr.visitorLimit) {
      return res.status(400).json({ error: 'Visitor limit reached for this QR' });
    }

    let activeSlot = null;
    if (qr.slots && qr.slots.length > 0) {
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const currentTimeStr = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
      
      activeSlot = qr.slots.find((s: any) => currentTimeStr >= s.startTime && currentTimeStr <= s.endTime);
      
      if (!activeSlot) {
        return res.status(400).json({ error: 'QR code is not active at this time' });
      }
      
      if (activeSlot.limit && activeSlot.currentVisitors >= activeSlot.limit) {
        return res.status(400).json({ error: 'Visitor limit reached for the current time slot' });
      }
    }

    if (activeSlot) {
      activeSlot.currentVisitors += 1;
    }
    qr.currentVisitors += 1;

    const interaction = {
      id: `int-${Date.now()}`,
      qrId: qr.id,
      qrName: qr.name,
      visitorName: req.body.visitorName || 'Anonymous',
      purpose: req.body.purpose || '',
      location: req.body.location || null,
      customData: req.body.customData || {},
      status: 'NEW',
      createdAt: new Date().toISOString()
    };
    interactions.push(interaction);

    // Simulate sending notifications to shared members
    if (qr.sharedWith && qr.sharedWith.length > 0) {
      const sharedMembers = members.filter(m => qr.sharedWith.includes(m.id));
      sharedMembers.forEach(member => {
        console.log(`[NOTIFICATION] Sending alert to ${member.name} (${member.email}) for QR: ${qr.name}`);
      });
    }

    // Emit live alert to dashboard
    io.emit('visitor_arrived', interaction);

    res.json(interaction);
  });

  // Get Interactions (Inbox)
  app.get('/api/interactions', (req, res) => {
    res.json(interactions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  });

  // Mark Interaction Handled
  app.post('/api/interactions/:id/handle', (req, res) => {
    const interaction = interactions.find(i => i.id === req.params.id);
    if (!interaction) return res.status(404).json({ error: 'Not found' });

    interaction.status = 'HANDLED';
    interaction.handledAt = new Date().toISOString();

    io.emit('interaction_updated', interaction);
    res.json(interaction);
  });

  // Quick Reply to Interaction
  app.post('/api/interactions/:id/reply', (req, res) => {
    const interaction = interactions.find(i => i.id === req.params.id);
    if (!interaction) return res.status(404).json({ error: 'Not found' });

    interaction.reply = req.body.reply;
    interaction.repliedAt = new Date().toISOString();

    io.emit('interaction_updated', interaction);
    res.json(interaction);
  });

  // Generate Queue Token (Phase 1B)
  app.post('/api/queue/:slug/generate', (req, res) => {
    const qr = qrs.find(q => q.slug === req.params.slug);
    if (!qr) return res.status(404).json({ error: 'QR not found' });

    const now = new Date();
    if (qr.validFrom && new Date(qr.validFrom) > now) {
      return res.status(400).json({ error: 'QR code is not active yet' });
    }
    if (qr.validUntil && new Date(qr.validUntil) < now) {
      return res.status(400).json({ error: 'QR code has expired' });
    }

    // Check Off Days
    if (qr.offDays && qr.offDays.includes(now.getDay())) {
      return res.status(400).json({ error: 'This door is closed today (Off Day)' });
    }

    // Check Working Hours
    if (qr.workingHours && qr.workingHours.start && qr.workingHours.end) {
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const currentTimeStr = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
      if (currentTimeStr < qr.workingHours.start || currentTimeStr > qr.workingHours.end) {
        return res.status(400).json({ error: `Outside of working hours (${qr.workingHours.start} - ${qr.workingHours.end})` });
      }
    }

    if (qr.visitorLimit && qr.currentVisitors >= qr.visitorLimit) {
      return res.status(400).json({ error: 'Visitor limit reached for this QR' });
    }

    let activeSlot = null;
    if (qr.slots && qr.slots.length > 0) {
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const currentTimeStr = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
      
      activeSlot = qr.slots.find((s: any) => currentTimeStr >= s.startTime && currentTimeStr <= s.endTime);
      
      if (!activeSlot) {
        return res.status(400).json({ error: 'QR code is not active at this time' });
      }
      
      if (activeSlot.limit && activeSlot.currentVisitors >= activeSlot.limit) {
        return res.status(400).json({ error: 'Visitor limit reached for the current time slot' });
      }
    }

    const session = queueSessions.find(s => s.qrId === qr.id && s.isActive);
    if (!session) return res.status(404).json({ error: 'No active queue session' });

    if (activeSlot) {
      activeSlot.currentVisitors += 1;
    }
    qr.currentVisitors += 1;
    session.currentTokenNo += 1;
    const token = {
      id: `token-${Date.now()}`,
      sessionId: session.id,
      tokenNumber: session.currentTokenNo,
      displayName: `T-${session.currentTokenNo}`,
      status: 'WAITING',
      createdAt: new Date().toISOString()
    };
    session.tokens.push(token);

    io.emit('queue_updated', { sessionId: session.id, tokens: session.tokens });
    res.json(token);
  });

  // Get Queue Session
  app.get('/api/queue/:qrId', (req, res) => {
    const session = queueSessions.find(s => s.qrId === req.params.qrId && s.isActive);
    if (!session) return res.status(404).json({ error: 'Not found' });
    res.json(session);
  });

  // Call Queue Token
  app.post('/api/queue/token/:id/call', (req, res) => {
    let foundToken = null;
    let foundSession = null;

    for (const session of queueSessions) {
      const token = session.tokens.find((t: any) => t.id === req.params.id);
      if (token) {
        token.status = 'CALLED';
        foundToken = token;
        foundSession = session;
        break;
      }
    }

    if (!foundToken) return res.status(404).json({ error: 'Not found' });

    io.emit('queue_token_called', foundToken);
    io.emit('queue_updated', { sessionId: foundSession.id, tokens: foundSession.tokens });
    res.json(foundToken);
  });

  // Complete Queue Token
  app.post('/api/queue/token/:id/complete', (req, res) => {
    let foundToken = null;
    let foundSession = null;

    for (const session of queueSessions) {
      const token = session.tokens.find((t: any) => t.id === req.params.id);
      if (token) {
        token.status = 'COMPLETED';
        foundToken = token;
        foundSession = session;
        break;
      }
    }

    if (!foundToken) return res.status(404).json({ error: 'Not found' });

    io.emit('queue_updated', { sessionId: foundSession.id, tokens: foundSession.tokens });
    res.json(foundToken);
  });


  // --- WebSocket Handling ---
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  // --- Vite Middleware ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
