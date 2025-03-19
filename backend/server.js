const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

const countries = require('./data.json');

app.get('/api/countries/random', (req, res) => {
  const mode = req.query.mode; // Get mode from query parameter
  const randomCountry = countries[Math.floor(Math.random() * countries.length)];

  if (mode === 'name') {
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
  } else {
    res.status(400).json({ error: 'Invalid mode' });
  }
});

app.post('/api/check-answer', (req, res) => {
  const { guess, countryName, mode } = req.body;
  if (mode === 'flag') {
    res.json({ correct: guess.toLowerCase() === countryName.toLowerCase() });
  } else if (mode === 'name') {
    res.json({ correct: guess === countryName }); // Compare flag name directly
  } else {
    res.status(400).json({ error: 'Invalid mode' });
  }
});

app.listen(5000, () => console.log('Server running on port 5000'));