import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());

const activeCodes = new Map();

// generate SYZO-<7digit> where number is between 1000000 and 9999999
function generateCode() {
  const num = Math.floor(1_000_000 + Math.random() * 9_000_000);
  return `SYZO-${num}`;
}

app.get('/new-code', (req, res) => {
  const code = generateCode();

  if (activeCodes.has(code)) {
    return res.json({ code: generateCode(), expiresIn: 60 });
  }

  const timeout = setTimeout(() => {
    activeCodes.delete(code);
    console.log(`🕒 Code expired: ${code}`);
  }, 60_000);

  activeCodes.set(code, { createdAt: Date.now(), timeout });
  console.log(`✅ Generated: ${code}`);

  res.json({ code, expiresIn: 60 });
});

app.get('/verify', (req, res) => {
  const { code } = req.query;
  if (activeCodes.has(code)) {
    activeCodes.delete(code);
    res.json({ valid: true });
  } else {
    res.json({ valid: false });
  }
});

app.listen(8080, () => console.log('🔗 link bridge listening on :8080'));
