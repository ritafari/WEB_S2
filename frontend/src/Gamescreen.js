import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import './Gamescreen.css';

// Game Over Component
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

// Winning Component
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

const GameScreen = ({ mode, onReturn }) => {
  const [question, setQuestion] = useState(null);
  const [score, setScore] = useState(0);
  const [guess, setGuess] = useState('');
  const [fallback, setFallback] = useState({ name: '', flag: '' });
  const [flags, setFlags] = useState([]);
  const [targetCountry, setTargetCountry] = useState('');
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [lives, setLives] = useState(5); // Add lives for game over condition
  const animationFrameRef = useRef(null);

  const SCORE_TO_WIN = 10; // Set winning condition

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
  }, [mode]);

  const fetchQuestion = useCallback(async () => {
    try {
      const res = await axios.get(`http://localhost:5001/api/countries/random?mode=${mode}`);
      
      if (mode === 'name') {
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
        
        const initialFlags = [
          ...otherFlags.map(flag => ({
            ...flag,
            x: Math.random() * 500,
            y: Math.random() * 500,
            vx: (Math.random() - 0.5) * 8,
            vy: (Math.random() - 0.5) * 8,
            isCorrect: false
          })),
          {
            ...country,
            code: country.code + '_TARGET', 
            x: Math.random() * 500,
            y: Math.random() * 500,
            vx: (Math.random() - 0.5) * 8,
            vy: (Math.random() - 0.5) * 8,
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
    resetGame();
  }, [mode, resetGame]);

  useEffect(() => {
    const animate = () => {
      setFlags(prevFlags => prevFlags.map(flag => {
        let newX = flag.x + flag.vx;
        let newY = flag.y + flag.vy;
        let newVx = flag.vx;
        let newVy = flag.vy;

        if (newX <= 0 || newX >= 500) newVx *= -1;
        if (newY <= 0 || newY >= 400) newVy *= -1;

        return {
          ...flag,
          x: Math.max(0, Math.min(500, newX)),
          y: Math.max(0, Math.min(400, newY)),
          vx: newVx,
          vy: newVy
        };
      }));
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    if (mode === 'moving' && !gameOver && !gameWon) {
      animationFrameRef.current = requestAnimationFrame(animate);
    }
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [mode, gameOver, gameWon]);

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

  if (gameOver) {
    return (
      <GameOverPage 
        score={score}
        onReturn={onReturn}
        onPlayAgain={resetGame}
      />
    );
  }

  if (gameWon) {
    return (
      <WinningPage 
        score={score}
        onReturn={onReturn}
        onPlayAgain={resetGame}
      />
    );
  }

  if (!question || !question.country) {
    return <div style={styles.loading}>Loading...</div>;
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>🌍 Country Quiz Challenge</h1>
      <div style={styles.gameBox}>
        {mode === 'name' && (
          <div style={styles.modeContainer}>
            <h2 style={styles.countryName}>{question.country.name}</h2>
            <div style={styles.flagsContainer}>
              {question.allFlags?.map((flagObj, index) => (
                <img
                  key={`flag-${index}`}
                  src={flagObj.flag}
                  alt={`Flag ${index + 1}`}
                  style={styles.flag}
                  onClick={() => handleGuess(flagObj.name)}
                />
              ))}
            </div>
          </div>
        )}

        {mode === 'flag' && (
          <div style={styles.modeContainer}>
            <img
              src={question.country.flag}
              alt="Flag"
              style={styles.singleFlag}
              onError={(e) => {
                e.target.src = fallback.flag;
              }}
            />
            <form onSubmit={handleGuessSubmit} style={styles.form}>
              <input
                type="text"
                value={guess}
                onChange={(e) => setGuess(e.target.value)}
                placeholder="Type the country name"
                style={styles.input}
              />
              <button type="submit" style={styles.button}>Submit</button>
            </form>
          </div>
        )}

        {mode === 'moving' && (
          <div style={styles.movingContainer}>
            <div style={styles.targetHeader}>
              FIND: <span style={styles.targetCountry}>{targetCountry}</span>
            </div>
            <div style={styles.flagsArea}>
              {flags.map((flag) => (
                <img
                  key={flag.code}
                  src={flag.flag}
                  alt="flag"
                  style={{
                    ...styles.flag,
                    position: 'absolute',
                    left: flag.x,
                    top: flag.y,
                    border: flag.isCorrect ? '3px solid #27ae60' : 'none',
                    boxShadow: flag.isCorrect ? '0 0 20px rgba(39, 174, 96, 0.6)' : 'none',
                    transform: `scale(${flag.isCorrect ? 1.15 : 1})`,
                  }}
                  onClick={() => handleFlagClick(flag)}
                />
              ))}
            </div>
          </div>
        )}

        <div style={styles.footer}>
          <p style={styles.score}>Score: {score}</p>
          <p style={styles.lives}>Lives: {lives}</p>
          <button 
            style={styles.returnButton}
            onClick={onReturn}
          >
            Return to Menu
          </button>
        </div>
      </div>
    </div>
  );
};


const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #74ebd5, #acb6e5)',
    fontFamily: "'Poppins', sans-serif",
    padding: '20px',
  },
  title: {
    fontSize: '2.5rem',
    color: '#fff',
    textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)',
    marginBottom: '30px',
    textAlign: 'center',
  },
  gameBox: {
    backgroundColor: '#fff',
    borderRadius: '15px',
    padding: '30px',
    boxShadow: '0 10px 20px rgba(0, 0, 0, 0.2)',
    maxWidth: '600px',
    width: '100%',
    textAlign: 'center',
  },
  modeContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '20px',
  },
  countryName: {
    fontSize: '2rem',
    color: '#2c3e50',
    fontWeight: '600',
    margin: '20px 0',
  },
  flagsContainer: {
    display: 'flex',
    gap: '15px',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  flag: {
    width: '100px',
    height: '60px',
    cursor: 'pointer',
    borderRadius: '8px',
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
  },
  singleFlag: {
    width: '160px',
    height: '100px',
    borderRadius: '10px',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.15)',
  },
  form: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: '20px',
  },
  input: {
    padding: '12px 20px',
    fontSize: '1rem',
    border: '2px solid #ddd',
    borderRadius: '25px',
    width: '250px',
    transition: 'all 0.3s ease',
  },
  button: {
    padding: '12px 25px',
    fontSize: '1rem',
    backgroundColor: '#74ebd5',
    color: '#fff',
    border: 'none',
    borderRadius: '25px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  movingContainer: {
    position: 'relative',
    height: '500px',
    width: '100%',
    overflow: 'hidden',
    borderRadius: '15px',
    backgroundColor: '#f8f9fa',
    margin: '20px 0',
  },
  targetHeader: {
    fontSize: '1.8rem',
    color: '#2c3e50',
    margin: '20px 0',
    padding: '15px 30px',
    backgroundColor: '#fff',
    borderRadius: '30px',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
    display: 'inline-block',
  },
  targetCountry: {
    color: '#27ae60',
    fontWeight: '700',
    textShadow: '0 2px 4px rgba(39, 174, 96, 0.2)',
  },
  flagsArea: {
    position: 'relative',
    height: '400px',
    width: '500px',
    margin: '0 auto',
  },
  footer: {
    marginTop: '30px',
    borderTop: '2px solid #eee',
    paddingTop: '20px',
  },
  score: {
    fontSize: '1.4rem',
    color: '#555',
    fontWeight: '600',
    margin: '15px 0',
  },
  returnButton: {
    padding: '12px 30px',
    fontSize: '1rem',
    backgroundColor: '#ff6b6b',
    color: '#fff',
    border: 'none',
    borderRadius: '25px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  loading: {
    fontSize: '1.5rem',
    color: '#fff',
    textAlign: 'center',
  },
};

export default GameScreen;