const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

const allowedOrigins = [
  'http://localhost:5500',
  'http://127.0.0.1:5500',
  'https://stefanfodolica.github.io'
];

app.use(cors({
  origin: allowedOrigins
}));

app.use(express.json());

// Middleware to remove trailing slashes
app.use((req, res, next) => {
  if (req.path.substr(-1) === '/' && req.path.length > 1) {
    const query = req.url.slice(req.path.length);
    res.redirect(301, req.path.slice(0, -1) + query);
  } else {
    next();
  }
});

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'https://stefanfodolica.github.io');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

app.use((req, res, next) => {
  console.log(`Received request for ${req.method} ${req.url}`);
  next();
});

let leaderboards = {
  1: [], // Easy
  2: [], // Normal
  3: [], // Bosnian
};

app.get('/', (req, res) => {
  res.send('Snake Game Server is running');
});

app.post('/api/score', (req, res) => {
  const { name, score, difficulty } = req.body;
  if (!leaderboards[difficulty]) {
    return res.status(400).json({ success: false, message: 'Invalid difficulty level' });
  }
  leaderboards[difficulty].push({ name, score });
  leaderboards[difficulty].sort((a, b) => b.score - a.score);
  leaderboards[difficulty] = leaderboards[difficulty].slice(0, 10);
  res.json({ success: true });
});

app.get('/api/leaderboard/:difficulty', (req, res) => {
  const { difficulty } = req.params;
  if (!leaderboards[difficulty]) {
    return res.status(400).json({ success: false, message: 'Invalid difficulty level' });
  }
  res.json(leaderboards[difficulty]);
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
