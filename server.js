const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

app.use(cors({
  origin: ['http://localhost:5500', 'http://127.0.0.1:5500', 'https://StefanFodolica.github.io']
}));
app.use(express.json());

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'https://stefanfodolica.github.io');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
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
  leaderboards[difficulty].push({ name, score });
  leaderboards[difficulty].sort((a, b) => b.score - a.score);
  leaderboards[difficulty] = leaderboards[difficulty].slice(0, 10);
  res.json({ success: true });
});

app.get('/api/leaderboard/:difficulty', (req, res) => {
  const { difficulty } = req.params;
  res.json(leaderboards[difficulty]);
});



app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

