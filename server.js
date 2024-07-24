const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const app = express();
const port = process.env.PORT || 3000;

console.log('Starting server...');

mongoose.set('strictQuery', false);

const mongoUri = process.env.MONGODB_URI;
console.log('Attempting to connect to MongoDB with URI:', mongoUri.replace(/:([^@]+)@/, ':****@'));

mongoose.connect(mongoUri, { 
  useNewUrlParser: true, 
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000 // Timeout after 5s instead of 30s
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => {
  console.error('Could not connect to MongoDB. Error details:', JSON.stringify(err, null, 2));
  process.exit(1);
});

const db = mongoose.connection;
db.on('error', (error) => {
  console.error('MongoDB connection error:', JSON.stringify(error, null, 2));
});

// Schema definition
const leaderboardSchema = new mongoose.Schema({
  name: String,
  score: Number,
  difficulty: Number
});

const LeaderboardEntry = mongoose.model('LeaderboardEntry', leaderboardSchema);

// Middleware
app.use(cors({
  origin: ['http://localhost:5500', 'http://127.0.0.1:5500', 'https://fodo-snake-40bf65a523e4.herokuapp.com']
}));
app.use(express.json());

// Routes
app.post('/api/score', async (req, res) => {
  try {
    console.log('Received score:', req.body);
    const { name, score, difficulty } = req.body;
    const newEntry = new LeaderboardEntry({ name, score, difficulty });
    await newEntry.save();
    console.log('Score saved successfully');
    res.json({ success: true });
  } catch (error) {
    console.error('Error saving score:', error);
    res.status(500).json({ success: false, message: 'Error saving score' });
  }
});

app.get('/api/leaderboard/:difficulty', async (req, res) => {
  try {
    console.log('Fetching leaderboard for difficulty:', req.params.difficulty);
    const { difficulty } = req.params;
    const leaderboard = await LeaderboardEntry.find({ difficulty: Number(difficulty) })
      .sort({ score: -1 })
      .limit(10);
    console.log('Leaderboard fetched successfully');
    res.json(leaderboard);
  } catch (error) {
    console.error('Error retrieving leaderboard:', error);
    res.status(500).json({ success: false, message: 'Error retrieving leaderboard' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}).on('error', (err) => {
  console.error('Error starting server:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Application specific logging, throwing an error, or other logic here
});
