import React from 'react';
import { GameStatus, type Player, GameMode } from '../types';
import { PLAYER_X, PLAYER_O, COMPUTER_PLAYER } from '../constants';

interface GameInfoPanelProps {
  gameStatus: GameStatus;
  currentPlayer: Player;
  winner: Player | null;
  isDraw: boolean;
  gameMode: GameMode | null;
  onReset: () => void;
  onChangeMode: () => void;
  aiCommentary: string | null;
  isGeminiEnabled: boolean;
  isComputerThinking: boolean;
  // Online game props
  gameId?: string | null;
  playerRoleInOnlineGame?: Player | null;
}

const GameInfoPanel: React.FC<GameInfoPanelProps> = ({
  gameStatus,
  currentPlayer,
  winner,
  isDraw,
  gameMode,
  onReset,
  onChangeMode,
  aiCommentary,
  isGeminiEnabled,
  isComputerThinking,
  gameId,
  playerRoleInOnlineGame,
}) => {
  let statusText: string;
  let statusColor = "text-slate-200";

  if (gameStatus === GameStatus.WaitingForOpponent) {
    statusText = "Waiting for opponent to join...";
    statusColor = "text-sky-400 animate-pulse";
  } else if (winner) {
    let winnerName = winner === PLAYER_X ? "Player X" : "Player O";
    if (gameMode === GameMode.PlayerVsComputer && winner === COMPUTER_PLAYER) {
      winnerName = "Computer (O)";
    } else if (gameMode === GameMode.PlayerVsPlayerOnline) {
       winnerName = winner === playerRoleInOnlineGame ? "You (Player " + winner + ")" : "Opponent (Player " + winner + ")";
    }
    statusText = `${winnerName} Wins!`;
    statusColor = winner === PLAYER_X ? "text-indigo-400" : "text-pink-400";
  } else if (isDraw) {
    statusText = "It's a Draw!";
    statusColor = "text-yellow-400";
  } else if (isComputerThinking && gameMode === GameMode.PlayerVsComputer) {
    statusText = "Computer (O) is thinking...";
    statusColor = "text-sky-400 animate-pulse";
  } else {
    let turnPlayerName = currentPlayer === PLAYER_X ? "Player X" : "Player O";
    if (gameMode === GameMode.PlayerVsComputer && currentPlayer === COMPUTER_PLAYER) {
      turnPlayerName = "Computer (O)";
    } else if (gameMode === GameMode.PlayerVsPlayerOnline) {
      turnPlayerName = currentPlayer === playerRoleInOnlineGame ? "Your Turn (Player " + currentPlayer + ")" : "Opponent's Turn (Player " + currentPlayer + ")";
    }
    statusText = `Current Turn: ${turnPlayerName}`;
    statusColor = currentPlayer === PLAYER_X ? "text-indigo-400" : "text-pink-400";
  }
  
  const handleCopyGameId = () => {
    if (gameId) {
        navigator.clipboard.writeText(gameId)
            .then(() => alert(`Game ID "${gameId}" copied to clipboard!`))
            .catch(err => console.error('Failed to copy Game ID: ', err));
    }
  };

  return (
    <div className="w-full max-w-md md:max-w-lg mt-8 p-6 bg-slate-800 rounded-xl shadow-2xl text-center space-y-6">
      {gameMode === GameMode.PlayerVsPlayerOnline && gameId && (
        <div className="mb-4 p-3 bg-slate-700 rounded-lg">
          <p className="text-sm text-slate-300">
            Game ID: <strong className="text-teal-400 font-mono">{gameId}</strong>
            <button 
              onClick={handleCopyGameId}
              className="ml-2 text-xs bg-teal-600 hover:bg-teal-500 text-white font-semibold py-1 px-2 rounded focus:outline-none focus:ring-2 focus:ring-teal-400"
              title="Copy Game ID"
              aria-label="Copy Game ID"
            >
              Copy
            </button>
          </p>
          {playerRoleInOnlineGame && <p className="text-xs text-slate-400 mt-1">You are Player {playerRoleInOnlineGame}</p>}
        </div>
      )}
      <h2 className={`text-2xl md:text-3xl font-bold font-poppins ${statusColor}`}>
        {statusText}
      </h2>
      
      {aiCommentary && isGeminiEnabled && (gameStatus === GameStatus.Won || gameStatus === GameStatus.Draw) && (
        <div className="p-4 bg-slate-700 rounded-lg shadow">
          <p className="text-sm font-semibold text-purple-300 mb-1">Gemini AI says:</p>
          <p className="text-slate-200 italic">"{aiCommentary}"</p>
        </div>
      )}
      {!isGeminiEnabled && (gameStatus === GameStatus.Won || gameStatus === GameStatus.Draw) && (
         <div className="p-3 bg-slate-700 rounded-lg shadow">
          <p className="text-xs text-slate-400">Gemini AI commentary disabled (API key not configured or invalid).</p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
        <button
          onClick={onReset}
          disabled={gameStatus === GameStatus.WaitingForOpponent}
          className={`w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg text-lg transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-75 shadow-md ${gameStatus === GameStatus.WaitingForOpponent ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {gameStatus === GameStatus.Won || gameStatus === GameStatus.Draw ? 'Play Again' : 'Reset Game'}
        </button>
        <button
          onClick={onChangeMode}
          className="w-full sm:w-auto bg-slate-600 hover:bg-slate-500 text-white font-semibold py-3 px-6 rounded-lg text-lg transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-opacity-75 shadow-md"
        >
          Change Mode
        </button>
      </div>
    </div>
  );
};

export default GameInfoPanel;