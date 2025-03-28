import {useState, useEffect} from 'react';
import axios from 'axios';
import './TimedFlagMiniGame.css';

function TimedFlagGame(){
    const [currentFlag, setCurrentFlag] = useState(null);
    const [correctGuesses, setCorrectGuesses] = useState(0);
    const [guess, setGuess] = useState('');
    const [timeLeft, setTimeLeft] = useState(timeLimits.medium);
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

    //Load flags (from existing implementation)
    useEffect(() => {
        const fetchFlag = async () => {
            try{
                const res = await axios.get('http://localhost:5001/api/countries/random?mode=flag');
                setCurrentFlag(res.data.country || res.data || {name: 'Unknown', flag: 'https://flagcdn.com/w320/xx.png'});
                setLoading(false);
            } catch (error) {
                console.error('Error fetching random country:', error);
                setCurrentFlag({name: 'Unknown', flag: 'https://flagcdn.com/w320/xx.png'});
                setLoading(false);
            }
        };
        fetchFlag();
    });

    //Timer logic
    useEffect(() => {
        if (timeLeft > 0 && !gameOver && !gameWon && !loading) {
          const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
          return () => clearTimeout(timer);
        } else if (timeLeft === 0 && !gameWon) {
          setGameOver(true);
        }
      }, [timeLeft, gameOver, gameWon, loading]);

    const handleGuess = async (e) => {
        e.preventDefault();
        if (gameOver || gameWon || loading) return;

        if (guess.trim().toLowerCase() === currentFlag.name.toLowerCase()) {
            //correct guess
            const newCorrectCount = correctGuesses + 1;
            setCorrectGuesses(newCorrectCount);
            setMessage('Correct!');

            //Check if player has won
            if (newCorrectCount === FLAGS_TO_WIN) {
                setGameWon(true);
                return;
            }

            //Load next flag
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
    
    if (gameOver){
        return (
            <div className="game-over">
                <h2>Game Over!</h2>
                <p>Final Score: {correctGuesses}/{FLAGS_TO_WIN}</p>
                <p>The correct answer was: <strong>{currentFlag.name}</strong></p>
                <button onClick={() => window.location.reload()}>Play Again</button>
            </div>
        );
    }

    if (gameWon){
        return (
            <div className="game-won">
                <h2>Congratulations! You won! 🥳</h2>
                <p>FYou guessed {FLAGS_TO_WIN} correctly with {timeLeft}s remaining!</p>
                <button onClick={() => window.location.reload()}>Play Again</button>
            </div>
        );
    }

    return (
        <div className="Timer-Flag-MiniGame">
            <div className="game-info">
                <div className="timer" style={{color: timeLeft < 10 ? 'red' : timeLeft < 20 ? 'orange' : 'green'}}>
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
                    <img src={currentFlag.flag} alt="Flag" />
                )}
        </div>

        <form onSubmit={handleGuess}>
            <input
                type="text"
                value={guess}
                onChange={(e) => setGuess(e.target.value)}
                placeholder="Enter country name"
                autoFocus
                disabled={loading}
            />
            <button type="submit" disabled={loading}>
                {loading ? 'Loading...' : 'Submit'}
            </button>
        </form>

        {message && <div className="message">{message}</div>}

        <div className="difficulty">
            <label>Difficulty:</label>
            <select value={difficulty} onChange={(e) => {
                setDifficulty(e.target.value); 
                setTimeLeft(timeLimits[e.target.value]);
                }}
                disabled={correctGuesses > 0}
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