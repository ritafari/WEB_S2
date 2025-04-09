import React, { useState } from 'react';
import GameScreen from './Gamescreen'; // Match your casing
import AdventureGame from './AdventureGame';
import TimedFlagGame from './TimedFlagMiniGame';
import LearnMode from './LearnMode'; // Ensure this matches your file name
import './App.css';

const App = () => {
  const [mode, setMode] = useState(null);

  const handleReturn = () => {
    console.log('Returning to main menu');
    setMode(null);
  };

  console.log('Current mode:', mode); // Debug mode state

  return (
    <div className="app-container">
      {mode ? (
        mode === 'adventure' ? (
          <AdventureGame onReturnToMenu={handleReturn} />
        ) : mode === 'timed' ? (
          <TimedFlagGame onReturnToMenu={handleReturn} />
        ) : mode === 'learn' ? (
          <LearnMode onReturnToMenu={handleReturn} />
        ) : (
          <GameScreen 
            mode={mode} 
            onReturn={handleReturn}
            SCORE_TO_WIN={Infinity}
            STREAK_TO_WIN={Infinity} 
          />
        )
      ) : (
        <div className="main-menu">
          <h1 className="title">🌍 World Explorer Challenge</h1>
          <div className="mode-grid">
            <button className="mode-card" onClick={() => setMode('name')}>
              <div className="card-icon">🏴</div>
              <h3>Flag Guesser</h3>
              <p>Match flags to country names</p>
            </button>
            <button className="mode-card" onClick={() => setMode('flag')}>
              <div className="card-icon">📝</div>
              <h3>Name Challenge</h3>
              <p>Identify countries from flags</p>
            </button>
            <button className="mode-card" onClick={() => setMode('moving')}>
              <div className="card-icon">🏃</div>
              <h3>Flag Chase</h3>
              <p>Catch the correct moving flag</p>
            </button>
            <button className="mode-card" onClick={() => setMode('streak')}>
              <div className="card-icon">🔥</div>
              <h3>Streak Mode</h3>
              <p>Maintain a winning streak</p>
            </button>
            <button className="mode-card" onClick={() => setMode('timed')}>
              <div className="card-icon">⏳</div>
              <h3>Timed Challenge</h3>
              <p>Guess flags against the clock</p>
            </button>
            
            <button 
              className="mode-card adventure" 
              onClick={() => setMode('adventure')}
            >
              <div className="card-icon">🗺️</div>
              <h3>World Adventure</h3>
              <p>Complete 3 challenges in a row</p>
            </button>

            <button 
              className="mode-card" 
              onClick={() => {
                
                setMode('learn');
              }}
            >
              <div className="card-icon">📚</div>
              <h3>Learn Mode</h3>
              <p>Explore and learn flags</p>
            </button>
            
          </div>
        </div>
      )}
    </div>
  );
};

export default App;