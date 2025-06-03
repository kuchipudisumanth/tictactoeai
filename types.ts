export enum Player {
  X = 'X',
  O = 'O',
}

export type CellValue = Player | null;

export type BoardState = CellValue[];

export enum GameStatus {
  Playing = 'Playing',
  Won = 'Won',
  Draw = 'Draw',
  SelectingMode = 'SelectingMode',
  OnlineLobby = 'OnlineLobby', // For creating/joining online games
  WaitingForOpponent = 'WaitingForOpponent', // After creating an online game
}

export enum GameMode {
  PlayerVsPlayer = 'PlayerVsPlayer',
  PlayerVsComputer = 'PlayerVsComputer',
  PlayerVsPlayerOnline = 'PlayerVsPlayerOnline',
}

export type WinningLine = number[] | null;

export interface GameState {
  board: BoardState;
  currentPlayer: Player;
  winner: Player | null;
  winningLine: WinningLine;
  isDraw: boolean;
  gameStatus: GameStatus;
  gameMode: GameMode | null;
  // Online game specific state
  gameId: string | null;
  playerRoleInOnlineGame: Player | null; // X or O for the current client
  onlineGameError: string | null; // To display errors related to online game lobby
}