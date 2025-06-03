
import { Player, type BoardState } from './types';

export const PLAYER_X = Player.X;
export const PLAYER_O = Player.O;
export const COMPUTER_PLAYER = Player.O;
export const HUMAN_PLAYER = Player.X;

export const INITIAL_BOARD: BoardState = Array(9).fill(null);

export const WINNING_COMBINATIONS: number[][] = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
  [0, 4, 8], [2, 4, 6],             // diagonals
];
