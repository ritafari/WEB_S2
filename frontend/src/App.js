import React, { useState } from 'react';
import GameScreen from './Gamescreen';
import './App.css';

const App = () => {
  const [mode, setMode] = useState(null);

  const handleReturn = () => {
    setMode(null); // Reset mode to show homepage
  };

  if (mode) {
    return <GameScreen mode={mode} onReturn={handleReturn} />;
  }

  return (
    <div className="container">
      <h1 className="title">🌍 Country Quiz Challenge</h1>
      <div className="button-container">
        <button className="button" onClick={() => setMode('name')}>
          Guess the Flag
        </button>
        <button className="button" onClick={() => setMode('flag')}>
          Guess the Country
        </button>
      </div>
    </div>
  );
};

export default App;