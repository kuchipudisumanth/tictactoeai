
import React from 'react';
import { type CellValue, Player } from '../types';

interface CellProps {
  value: CellValue;
  onClick: () => void;
  isWinnerCell?: boolean;
  disabled?: boolean;
}

const Cell: React.FC<CellProps> = ({ value, onClick, isWinnerCell = false, disabled = false }) => {
  const playerXColor = "text-indigo-400"; // Brighter indigo for X
  const playerOColor = "text-pink-400"; // Brighter pink for O
  
  let contentStyle = "text-6xl font-bold font-poppins "; // Larger font size
  if (value === Player.X) {
    contentStyle += playerXColor;
  } else if (value === Player.O) {
    contentStyle += playerOColor;
  }

  let cellStyle = `
    w-24 h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 
    border-2 border-slate-600 
    flex items-center justify-center 
    cursor-pointer transition-all duration-200 ease-in-out
    bg-slate-800 hover:bg-slate-700
    focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50
  `;

  if (isWinnerCell) {
    cellStyle += ` ${value === Player.X ? 'bg-indigo-500/30' : 'bg-pink-500/30'} animate-pulse`;
  }
  
  if (disabled || value) {
    cellStyle += ' cursor-not-allowed opacity-80 hover:bg-slate-800';
  }


  return (
    <button
      className={cellStyle}
      onClick={onClick}
      disabled={disabled || !!value}
      aria-label={`Cell ${value ? `played by ${value}` : 'empty'}`}
    >
      <span className={contentStyle}>{value}</span>
    </button>
  );
};

export default Cell;
