import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import './Gamescreen.css';

const GameOverPage = ({ score, onReturn, onPlayAgain }) => {
  return (
    <div className="game-over-container">
      <div className="game-over-content">
        <h1>Game Over</h1>
        <p className="final-score">Your Score: {score}</p>
        <div className="game-over-actions">
          <button onClick={onPlayAgain} className="menu-button">
            Play Again
          </button>
          <button onClick={onReturn} className="menu-button">
            Return to Main Menu
          </button>
        </div>
      </div>
    </div>
  );
};

const WinningPage = ({ score, onReturn, onPlayAgain }) => {
  return (
    <div className="winning-container">
      <div className="winning-content">
        <h1>Congratulations!</h1>
        <h2>You Won!</h2>
        <p className="final-score">Your Score: {score}</p>
        <div className="winning-actions">
          <button onClick={onPlayAgain} className="menu-button">
            Play Again
          </button>
          <button onClick={onReturn} className="menu-button">
            Return to Main Menu
          </button>
        </div>
      </div>
    </div>
  );
};

const GameScreen = ({ mode, onReturn, onGameWon, onGameLost, suppressResults = false }) => {
  const [question, setQuestion] = useState(null);
  const [score, setScore] = useState(0);
  const [guess, setGuess] = useState('');
  const [fallback, setFallback] = useState({ name: '', flag: '' });
  const [flags, setFlags] = useState([]);
  const [targetCountry, setTargetCountry] = useState('');
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [lives, setLives] = useState(5);
  const [streak, setStreak] = useState(0);
  const [highestStreak, setHighestStreak] = useState(
    () => parseInt(localStorage.getItem('highestStreak')) || 0
  );
  const animationFrameRef = useRef(null);
  const headerRef = useRef(null);

  const SCORE_TO_WIN = 10;
  const STREAK_TO_WIN = 5;

  useEffect(() => {
    if (mode === 'streak' && streak > highestStreak) {
      localStorage.setItem('highestStreak', streak);
      setHighestStreak(streak);
    }
  }, [streak, highestStreak, mode]);

  const fetchRandomCountry = async () => {
    try {
      const res = await axios.get('http://localhost:5001/api/countries/random?mode=flag');
      return res.data.country || { name: 'Unknown', flag: 'https://flagcdn.com/w320/xx.png' };
    } catch (error) {
      console.error('Error fetching random country:', error);
      return { name: 'Unknown', flag: 'https://flagcdn.com/w320/xx.png' };
    }
  };

  const resetGame = useCallback(() => {
    setScore(0);
    setGameOver(false);
    setGameWon(false);
    setLives(5);
    fetchQuestion();
    setStreak(0);
  }, [mode]);

  const fetchQuestion = useCallback(async () => {
    try {
      const res = await axios.get(`http://localhost:5001/api/countries/random?mode=${mode}`);
      
      if (mode === 'name' || mode === 'streak') {
        const { country, otherFlags } = res.data;
        const allFlags = [
          { flag: country.flag, name: country.name, isCorrect: true },
          ...otherFlags.map(flag => ({ ...flag, isCorrect: false })),
        ].sort(() => Math.random() - 0.5);
        setQuestion({ country, allFlags });
      } 
      else if (mode === 'flag') {
        const country = res.data.country;
        if (!country?.flag) throw new Error('Invalid country data');
        setQuestion({ country });
      }
      else if (mode === 'moving') {
        const { country, otherFlags } = res.data;
        const headerHeight = headerRef.current?.getBoundingClientRect().height || 80; // Default to 80px if not yet rendered
        
        const initialFlags = [
          ...otherFlags.slice(0, 49).map(flag => ({
            ...flag,
            x: Math.random() * window.innerWidth,
            y: headerHeight + Math.random() * (window.innerHeight - headerHeight),
            vx: (Math.random() - 0.5) * 3,
            vy: (Math.random() - 0.5) * 3,
            isCorrect: false
          })),
          {
            ...country,
            code: country.code + '_TARGET',
            x: Math.random() * window.innerWidth,
            y: headerHeight + Math.random() * (window.innerHeight - headerHeight),
            vx: (Math.random() - 0.5) * 3,
            vy: (Math.random() - 0.5) * 3,
            isCorrect: true
          }
        ].sort(() => Math.random() - 0.5);
        
        setTargetCountry(country.name);
        setFlags(initialFlags);
        setQuestion({ country });
      }
      
      setGuess('');
    } catch (error) {
      console.error('Error fetching question:', error);
      const randomCountry = await fetchRandomCountry();
      setFallback(randomCountry);
      setQuestion({ country: randomCountry });
    }
  }, [mode]);

  useEffect(() => {
    if (gameWon && onGameWon) onGameWon();
  }, [gameWon, onGameWon]);

  useEffect(() => {
    if (gameOver && onGameLost) onGameLost();
  }, [gameOver, onGameLost]);

  useEffect(() => {
    const fetchData = async () => {
      await fetchQuestion();
    };
    fetchData();
  }, [fetchQuestion]);
  
  useEffect(() => {
    resetGame();
  }, [mode, resetGame]);

  useEffect(() => {
    const animate = () => {
      const headerHeight = headerRef.current?.getBoundingClientRect().height || 80;

      setFlags(prevFlags => {
        const updatedFlags = prevFlags.map(flag => {
          let newX = flag.x + flag.vx;
          let newY = flag.y + flag.vy;
          let newVx = flag.vx;
          let newVy = flag.vy;

          if (newX <= 0 || newX >= window.innerWidth - 80) newVx *= -1;
          if (newY <= headerHeight || newY >= window.innerHeight - 50) newVy *= -1;

          return {
            ...flag,
            x: Math.max(0, Math.min(window.innerWidth - 80, newX)),
            y: Math.max(headerHeight, Math.min(window.innerHeight - 50, newY)),
            vx: newVx,
            vy: newVy
          };
        });
        return updatedFlags;
      });
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    if (mode === 'moving') {
      animationFrameRef.current = requestAnimationFrame(animate);
    }
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [mode]);

  const handleFlagClick = (clickedFlag) => {
    if (clickedFlag.isCorrect) {
      const newScore = score + 1;
      setScore(newScore);
      if (newScore >= SCORE_TO_WIN) {
        setGameWon(true);
      } else {
        fetchQuestion();
      }
    } else {
      const newLives = lives - 1;
      setLives(newLives);
      if (newLives <= 0) {
        setGameOver(true);
      }
    }
  };

  const handleGuess = (selectedName) => {
    if (!question?.country) return;
    
    if (selectedName === question.country.name) {
      const newScore = score + 1;
      setScore(newScore);
      
      if (mode === 'streak') {
        const newStreak = streak + 1;
        setStreak(newStreak);
        if (newStreak >= STREAK_TO_WIN) {
          setGameWon(true);
        } else {
          fetchQuestion();
        }
      } else if (mode === 'name') {
        if (newScore >= SCORE_TO_WIN) {
          setGameWon(true);
        } else {
          fetchQuestion();
        }
      }
    } else {
      if (mode === 'streak') {
        setStreak(0);
        fetchQuestion();
      } else {
        const newLives = lives - 1;
        setLives(newLives);
        if (newLives <= 0) {
          setGameOver(true);
        }
      }
    }
  };

  const handleGuessSubmit = async (e) => {
    e.preventDefault();
    if (!question?.country || !guess.trim()) return;

    try {
      const res = await axios.post('http://localhost:5001/api/check-answer', {
        guess: guess.trim(),
        countryName: question.country.name,
        mode: 'flag',
      });
      
      if (res.data.correct) {
        const newScore = score + 1;
        setScore(newScore);
        if (newScore >= SCORE_TO_WIN) {
          setGameWon(true);
        } else {
          fetchQuestion();
        }
      } else {
        const newLives = lives - 1;
        setLives(newLives);
        if (newLives <= 0) {
          setGameOver(true);
        }
      }
    } catch (error) {
      console.error('Error checking answer:', error);
    }
  };

  if (mode === 'moving') {
    return (
      <div className="full-screen-container">
        {flags.map((flag) => (
          <img
            key={flag.code}
            src={flag.flag}
            alt="flag"
            className={`moving-flag ${flag.isCorrect ? 'correct' : ''}`}
            style={{
              transform: `translate(${flag.x}px, ${flag.y}px)`,
            }}
            onClick={() => handleFlagClick(flag)}
          />
        ))}
        <div className="header" ref={headerRef}>
          <div className="stats-container">
            <p className="score">Score: {score}</p>
            <p className="lives">Lives: {lives}</p>
            <p className="target-header">
              FIND: <span className="target-country">{targetCountry}</span>
            </p>
          </div>
          <button className="return-button" onClick={onReturn}>
            Return to Menu
          </button>
        </div>
        {!suppressResults && gameOver && (
          <GameOverPage 
            score={score}
            onReturn={onReturn}
            onPlayAgain={resetGame}
          />
        )}
        {!suppressResults && gameWon && (
          <WinningPage 
            score={score}
            onReturn={onReturn}
            onPlayAgain={resetGame}
          />
        )}
      </div>
    );
  }

  if (!question || !question.country) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="container">
      <h1 className="title">🌍 Country Quiz Challenge</h1>
      <div className="game-box">
        {(mode === 'name' || mode === 'streak') && (
          <div className="mode-container">
            <h2 className="country-name">{question.country.name}</h2>
            <div className="flags-container">
              {question.allFlags?.map((flagObj, index) => (
                <img
                  key={`flag-${index}`}
                  src={flagObj.flag}
                  alt={`Flag ${index + 1}`}
                  className="flag"
                  onClick={() => handleGuess(flagObj.name)}
                />
              ))}
            </div>
          </div>
        )}

        {mode === 'flag' && (
          <div className="mode-container">
            <img
              src={question.country.flag}
              alt="Flag"
              className="single-flag"
              onError={(e) => {
                e.target.src = fallback.flag;
              }}
            />
            <form onSubmit={handleGuessSubmit} className="form">
              <input
                type="text"
                value={guess}
                onChange={(e) => setGuess(e.target.value)}
                placeholder="Type the country name"
                className="input"
              />
              <button type="submit" className="button">Submit</button>
            </form>
          </div>
        )}

        <div className="footer">
          <p className="score">
            {mode === 'streak' ? `Streak: ${streak}` : `Score: ${score}`}
          </p>
          {mode === 'streak' && (
            <p className="highest-streak">Highest Streak: {highestStreak}</p>
          )}
          {mode !== 'streak' && <p className="lives">Lives: {lives}</p>}
          <button 
            className="return-button"
            onClick={onReturn}
          >
            Return to Menu
          </button>
        </div>
      </div>
      {!suppressResults && gameOver && (
        <GameOverPage 
          score={mode === 'streak' ? streak : score}
          onReturn={onReturn}
          onPlayAgain={resetGame}
        />
      )}
      {!suppressResults && gameWon && (
        <WinningPage 
          score={mode === 'streak' ? streak : score}
          onReturn={onReturn}
          onPlayAgain={resetGame}
        />
      )}
    </div>
  );
};

export default GameScreen;