const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dns = require('dns');
const app = express();
const port = process.env.PORT || 3000;

console.log('Starting server...');

dns.resolve('cluster0.s4lwdhe.mongodb.net', (err, addresses) => {
  if (err) {
    console.error('DNS resolution failed:', err);
  } else {
    console.log('DNS resolution successful:', addresses);
  }
});

mongoose.set('strictQuery', false);

const mongoUri = process.env.MONGODB_URI;
console.log('Attempting to connect to MongoDB with URI:', mongoUri.replace(/:([^@]+)@/, ':****@'));

mongoose.connect(mongoUri, { 
  useNewUrlParser: true, 
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 30000,
  retryWrites: true,
  retryReads: true,
}, (err) => {
  if (err) {
    console.error('MongoDB connection error:', err);
    console.error('Error details:', JSON.stringify(err, null, 2));
    console.error('Stack trace:', err.stack);
  } else {
    console.log('Connected to MongoDB');
  }
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

// Test routes
app.get('/test', (req, res) => {
  res.json({ message: 'Server is running' });
});

app.get('/db-status', (req, res) => {
  if (mongoose.connection.readyState === 1) {
    res.json({ status: 'connected' });
  } else {
    res.status(500).json({ status: 'disconnected' });
  }
});

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
    console.error('Stack trace:', error.stack);
    res.status(500).json({ success: false, message: 'Error saving score', error: error.message });
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
    console.error('Stack trace:', error.stack);
    res.status(500).json({ success: false, message: 'Error retrieving leaderboard', error: error.message });
  }
});

// Start server
const server = app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}).on('error', (err) => {
  console.error('Error starting server:', err);
  console.error('Stack trace:', err.stack);
  process.exit(1);
});

server.on('close', () => {
  console.log('Server is shutting down');
  mongoose.connection.close(() => {
    console.log('MongoDB connection closed');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
