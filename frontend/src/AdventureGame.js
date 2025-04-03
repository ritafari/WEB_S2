import React, { useState, useEffect, useRef } from 'react';
import GameScreen from './Gamescreen';
import TimedFlagGame from './TimedFlagMiniGame';
import './AdventureGame.css';

const AdventureGame = ({ onReturnToMenu }) => {
  const [selectedModes, setSelectedModes] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [gameStatus, setGameStatus] = useState('playing');
  const [showChallenge, setShowChallenge] = useState(false);
  const [nodePosition, setNodePosition] = useState({ x: 0, y: 0 });
  const [showTutorial, setShowTutorial] = useState(true);
  const [highestStreak, setHighestStreak] = useState(
    parseInt(localStorage.getItem('highestStreak')) || 0
  );
  const nodeRefs = useRef([]);

  const mapNodes = [
    { id: 1, top: '75%', left: '15%', terrain: 'forest' },
    { id: 2, top: '50%', left: '35%', terrain: 'mountain' },
    { id: 3, top: '25%', left: '65%', terrain: 'volcano' },
    { id: 4, top: '10%', left: '85%', terrain: 'castle' }
  ];

  useEffect(() => {
    const modes = ['name', 'flag', 'moving', 'streak', 'timed'];
    const selected = [];
    while (selected.length < 3) {
      const randomMode = modes[Math.floor(Math.random() * modes.length)];
      if (!selected.includes(randomMode)) selected.push(randomMode);
    }
    setSelectedModes(selected);
  }, []);

  useEffect(() => {
    if (selectedModes.length > 0) {
      setShowTutorial(true);
    }
  }, [currentStep, selectedModes]);

  const handleNodeClick = (index) => {
    const node = nodeRefs.current[index];
    if (node && index === currentStep) {
      const rect = node.getBoundingClientRect();
      setNodePosition({
        x: rect.left + window.scrollX,
        y: rect.top + window.scrollY
      });
      setShowChallenge(true);
      setShowTutorial(false);
    }
  };

  const handleGameWon = () => {
    if (currentStep < 2) {
      setCurrentStep(prev => prev + 1);
      setShowChallenge(false);
      setShowTutorial(true);
    } else {
      const newStreak = currentStep + 1;
      if (newStreak > highestStreak) {
        localStorage.setItem('highestStreak', newStreak);
        setHighestStreak(newStreak);
      }
      setGameStatus('won');
    }
  };

  const handleGameLost = () => {
    if (currentStep + 1 > highestStreak) {
      localStorage.setItem('highestStreak', currentStep + 1);
      setHighestStreak(currentStep + 1);
    }
    setGameStatus('lost');
    setShowChallenge(false);
  };

  const resetAdventure = () => {
    const modes = ['name', 'flag', 'moving', 'streak', 'timed'];
    const selected = [];
    while (selected.length < 3) {
      const randomMode = modes[Math.floor(Math.random() * modes.length)];
      if (!selected.includes(randomMode)) selected.push(randomMode);
    }
    setSelectedModes(selected);
    setCurrentStep(0);
    setGameStatus('playing');
    setShowTutorial(true);
  };

  const getModeInstructions = (mode) => {
    const instructions = {
      name: 'Match the country name to its flag!',
      flag: 'Guess the country from its flag!',
      moving: 'Click the correct moving flag!',
      streak: `Maintain a streak! (Highest: ${highestStreak})`,
      timed: 'Quick! Beat the clock!'
    };
    return instructions[mode] || 'Complete the challenge!';
  };

  if (gameStatus === 'won') {
    return (
      <div className="adventure-result won">
        <h1>🏆 Kingdom Conquered! 🏆</h1>
        <div className="action-buttons">
          <button onClick={resetAdventure}>Play Again</button>
          <button onClick={onReturnToMenu}>Main Menu</button>
        </div>
      </div>
    );
  }

  if (gameStatus === 'lost') {
    return (
      <div className="adventure-result lost">
        <h1>💀 Expedition Failed! 💀</h1>
        <div className="action-buttons">
          <button onClick={resetAdventure}>Try Again</button>
          <button onClick={onReturnToMenu}>Main Menu</button>
        </div>
      </div>
    );
  }

  return (
    <div className="adventure-container">
      <div className="world-map">
        {mapNodes.map((node, index) => (
          <div
            key={node.id}
            ref={el => nodeRefs.current[index] = el}
            className={`map-node ${node.terrain} ${index <= currentStep ? 'active' : ''}`}
            style={{ 
              top: node.top, 
              left: node.left,
              animation: index === currentStep ? 'node-pulse 1.5s infinite' : 'none'
            }}
            onClick={() => handleNodeClick(index)}
          >
            {index < 3 && selectedModes[index] && (
              <div className="challenge-indicator">
                {selectedModes[index] === 'name' && '🏴'}
                {selectedModes[index] === 'flag' && '📝'}
                {selectedModes[index] === 'moving' && '🏃'}
                {selectedModes[index] === 'streak' && `🔥 ${highestStreak}`}
                {selectedModes[index] === 'timed' && '⏳'}
              </div>
            )}
          </div>
        ))}
        <div 
          className="map-character" 
          style={{
            ...mapNodes[currentStep],
            transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        >
          ⚔️
        </div>
      </div>

      {showTutorial && selectedModes.length > 0 && (
        <div className="tutorial-overlay">
          <div className="tutorial-content">
            <h2>Challenge #{currentStep + 1}</h2>
            <h3>{getModeInstructions(selectedModes[currentStep])}</h3>
            <button onClick={() => setShowTutorial(false)}>
              Start Challenge
            </button>
          </div>
        </div>
      )}

      {showChallenge && selectedModes[currentStep] && (
        <div 
          className="challenge-modal"
          style={{
            top: `${Math.min(nodePosition.y, window.innerHeight - 400)}px`,
            left: `${Math.max(20, Math.min(nodePosition.x, window.innerWidth - 420))}px`,
          }}
        >
          <div className="challenge-content">
            {selectedModes[currentStep] === 'timed' ? (
              <TimedFlagGame 
                onReturnToMenu={onReturnToMenu}
                onGameWon={handleGameWon}
                onGameLost={handleGameLost}
                embedded={true}
              />
            ) : (
              <GameScreen
                mode={selectedModes[currentStep]}
                onGameWon={handleGameWon}
                onGameLost={handleGameLost}
                suppressResults={true}
                embedded={true}
                SCORE_TO_WIN={10}
                STREAK_TO_WIN={5}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdventureGame;