import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '30mb' }));

// SSE clients list for real-time multi-device broadcast
let sseClients: express.Response[] = [];

// Shared state file path to persist across server restarts and devices
const DB_FILE = path.resolve(__dirname, '.lims_db.json');

// In-memory server authoritative store
let serverState: Record<string, any> = {};
let revision = Date.now();

// Load from disk if exists
try {
  if (fs.existsSync(DB_FILE)) {
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    serverState = JSON.parse(data);
  }
} catch (err) {
  console.warn('Could not read existing DB file:', err);
}

function persistState() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(serverState, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write DB file:', err);
  }
}

function broadcastUpdate(sourceDeviceId?: string) {
  revision = Date.now();
  const payload = JSON.stringify({ type: 'SYNC_UPDATE', revision, sourceDeviceId });
  sseClients.forEach((client) => {
    try {
      client.write(`data: ${payload}\n\n`);
    } catch {
      // client disconnected
    }
  });
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', revision, connectedClients: sseClients.length });
});

// Full state sync
app.get('/api/sync', (req, res) => {
  res.json({
    revision,
    state: serverState,
  });
});

// Post state updates from any device
app.post('/api/sync', (req, res) => {
  const { updates, deviceId } = req.body;
  if (updates && typeof updates === 'object') {
    serverState = {
      ...serverState,
      ...updates,
    };
    persistState();
    broadcastUpdate(deviceId);
  }
  res.json({ success: true, revision, state: serverState });
});

// Server-Sent Events stream for instant real-time pushes across all devices
app.get('/api/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  res.write(`data: ${JSON.stringify({ type: 'CONNECTED', revision })}\n\n`);

  sseClients.push(res);

  req.on('close', () => {
    sseClients = sseClients.filter((client) => client !== res);
  });
});

async function main() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`EnamelCook LIMS multi-user server running on http://0.0.0.0:${PORT}`);
  });
}

main().catch((err) => {
  console.error('Failed to start server:', err);
});
