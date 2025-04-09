const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
const app = express();

app.use(cors());
app.use(express.json());

const countries = require('./data.json');
const leaderboardFile = path.join(__dirname, 'leaderboard.json');

const readLeaderboard = async () => {
  console.log('Attempting to read leaderboard file from:', leaderboardFile);
  try {
    const data = await fs.readFile(leaderboardFile, 'utf8');
    console.log('Raw file content:', data);
    const leaderboard = JSON.parse(data);
    console.log('Parsed leaderboard:', leaderboard);
    return leaderboard;
  } catch (error) {
    console.error('Error reading leaderboard file:', error.message);
    return [];
  }
};

const writeLeaderboard = async (data) => {
  console.log('Writing leaderboard to file:', data);
  try {
    await fs.writeFile(leaderboardFile, JSON.stringify(data, null, 2), 'utf8');
    console.log('Leaderboard successfully written');
  } catch (error) {
    console.error('Error writing leaderboard:', error.message);
    throw error;
  }
};

// Test route to ensure server is alive
app.get('/test', (req, res) => {
  console.log('GET /test endpoint hit');
  res.json({ message: 'Server is running' });
});

app.get('/api/leaderboard', async (req, res) => {
  console.log('GET /api/leaderboard endpoint hit');
  try {
    const leaderboard = await readLeaderboard();
    console.log('Sending leaderboard response:', leaderboard);
    res.json(leaderboard);
  } catch (error) {
    console.error('Error in GET /api/leaderboard:', error.message);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

app.post('/api/leaderboard', async (req, res) => {
  console.log('POST /api/leaderboard received:', req.body);
  const { name, streak } = req.body;

  // Validate input
  if (!name || typeof streak !== 'number' || !Number.isInteger(streak)) {
    console.error('Invalid request body:', req.body);
    return res.status(400).json({ error: 'Name must be a string and streak must be an integer' });
  }

  // Reject streaks less than 2
  if (streak < 2) {
    console.log(`Streak ${streak} is less than 2; not saving to leaderboard`);
    return res.status(200).json({
      success: false,
      message: `Streak ${streak} must be 2 or greater to be saved`,
      leaderboard: await readLeaderboard()
    });
  }

  try {
    const leaderboard = await readLeaderboard();
    leaderboard.push({ name, streak });
    leaderboard.sort((a, b) => b.streak - a.streak);
    const top10 = leaderboard.slice(0, 10);
    await writeLeaderboard(top10);
    console.log('Leaderboard updated and saved with new entry:', { name, streak });
    res.json({ success: true, leaderboard: top10 });
  } catch (error) {
    console.error('Error in POST /api/leaderboard:', error.message);
    res.status(500).json({ error: 'Failed to update leaderboard' });
  }
});

// Other endpoints (unchanged)
app.get('/api/countries/random', (req, res) => {
  const mode = req.query.mode;
  const randomCountry = countries[Math.floor(Math.random() * countries.length)];
  if (mode === 'name' || mode === 'streak') {
    const otherFlags = [];
    while (otherFlags.length < 4) {
      const randomFlag = countries[Math.floor(Math.random() * countries.length)];
      if (
        randomFlag.name !== randomCountry.name &&
        !otherFlags.some((flag) => flag.name === randomFlag.name)
      ) {
        otherFlags.push({ flag: randomFlag.flag, name: randomFlag.name });
      }
    }
    res.json({ country: randomCountry, otherFlags });
  } else if (mode === 'flag') {
    res.json({ country: randomCountry });
  } else if (mode === 'moving') {
    const otherFlags = [];
    while (otherFlags.length < 49) {
      const randomFlag = countries[Math.floor(Math.random() * countries.length)];
      if (
        randomFlag.name !== randomCountry.name &&
        !otherFlags.some((flag) => flag.name === randomFlag.name)
      ) {
        otherFlags.push({ flag: randomFlag.flag, name: randomFlag.name });
      }
    }
    res.json({ country: randomCountry, otherFlags });
  } else {
    res.status(400).json({ error: 'Invalid mode' });
  }
});

app.post('/api/check-answer', (req, res) => {
  const { guess, countryName, mode } = req.body;
  if (mode === 'flag') {
    res.json({ correct: guess.toLowerCase() === countryName.toLowerCase() });
  } else if (mode === 'name') {
    res.json({ correct: guess === countryName });
  } else {
    res.status(400).json({ error: 'Invalid mode' });
  }
});

app.get('/api/countries', (req, res) => {
  res.json(countries);
});

app.listen(5001, () => console.log('Server running on port 5001'));