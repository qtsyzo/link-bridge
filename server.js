import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());

// store: deviceId → code and status
const devices = new Map();

function generateCode() {
  const num = Math.floor(1_000_000 + Math.random() * 9_000_000);
  return `SYZO-${num}`;
}

// --- Generate or fetch a device code ---
app.get('/new-code', (req, res) => {
  const device = req.query.device;
  if (!device) return res.status(400).json({ error: 'Missing device ID' });

  // if already has a code, return it
  if (devices.has(device)) {
    const existing = devices.get(device);
    return res.json({
      code: existing.code,
      used: existing.used,
    });
  }

  // create a new permanent code for this device
  const code = generateCode();
  devices.set(device, { code, used: false });
  console.log(`✅ New device linked code: ${device} → ${code}`);
  res.json({ code, used: false });
});

// --- Verify linking ---
app.get('/verify', (req, res) => {
  const { code, discord } = req.query;
  if (!code || !discord)
    return res.status(400).json({ error: 'Missing code or discord ID' });

  // find device by code
  const entry = [...devices.entries()].find(
    ([, data]) => data.code === code
  );

  if (!entry) {
    console.log(`❌ Invalid code: ${code}`);
    return res.json({ valid: false });
  }

  const [device, data] = entry;

  if (data.used) {
    console.log(`⚠️ Already linked: ${device}`);
    return res.json({ valid: false, reason: 'Already linked' });
  }

  // mark as linked
  data.used = true;
  data.discord = discord;
  devices.set(device, data);

  console.log(`✅ Linked ${discord} ↔️ ${device}`);
  res.json({ valid: true });
});

app.listen(8080, () => console.log('🔗 link bridge listening on :8080'));
