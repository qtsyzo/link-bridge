import express from 'express';
import cors from 'cors';
import crypto from 'crypto';

const app = express();
app.use(cors());

// In-memory storage for generated codes
// Example: { 'SYZO-1234': '1372939535490617436' }
const validCodes = new Map();

// Function to generate a random linking code
function generateCode() {
  const num = Math.floor(1000 + Math.random() * 9000); // random 4-digit number
  return `SYZO-${num}`;
}

// Endpoint for the game to request a new linking code
app.get('/new-code', (req, res) => {
  const code = generateCode();
  validCodes.set(code, null); // Not yet linked to anyone
  console.log(`🪄 Generated new linking code: ${code}`);
  res.json({ code });
});

// Endpoint for the bot to verify a linking code
app.get('/verify', (req, res) => {
  const { code, discord } = req.query;
  console.log(`🔍 Verification attempt: code=${code}, discord=${discord}`);

  if (validCodes.has(code)) {
    // Optionally, mark code as used (so it can’t be reused)
    validCodes.set(code, discord);
    res.json({ valid: true });
    console.log(`✅ Code ${code} accepted and linked to Discord ${discord}`);
  } else {
    res.json({ valid: false });
    console.log(`❌ Invalid or expired code: ${code}`);
  }
});

// Optional endpoint to view active codes (for debugging only)
app.get('/list-codes', (req, res) => {
  const codes = Array.from(validCodes.entries()).map(([code, user]) => ({
    code,
    linked: !!user,
  }));
  res.json(codes);
});

app.listen(8080, () => console.log('🔗 link bridge listening on :8080'));