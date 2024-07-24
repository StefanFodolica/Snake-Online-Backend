

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const app = express();
const port = process.env.PORT || 3000;

mongoose.set('strictQuery', false);

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/snake_game', { 
  useNewUrlParser: true, 
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
  socketTimeoutMS: 30000 // Set the socketTimeoutMS option here
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('Could not connect to MongoDB:', err));

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

mongoose.set('socketTimeoutMS', 30000);

// Schema definition
const leaderboardSchema = new mongoose.Schema({
  name: String,
  score: Number,
  difficulty: Number
});

const LeaderboardEntry = mongoose.model('LeaderboardEntry', leaderboardSchema);

// Middleware
app.use(cors({
  origin: ['http://localhost:5500', 'http://127.0.0.1:5500', 'https://yourgamedomain.com']
}));
app.use(express.json());

// Routes
app.post('/api/score', async (req, res) => {
  try {
    const { name, score, difficulty } = req.body;
    const newEntry = new LeaderboardEntry({ name, score, difficulty });
    await newEntry.save();
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error saving score:', error);
    res.status(500).json({ success: false, message: 'Error saving score' });
  }
});

app.get('/api/leaderboard/:difficulty', async (req, res) => {
  try {
    const { difficulty } = req.params;
    const leaderboard = await LeaderboardEntry.find({ difficulty: Number(difficulty) })
      .sort({ score: -1 })
      .limit(10);
    res.json(leaderboard);
  } catch (error) {
    console.error('Error retrieving leaderboard:', error);
    res.status(500).json({ success: false, message: 'Error retrieving leaderboard' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
