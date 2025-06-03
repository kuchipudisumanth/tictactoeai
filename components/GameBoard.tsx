
import React from 'react';
import { type BoardState, type WinningLine } from '../types';
import Cell from './Cell';

interface GameBoardProps {
  board: BoardState;
  onCellClick: (index: number) => void;
  winningLine: WinningLine;
  disabled?: boolean;
}

const GameBoard: React.FC<GameBoardProps> = ({ board, onCellClick, winningLine, disabled = false }) => {
  return (
    <div className="grid grid-cols-3 gap-1 p-2 bg-slate-700 rounded-lg shadow-2xl">
      {board.map((value, index) => (
        <Cell
          key={index}
          value={value}
          onClick={() => onCellClick(index)}
          isWinnerCell={winningLine?.includes(index)}
          disabled={disabled || !!value}
        />
      ))}
    </div>
  );
};

export default GameBoard;
