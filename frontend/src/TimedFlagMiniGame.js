import { useState, useEffect } from 'react';
import axios from 'axios';
import './TimedFlagMiniGame.css';

function TimedFlagGame({ onReturnToMenu }) {
    const [currentFlag, setCurrentFlag] = useState(null);
    const [correctGuesses, setCorrectGuesses] = useState(0);
    const [guess, setGuess] = useState('');
    const [timeLeft, setTimeLeft] = useState(45); // Default to medium
    const [gameOver, setGameOver] = useState(false);
    const [gameWon, setGameWon] = useState(false);
    const [difficulty, setDifficulty] = useState('medium');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const FLAGS_TO_WIN = 5;

    const timeLimits = {
        easy: 60,
        medium: 45,
        hard: 30
    };

    const fetchFlag = async () => {
        setLoading(true);
        try {
            const res = await axios.get('http://localhost:5001/api/countries/random?mode=flag');
            setCurrentFlag(res.data.country || res.data || { name: 'Unknown', flag: 'https://flagcdn.com/w320/xx.png' });
            setLoading(false);
        } catch (error) {
            console.error('Error fetching random country:', error);
            setCurrentFlag({ name: 'Unknown', flag: 'https://flagcdn.com/w320/xx.png' });
            setLoading(false);
        }
    };

    // Load initial flag
    useEffect(() => {
        fetchFlag();
    }, []);

    // Timer logic
    useEffect(() => {
        if (timeLeft > 0 && !gameOver && !gameWon && !loading) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timer);
        } else if (timeLeft === 0 && !gameWon) {
            setGameOver(true);
        }
    }, [timeLeft, gameOver, gameWon, loading]);

    const resetGame = () => {
        setCorrectGuesses(0);
        setGuess('');
        setGameOver(false);
        setGameWon(false);
        setTimeLeft(timeLimits[difficulty]);
        setMessage('');
        fetchFlag();
    };

    const handleGuess = async (e) => {
        e.preventDefault();
        if (gameOver || gameWon || loading) return;

        if (guess.trim().toLowerCase() === currentFlag.name.toLowerCase()) {
            // Correct guess
            const newCorrectCount = correctGuesses + 1;
            setCorrectGuesses(newCorrectCount);
            setMessage('Correct!');

            // Check if player has won
            if (newCorrectCount === FLAGS_TO_WIN) {
                setGameWon(true);
                return;
            }

            // Load next flag
            await fetchFlag();
            setGuess('');
            setMessage('');
        } else {
            setMessage('Incorrect. Try again!');
        }
    };

    if (loading && !currentFlag) {
        return <div className="loading">Loading game...</div>;
    }
    
    if (gameOver) {
        return (
            <div className="game-result-container game-over">
                <div className="game-result-content">
                    <h1>Game Over!</h1>
                    <div className="score-display">
                        <p>You guessed <span className="highlight">{correctGuesses}</span> out of <span className="highlight">{FLAGS_TO_WIN}</span> flags correctly</p>
                        <p>The correct answer was: <strong>{currentFlag.name}</strong></p>
                    </div>
                    <div className="action-buttons">
                        <button onClick={resetGame} className="action-button">
                            Play Again
                        </button>
                        <button onClick={onReturnToMenu} className="action-button">
                            Main Menu
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (gameWon) {
        return (
            <div className="game-result-container game-won">
                <div className="game-result-content">
                    <h1>Congratulations! 🎉</h1>
                    <h2>You Won!</h2>
                    <div className="score-display">
                        <p>You guessed all <span className="highlight">{FLAGS_TO_WIN}</span> flags correctly!</p>
                        <p>Time remaining: <span className="highlight">{timeLeft}s</span></p>
                    </div>
                    <div className="action-buttons">
                        <button onClick={resetGame} className="action-button">
                            Play Again
                        </button>
                        <button onClick={onReturnToMenu} className="action-button">
                            Main Menu
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="Timer-Flag-MiniGame">
            <div className="game-info">
                <div className="timer" style={{ color: timeLeft < 10 ? 'red' : timeLeft < 20 ? 'orange' : 'green' }}>
                    Time: {timeLeft}s
                </div>
                <div className="progress">
                    Flags: {correctGuesses}/{FLAGS_TO_WIN}
                </div>
            </div>
            
            <div className="flag-container">
                {loading ? (
                    <div className="loading">Loading flag...</div>
                ) : (
                    <img src={currentFlag.flag} alt="Flag" className="flag-image" />
                )}
            </div>

            <form onSubmit={handleGuess} className="guess-form">
                <input
                    type="text"
                    value={guess}
                    onChange={(e) => setGuess(e.target.value)}
                    placeholder="Enter country name"
                    autoFocus
                    disabled={loading}
                    className="guess-input"
                />
                <button type="submit" disabled={loading} className="submit-button">
                    {loading ? 'Loading...' : 'Submit'}
                </button>
            </form>

            {message && <div className={`message ${message === 'Correct!' ? 'correct' : 'incorrect'}`}>{message}</div>}

            <div className="difficulty-selector">
                <label className="difficulty-label">Difficulty:</label>
                <select 
                    value={difficulty} 
                    onChange={(e) => {
                        setDifficulty(e.target.value); 
                        setTimeLeft(timeLimits[e.target.value]);
                    }}
                    disabled={correctGuesses > 0}
                    className="difficulty-dropdown"
                >
                    <option value="easy">Easy (60s)</option>
                    <option value="medium">Medium (45s)</option>
                    <option value="hard">Hard (30s)</option>
                </select>
            </div>
        </div>
    );
}

export default TimedFlagGame;