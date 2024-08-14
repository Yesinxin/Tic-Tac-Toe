import React, { useState, useCallback, useMemo } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";

<link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap" rel="stylesheet"></link>
const BOARD_SIZE = 3;
const TOTAL_SQUARES = BOARD_SIZE * BOARD_SIZE;

function Square({ value, onClick, isWinning }) {
  return (
    <button 
      className={`square ${isWinning ? 'winning' : ''}`} 
      onClick={onClick}
    >
      {value}
    </button>
  );
}

function Board({ squares, onClick, winningLine }) {
  const renderSquare = useCallback((i) => {
    return (
      <Square
        key={i}
        value={squares[i]}
        onClick={() => onClick(i)}
        isWinning={winningLine && winningLine.includes(i)}
      />
    );
  }, [squares, onClick, winningLine]);

  return (
    <div>
      {[...Array(BOARD_SIZE)].map((_, row) => (
        <div key={row} className="board-row">
          {[...Array(BOARD_SIZE)].map((_, col) => renderSquare(row * BOARD_SIZE + col))}
        </div>
      ))}
    </div>
  );
}

function Game() {
  const [history, setHistory] = useState([Array(TOTAL_SQUARES).fill(null)]);
  const [stepNumber, setStepNumber] = useState(0);
  const [xIsNext, setXIsNext] = useState(true);

  const calculateWinner = useCallback((squares) => {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6]
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return { winner: squares[a], line: lines[i] };
      }
    }
    return squares.every(Boolean) ? { winner: 'Draw' } : null;
  }, []);

  const current = history[stepNumber];
  const winInfo = useMemo(() => calculateWinner(current), [current, calculateWinner]);

  const handleClick = useCallback((i) => {
    const newHistory = history.slice(0, stepNumber + 1);
    const currentSquares = [...newHistory[newHistory.length - 1]];
    if (calculateWinner(currentSquares) || currentSquares[i]) {
      return;
    }
    currentSquares[i] = xIsNext ? "X" : "O";
    setHistory([...newHistory, currentSquares]);
    setStepNumber(newHistory.length);
    setXIsNext(!xIsNext);
  }, [history, stepNumber, xIsNext, calculateWinner]);

  const jumpTo = useCallback((step) => {
    setStepNumber(step);
    setXIsNext(step % 2 === 0);
  }, []);

  const clearBoard = useCallback(() => {
    setHistory([Array(TOTAL_SQUARES).fill(null)]);
    setStepNumber(0);
    setXIsNext(true);
  }, []);

  const moves = useMemo(() => history.map((_, move) => {
    const desc = move ? `Go to move #${move}` : 'Go to game start';
    return (
      <li key={move}>
        <button onClick={() => jumpTo(move)} className={move === stepNumber ? 'current-move' : ''}>
          {desc}
        </button>
      </li>
    );
  }), [history, jumpTo, stepNumber]);

  let status;
  if (winInfo?.winner === 'Draw') {
    status = "Game ended in a draw";
  } else if (winInfo?.winner) {
    status = "Winner: " + winInfo.winner;
  } else {
    status = "Next player: " + (xIsNext ? "X" : "O");
  }

  return (
      <div className="game">
        <div className="game-board">
          <div className="status">{status}</div>
          <Board
            squares={current}
            onClick={handleClick}
            winningLine={winInfo?.line}
          />
          <button onClick={clearBoard} className="clear-button">Clear Board</button>
        </div>
        <div className="game-info">
          <h3>Game History</h3>
          <ol>{moves}</ol>
        </div>
      </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Game />);