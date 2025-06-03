
import { type BoardState, type Player, type WinningLine } from '../types';
import { WINNING_COMBINATIONS, COMPUTER_PLAYER, HUMAN_PLAYER } from '../constants';

export interface WinnerInfo {
  winner: Player | null;
  line: WinningLine;
}

export function calculateWinner(board: BoardState): WinnerInfo {
  for (let i = 0; i < WINNING_COMBINATIONS.length; i++) {
    const [a, b, c] = WINNING_COMBINATIONS[i];
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a] as Player, line: [a, b, c] };
    }
  }
  return { winner: null, line: null };
}

export function isBoardFull(board: BoardState): boolean {
  return board.every(cell => cell !== null);
}

export function findBestComputerMove(board: BoardState): number {
  // 1. Check if computer can win
  for (let i = 0; i < board.length; i++) {
    if (board[i] === null) {
      const newBoard = [...board];
      newBoard[i] = COMPUTER_PLAYER;
      if (calculateWinner(newBoard).winner === COMPUTER_PLAYER) {
        return i;
      }
    }
  }

  // 2. Check if human can win and block
  for (let i = 0; i < board.length; i++) {
    if (board[i] === null) {
      const newBoard = [...board];
      newBoard[i] = HUMAN_PLAYER;
      if (calculateWinner(newBoard).winner === HUMAN_PLAYER) {
        return i;
      }
    }
  }

  // 3. Take center if available
  if (board[4] === null) {
    return 4;
  }

  // 4. Take a random available corner
  const corners = [0, 2, 6, 8];
  const availableCorners = corners.filter(index => board[index] === null);
  if (availableCorners.length > 0) {
    return availableCorners[Math.floor(Math.random() * availableCorners.length)];
  }

  // 5. Take a random available side
  const sides = [1, 3, 5, 7];
  const availableSides = sides.filter(index => board[index] === null);
  if (availableSides.length > 0) {
    return availableSides[Math.floor(Math.random() * availableSides.length)];
  }
  
  // 6. Fallback: take any available spot (should be covered by above for non-full boards)
  const availableSpots = board.map((val, idx) => val === null ? idx : -1).filter(idx => idx !== -1);
   if (availableSpots.length > 0) {
    return availableSpots[Math.floor(Math.random() * availableSpots.length)];
  }

  return -1; // Should not happen if game is not over
}
