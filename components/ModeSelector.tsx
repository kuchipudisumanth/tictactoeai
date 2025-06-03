import React from 'react';
import { GameMode } from '../types';

interface ModeSelectorProps {
  onSelectMode: (mode: GameMode) => void;
}

const ModeSelector: React.FC<ModeSelectorProps> = ({ onSelectMode }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 p-6">
      <div className="bg-slate-800 p-8 rounded-xl shadow-2xl text-center w-full max-w-md">
        <h1 className="text-4xl md:text-5xl font-bold mb-8 font-poppins gradient-text">Tic Tac Toe AI</h1>
        <p className="text-slate-300 mb-10 text-lg">Choose your game mode:</p>
        <div className="space-y-5">
          <button
            onClick={() => onSelectMode(GameMode.PlayerVsPlayer)}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 px-6 rounded-lg text-xl transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-75 shadow-lg"
            aria-label="Select Player versus Player mode"
          >
            Player vs Player
          </button>
          <button
            onClick={() => onSelectMode(GameMode.PlayerVsComputer)}
            className="w-full bg-pink-600 hover:bg-pink-700 text-white font-semibold py-4 px-6 rounded-lg text-xl transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-opacity-75 shadow-lg"
            aria-label="Select Player versus Computer mode"
          >
            Player vs Computer
          </button>
          <button
            onClick={() => onSelectMode(GameMode.PlayerVsPlayerOnline)}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-4 px-6 rounded-lg text-xl transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-75 shadow-lg"
            aria-label="Select Player versus Player Online mode"
          >
            Player vs Player (Online)
          </button>
        </div>
         <p className="text-xs text-slate-500 mt-10">
          Built with React, Tailwind, and Gemini AI for commentary.
        </p>
      </div>
    </div>
  );
};

export default ModeSelector;