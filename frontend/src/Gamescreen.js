import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './Gamescreen.css';

const GameScreen = ({ mode, onReturn }) => {
  const [question, setQuestion] = useState(null);
  const [score, setScore] = useState(0);
  const [guess, setGuess] = useState('');
  const [fallback, setFallback] = useState({ name: '', flag: '' });

  const fetchRandomCountry = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/countries/random?mode=flag');
      return res.data.country || res.data || { name: 'Unknown', flag: 'https://flagcdn.com/w320/xx.png' };
    } catch (error) {
      console.error('Error fetching random country:', error);
      return { name: 'Unknown', flag: 'https://flagcdn.com/w320/xx.png' };
    }
  };

  const fetchQuestion = useCallback(async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/countries/random?mode=${mode}`);
      console.log('API Response:', res.data);
      if (mode === 'name') {
        const { country, otherFlags } = res.data;
        const allFlags = [
          { flag: country.flag, name: country.name, isCorrect: true },
          ...otherFlags.map(flag => ({ ...flag, isCorrect: false })),
        ].sort(() => Math.random() - 0.5);
        setQuestion({ country, allFlags });
      } else if (mode === 'flag') {
        const country = res.data.country || res.data;
        if (!country || !country.flag) {
          throw new Error('Invalid country data in flag mode');
        }
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
    fetchQuestion();
  }, [fetchQuestion, mode]);

  const handleGuess = (selectedName) => {
    if (!question || !question.country) return;

    const isCorrect = selectedName === question.country.name;
    if (isCorrect) {
      setScore((prevScore) => prevScore + 1);
    }
    fetchQuestion();
  };

  const handleGuessSubmit = async (e) => {
    e.preventDefault();
    if (!question || !question.country || !guess.trim()) return;

    try {
      const res = await axios.post('http://localhost:5000/api/check-answer', {
        guess: guess.trim(),
        countryName: question.country.name,
        mode: 'flag',
      });
      console.log('Check Answer Response:', res.data);
      if (res.data.correct) {
        setScore((prevScore) => prevScore + 1);
      }
      fetchQuestion();
    } catch (error) {
      console.error('Error checking answer:', error);
    }
  };

  // Add hover effects using a pseudo-class workaround
  const addHoverEffects = () => {
    document.querySelectorAll('img[style*="cursor: pointer"]').forEach((el) => {
      el.addEventListener('mouseover', () => {
        el.style.transform = 'scale(1.1)';
        el.style.boxShadow = '0 5px 10px rgba(0, 0, 0, 0.2)';
      });
      el.addEventListener('mouseout', () => {
        el.style.transform = 'scale(1)';
        el.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.1)';
      });
    });

    document.querySelectorAll('button').forEach((el) => {
      el.addEventListener('mouseover', () => {
        if (el.style.backgroundColor === '#ff6b6b') {
          el.style.backgroundColor = '#acb6e5';
        } else {
          el.style.backgroundColor = '#acb6e5';
        }
        el.style.transform = 'translateY(-2px)';
      });
      el.addEventListener('mouseout', () => {
        if (el.style.backgroundColor === '#acb6e5' && el.textContent === 'Return') {
          el.style.backgroundColor = '#ff6b6b';
        } else {
          el.style.backgroundColor = '#74ebd5';
        }
        el.style.transform = 'translateY(0)';
      });
    });

    document.querySelectorAll('input').forEach((el) => {
      el.addEventListener('focus', () => {
        el.style.borderColor = '#74ebd5';
      });
      el.addEventListener('blur', () => {
        el.style.borderColor = '#ddd';
      });
    });
  };

  // Call hover effects after render
  useEffect(() => {
    addHoverEffects();
  }, [question]);

  if (!question || !question.country) {
    return <div style={styles.loading}>Loading...</div>;
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>🌍 Country Quiz Challenge</h1>
      <div style={styles.gameBox}>
        {mode === 'name' && (
          <div style={styles.modeContainer}>
            <h2 style={styles.countryName}>{question.country.name || fallback.name || 'Random Country'}</h2>
            <div style={styles.flagsContainer}>
              {question.allFlags.map((flagObj, index) => (
                <img
                  key={`${flagObj.name}-${index}`}
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
              src={question.country.flag || fallback.flag || 'https://flagcdn.com/w320/xx.png'}
              alt="Flag"
              style={styles.singleFlag}
              onError={(e) => {
                console.error('Image failed to load, using fallback');
                e.target.src = fallback.flag || 'https://flagcdn.com/w320/xx.png';
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
        <p style={styles.score}>Score: {score}</p>
        <button
          style={styles.returnButton}
          onClick={onReturn}
          onMouseOver={(e) => {
            e.target.style.backgroundColor = '#acb6e5';
            e.target.style.transform = 'translateY(-2px)';
          }}
          onMouseOut={(e) => {
            e.target.style.backgroundColor = '#ff6b6b';
            e.target.style.transform = 'translateY(0)';
          }}
        >
          Return
        </button>
      </div>
    </div>
  );
};

// Inline styles (unchanged)
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
    fontSize: '3rem',
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
    fontSize: '1.8rem',
    color: '#333',
    marginBottom: '20px',
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
    borderRadius: '5px',
    transition: 'transform 0.2s, box-shadow 0.2s',
    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
  },
  singleFlag: {
    width: '120px',
    height: '70px',
    borderRadius: '5px',
    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
  },
  form: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
  },
  input: {
    padding: '10px',
    fontSize: '1rem',
    border: '2px solid #ddd',
    borderRadius: '5px',
    outline: 'none',
    width: '200px',
    transition: 'border-color 0.2s',
  },
  button: {
    padding: '10px 20px',
    fontSize: '1rem',
    backgroundColor: '#74ebd5',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'background-color 0.2s, transform 0.1s',
    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
  },
  returnButton: {
    marginTop: '20px',
    padding: '10px 20px',
    fontSize: '1rem',
    backgroundColor: '#ff6b6b',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'background-color 0.2s, transform 0.1s',
    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
  },
  score: {
    fontSize: '1.2rem',
    color: '#555',
    marginTop: '20px',
  },
  loading: {
    fontSize: '1.5rem',
    color: '#fff',
    textAlign: 'center',
  },
};

export default GameScreen;