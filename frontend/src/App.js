import React, { useState } from 'react';
import GameScreen from './Gamescreen';
import './App.css';

const App = () => {
  const [mode, setMode] = useState(null);

  const handleReturn = () => {
    setMode(null); // Reset mode to show homepage
  };

  
    return (
      <>
        {mode ? (
          <GameScreen mode={mode} onReturn={handleReturn} />
        ) : (
          <div className="container">
            <h1 className="title">🌍 Country Quiz Challenge</h1>
            <div className="button-container">
              <button className="button" onClick={() => setMode('name')}>
                Guess the Flag
              </button>
              <button className="button" onClick={() => setMode('flag')}>
                Guess the Country
              </button>
              <button className="button" onClick={() => setMode('moving')}>
                Catch the Moving Flag
              </button>
              <button className="button" onClick={() => setMode('streak')}>
                Flag Streak Challenge
              </button>
            </div>
          </div>
        )}
      </>
    );
  };

export default App;