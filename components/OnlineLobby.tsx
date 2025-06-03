import React, { useState } from 'react';

interface OnlineLobbyProps {
  onCreateGame: () => void;
  onJoinGame: (gameId: string) => void;
  gameId: string | null; // If a game has been created by this client
  isWaiting: boolean;    // If waiting for an opponent after creating a game
  error: string | null;
  onCancel: () => void; // To go back to mode selection
}

const OnlineLobby: React.FC<OnlineLobbyProps> = ({ 
    onCreateGame, 
    onJoinGame, 
    gameId, 
    isWaiting, 
    error,
    onCancel 
}) => {
  const [joinGameIdInput, setJoinGameIdInput] = useState('');

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (joinGameIdInput.trim()) {
      onJoinGame(joinGameIdInput.trim().toUpperCase());
    }
  };
  
  const handleCopyGameId = () => {
    if (gameId) {
        navigator.clipboard.writeText(gameId)
            .then(() => alert(`Game ID "${gameId}" copied to clipboard! Share it with your friend.`))
            .catch(err => console.error('Failed to copy Game ID: ', err));
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 p-6">
      <div className="bg-slate-800 p-8 rounded-xl shadow-2xl text-center w-full max-w-lg">
        <h1 className="text-3xl md:text-4xl font-bold mb-6 font-poppins gradient-text">Online Multiplayer</h1>

        {error && <p className="text-red-400 mb-4 bg-red-900/50 p-3 rounded-md">{error}</p>}

        {isWaiting && gameId ? (
          <div className="space-y-4">
            <p className="text-slate-300 text-lg">Game created! Your Game ID is:</p>
            <div className="p-4 bg-slate-700 rounded-lg">
                <strong className="text-3xl text-teal-400 font-mono tracking-wider">{gameId}</strong>
                 <button 
                    onClick={handleCopyGameId}
                    className="ml-3 text-sm bg-teal-600 hover:bg-teal-500 text-white font-semibold py-2 px-3 rounded focus:outline-none focus:ring-2 focus:ring-teal-400"
                    title="Copy Game ID"
                    aria-label="Copy Game ID"
                >
                    Copy ID
                </button>
            </div>
            <p className="text-sky-400 animate-pulse text-lg">Waiting for opponent to join...</p>
            <p className="text-xs text-slate-500">Share this ID with your friend so they can join.</p>
          </div>
        ) : (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-semibold text-slate-200 mb-3">Create a New Game</h2>
              <button
                onClick={onCreateGame}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg text-lg transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-75 shadow-lg"
              >
                Create Game & Get ID
              </button>
            </div>

            <hr className="border-slate-600" />

            <div>
              <h2 className="text-2xl font-semibold text-slate-200 mb-3">Join an Existing Game</h2>
              <form onSubmit={handleJoinSubmit} className="flex flex-col sm:flex-row items-center gap-3">
                <input
                  type="text"
                  value={joinGameIdInput}
                  onChange={(e) => setJoinGameIdInput(e.target.value.toUpperCase())}
                  placeholder="Enter Game ID"
                  className="flex-grow bg-slate-700 text-white placeholder-slate-400 p-3 rounded-lg focus:ring-2 focus:ring-pink-500 focus:outline-none text-lg font-mono tracking-wider"
                  maxLength={6}
                  aria-label="Enter Game ID to join"
                />
                <button
                  type="submit"
                  className="w-full sm:w-auto bg-pink-600 hover:bg-pink-700 text-white font-semibold py-3 px-6 rounded-lg text-lg transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-opacity-75 shadow-lg"
                >
                  Join Game
                </button>
              </form>
            </div>
          </div>
        )}
        <button
            onClick={onCancel}
            className="mt-10 w-full sm:w-auto bg-slate-600 hover:bg-slate-500 text-white font-semibold py-2 px-5 rounded-lg text-md transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-slate-400"
            aria-label="Cancel and go back to mode selection"
        >
            Back to Mode Select
        </button>
         <p className="text-xs text-slate-500 mt-8">
          Online mode requires Firebase setup by the developer.
        </p>
      </div>
    </div>
  );
};

export default OnlineLobby;