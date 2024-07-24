const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;
const LEADERBOARD_FILE = path.join(__dirname, 'leaderboards.json');

// Middleware
app.use(cors({
  origin: ['http://localhost:5500', 'http://127.0.0.1:5500']
}));
app.use(express.json());

// Load leaderboards from file or initialize if file doesn't exist
let leaderboards;
try {
  const data = fs.readFileSync(LEADERBOARD_FILE, 'utf8');
  leaderboards = JSON.parse(data);
} catch (error) {
  leaderboards = {
    1: [], // Easy
    2: [], // Normal
    3: [], // Bosnian
  };
}

// Function to save leaderboards to file
function saveLeaderboards() {
  fs.writeFileSync(LEADERBOARD_FILE, JSON.stringify(leaderboards), 'utf8');
}

// Routes
app.post('/api/score', (req, res) => {
  const { name, score, difficulty } = req.body;
  leaderboards[difficulty].push({ name, score });
  leaderboards[difficulty].sort((a, b) => b.score - a.score);
  leaderboards[difficulty] = leaderboards[difficulty].slice(0, 10);
  saveLeaderboards(); // Save after updating
  res.json({ success: true });
});

app.get('/api/leaderboard/:difficulty', (req, res) => {
  const { difficulty } = req.params;
  res.json(leaderboards[difficulty]);
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
