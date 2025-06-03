import { useState, useCallback, useEffect } from 'react';
import { type BoardState, type Player, GameStatus, GameMode, type GameState } from '../types';
import { INITIAL_BOARD, PLAYER_X, PLAYER_O, COMPUTER_PLAYER, HUMAN_PLAYER } from '../constants';
import { calculateWinner, isBoardFull, findBestComputerMove } from '../services/aiPlayer';
// import { createGameInFirebase, joinGameInFirebase, listenToGameUpdatesInFirebase, updateGameInFirebase, checkGameExistsInFirebase } from '../services/firebaseService'; // Firebase TODO: Uncomment and implement

const initialGameState: GameState = {
  board: [...INITIAL_BOARD],
  currentPlayer: PLAYER_X,
  winner: null,
  winningLine: null,
  isDraw: false,
  gameStatus: GameStatus.SelectingMode,
  gameMode: null,
  gameId: null,
  playerRoleInOnlineGame: null,
  onlineGameError: null,
};

// Firebase TODO: This is a placeholder for an unsubscribe function for Firebase listeners
let unsubscribeFromGameUpdates: (() => void) | null = null;

export function useTicTacToe() {
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const [isComputerThinking, setIsComputerThinking] = useState<boolean>(false);

  const updateLocalGameState = useCallback((updates: Partial<GameState>) => {
    setGameState(prev => ({ ...prev, ...updates }));
  }, []);
  
  // Centralized game update logic, also considering online state
  const processMoveAndUpdateStatus = useCallback((board: BoardState, playerWhoMoved: Player) => {
    const { winner, line } = calculateWinner(board);
    if (winner) {
      updateLocalGameState({
        board,
        winner,
        winningLine: line,
        gameStatus: GameStatus.Won,
        // currentPlayer will be the winner
      });
    } else if (isBoardFull(board)) {
      updateLocalGameState({
        board,
        isDraw: true,
        gameStatus: GameStatus.Draw,
      });
    } else {
       updateLocalGameState({
        board,
        currentPlayer: playerWhoMoved === PLAYER_X ? PLAYER_O : PLAYER_X,
      });
    }
  }, [updateLocalGameState]);


  const handleCellClick = useCallback((index: number) => {
    if (gameState.board[index] || gameState.winner || gameState.isDraw || 
        gameState.gameStatus !== GameStatus.Playing || isComputerThinking) {
      return;
    }

    // For online games, check if it's the current user's turn
    if (gameState.gameMode === GameMode.PlayerVsPlayerOnline) {
      if (gameState.currentPlayer !== gameState.playerRoleInOnlineGame) {
        console.log("Not your turn in online game.");
        return; // Not this player's turn
      }
      // Logic for making an online move will be handled by a dedicated function
      // makeOnlineMove(index); // This will be called from App.tsx or a similar place
      // For now, let's simulate the local part of an online move
      const newBoard = [...gameState.board];
      newBoard[index] = gameState.currentPlayer;
      // Firebase TODO: In a real scenario, `makeOnlineMove` would update Firebase,
      // and `processMoveAndUpdateStatus` would be called upon receiving updates from Firebase.
      // For optimistic UI update, we can call it here, but be mindful of synchronization.
      // For simplicity now, we'll assume makeOnlineMove handles Firebase and then updates local state via listener.
      // Here, we are just outlining what makeOnlineMove should trigger.
      console.log("Online move to be made at index:", index);
       // This should be replaced by actual call to makeOnlineMove
      const playerMakingMove = gameState.currentPlayer;
      // Firebase TODO: Call a function that updates firebase
      // updateGameInFirebase(gameState.gameId, newBoard, playerMakingMove === PLAYER_X ? PLAYER_O : PLAYER_X, null, false, null);
      processMoveAndUpdateStatus(newBoard, playerMakingMove); // Optimistic update or update driven by listener
      return;
    }
    
    // For local games (PvP or PvC)
    const newBoard = [...gameState.board];
    newBoard[index] = gameState.currentPlayer;
    processMoveAndUpdateStatus(newBoard, gameState.currentPlayer);

  }, [gameState, isComputerThinking, processMoveAndUpdateStatus /*makeOnlineMove*/]);

  const resetGame = useCallback(() => {
    if (unsubscribeFromGameUpdates) {
      unsubscribeFromGameUpdates();
      unsubscribeFromGameUpdates = null;
    }
    setGameState(prev => {
      const baseResetState = {
        ...initialGameState,
        board: [...INITIAL_BOARD], // Ensure board is fresh
        currentPlayer: HUMAN_PLAYER,
        winner: null,
        winningLine: null,
        isDraw: false,
        gameId: prev.gameMode === GameMode.PlayerVsPlayerOnline ? prev.gameId : null, // Keep gameId for online lobby restart? Or clear?
        playerRoleInOnlineGame: prev.gameMode === GameMode.PlayerVsPlayerOnline ? prev.playerRoleInOnlineGame : null,
        onlineGameError: null,
      };

      if (!prev.gameMode || prev.gameStatus === GameStatus.SelectingMode || prev.gameStatus === GameStatus.OnlineLobby) {
        return {
          ...baseResetState,
          gameStatus: GameStatus.SelectingMode,
          gameMode: null,
        };
      }
      // If resetting an ongoing game, keep the mode and restart
      return {
        ...baseResetState,
        gameMode: prev.gameMode,
        gameStatus: GameStatus.Playing,
      };
    });
    setIsComputerThinking(false);
  }, []);
  
  const setMode = useCallback((mode: GameMode | null) => {
    if (unsubscribeFromGameUpdates) {
        unsubscribeFromGameUpdates();
        unsubscribeFromGameUpdates = null;
    }
    setGameState(prev => ({ // Always reset to initial state structure first
        ...initialGameState,
        board: [...INITIAL_BOARD], // fresh board
        currentPlayer: HUMAN_PLAYER, // X always starts new games for simplicity
    }));

    if (mode === null) { // Go back to mode selection
      setGameState(prev => ({
        ...prev,
        gameStatus: GameStatus.SelectingMode,
        gameMode: null,
      }));
    } else if (mode === GameMode.PlayerVsPlayerOnline) {
      setGameState(prev => ({
        ...prev,
        gameMode: GameMode.PlayerVsPlayerOnline,
        gameStatus: GameStatus.OnlineLobby, // Go to online lobby first
      }));
    } else { // Start a local game (PvP or PvC)
      setGameState(prev => ({
        ...prev,
        gameMode: mode,
        gameStatus: GameStatus.Playing,
      }));
    }
    setIsComputerThinking(false);
  }, []);


  // --- Online Game Functions ---
  const createOnlineGame = useCallback(async () => {
    const newGameId = Math.random().toString(36).substr(2, 6).toUpperCase(); // Simple ID generator
    updateLocalGameState({ 
        gameId: newGameId, 
        playerRoleInOnlineGame: PLAYER_X, 
        gameStatus: GameStatus.WaitingForOpponent,
        onlineGameError: null,
        board: [...INITIAL_BOARD], // Ensure fresh board
        currentPlayer: PLAYER_X, // Creator is X, X starts
        winner: null,
        isDraw: false,
    });
    // Firebase TODO:
    // try {
    //   await createGameInFirebase(newGameId, PLAYER_X, INITIAL_BOARD);
    //   listenToOnlineGame(newGameId); // Start listening for opponent and game updates
    // } catch (error) {
    //   console.error("Failed to create online game:", error);
    //   updateLocalGameState({ onlineGameError: "Failed to create game. Please try again.", gameStatus: GameStatus.OnlineLobby });
    // }
    console.log(`Firebase TODO: Create game ${newGameId} in Firebase. Player X is creator.`);
    // Simulate listening after creation for demo purposes
    // listenToOnlineGame(newGameId); 
  }, [updateLocalGameState /*, listenToOnlineGame*/]);

  const joinOnlineGame = useCallback(async (idToJoin: string) => {
    if (!idToJoin) {
        updateLocalGameState({ onlineGameError: "Game ID cannot be empty."});
        return;
    }
    updateLocalGameState({ onlineGameError: null }); // Clear previous errors
    // Firebase TODO:
    // try {
    //   const gameExists = await checkGameExistsInFirebase(idToJoin);
    //   if (!gameExists) {
    //     updateLocalGameState({ onlineGameError: `Game with ID ${idToJoin} not found.` });
    //     return;
    //   }
    //   await joinGameInFirebase(idToJoin, PLAYER_O); // Assume joiner is Player O
    //   updateLocalGameState({
    //     gameId: idToJoin,
    //     playerRoleInOnlineGame: PLAYER_O,
    //     gameStatus: GameStatus.Playing, // Or set by listener when game data is fetched
    //     onlineGameError: null,
    //   });
    //   listenToOnlineGame(idToJoin);
    // } catch (error) {
    //   console.error("Failed to join online game:", error);
    //   updateLocalGameState({ onlineGameError: "Failed to join game. Check ID or try again.", gameStatus: GameStatus.OnlineLobby });
    // }
    console.log(`Firebase TODO: Join game ${idToJoin} in Firebase. Player O is joiner.`);
    updateLocalGameState({ // Simulate successful join for demo
        gameId: idToJoin, 
        playerRoleInOnlineGame: PLAYER_O, 
        gameStatus: GameStatus.Playing, // Assume game starts immediately after joining
        board: [...INITIAL_BOARD], // Fetch from Firebase in reality
        currentPlayer: PLAYER_X, // Fetched from Firebase
    });
    // listenToOnlineGame(idToJoin);
  }, [updateLocalGameState /*, listenToOnlineGame*/]);
  
  const makeOnlineMove = useCallback(async (index: number) => {
    if (!gameState.gameId || gameState.board[index] || gameState.winner || gameState.isDraw || 
        gameState.currentPlayer !== gameState.playerRoleInOnlineGame) {
      return;
    }
    const newBoard = [...gameState.board];
    newBoard[index] = gameState.currentPlayer;
    const nextPlayer = gameState.currentPlayer === PLAYER_X ? PLAYER_O : PLAYER_X;
    
    // Optimistically update UI for current player - Firebase listener will confirm for both
    // updateLocalGameState({ board: newBoard, currentPlayer: nextPlayer }); // Or let listener handle it fully

    // Firebase TODO:
    // try {
    //   await updateGameInFirebase(gameState.gameId, newBoard, nextPlayer, /* other game state parts */);
    //   // No need to call processMoveAndUpdateStatus here, listener will handle it.
    // } catch (error) {
    //   console.error("Failed to make online move:", error);
    //   // Potentially revert optimistic update or show error
    //   updateLocalGameState({ onlineGameError: "Failed to sync move."});
    // }
    console.log(`Firebase TODO: Update game ${gameState.gameId} with move at ${index}. New board: ${newBoard}, next player: ${nextPlayer}`);
    // For non-Firebase demo, we can directly process
    processMoveAndUpdateStatus(newBoard, gameState.currentPlayer);

  }, [gameState.gameId, gameState.board, gameState.winner, gameState.isDraw, gameState.currentPlayer, gameState.playerRoleInOnlineGame, processMoveAndUpdateStatus, updateLocalGameState]);

  const listenToOnlineGame = useCallback((gameId: string) => {
    // Firebase TODO:
    // if (unsubscribeFromGameUpdates) {
    //   unsubscribeFromGameUpdates(); // Unsubscribe from previous listener if any
    // }
    // console.log(`Firebase TODO: Listening to game ${gameId}`);
    // unsubscribeFromGameUpdates = listenToGameUpdatesInFirebase(gameId, (gameData) => {
    //   if (gameData) {
    //     // Assuming gameData has { board, currentPlayer, winner, isDraw, winningLine, status, opponentJoined }
    //     // Logic to determine if opponent has joined and switch from WaitingForOpponent to Playing
    //     let newGameStatus = gameState.gameStatus;
    //     if (gameState.gameStatus === GameStatus.WaitingForOpponent && gameData.opponentJoined) {
    //         newGameStatus = GameStatus.Playing;
    //     } else if (gameData.status) { // if firebase stores a game status
    //         newGameStatus = gameData.status;
    //     }

    //     setGameState(prev => ({
    //       ...prev,
    //       board: gameData.board || prev.board,
    //       currentPlayer: gameData.currentPlayer || prev.currentPlayer,
    //       winner: gameData.winner !== undefined ? gameData.winner : prev.winner,
    //       winningLine: gameData.winningLine !== undefined ? gameData.winningLine : prev.winningLine,
    //       isDraw: gameData.isDraw !== undefined ? gameData.isDraw : prev.isDraw,
    //       gameStatus: newGameStatus,
    //       onlineGameError: null, // Clear error on successful update
    //     }));
    //   } else {
    //     // Game deleted or error
    //     setGameState(prev => ({ ...prev, onlineGameError: "Game not found or connection lost.", gameStatus: GameStatus.OnlineLobby }));
    //     if (unsubscribeFromGameUpdates) unsubscribeFromGameUpdates();
    //   }
    // });
  }, [updateLocalGameState, gameState.gameStatus]);

  // Effect for computer's turn
  useEffect(() => {
    if (
      gameState.gameMode === GameMode.PlayerVsComputer &&
      gameState.currentPlayer === COMPUTER_PLAYER &&
      !gameState.winner &&
      !gameState.isDraw &&
      gameState.gameStatus === GameStatus.Playing
    ) {
      setIsComputerThinking(true);
      const timeoutId = setTimeout(() => {
        const computerMoveIndex = findBestComputerMove(gameState.board);
        if (computerMoveIndex !== -1) {
          const newBoard = [...gameState.board];
          newBoard[computerMoveIndex] = COMPUTER_PLAYER;
          processMoveAndUpdateStatus(newBoard, COMPUTER_PLAYER);
        }
        setIsComputerThinking(false);
      }, 700);
      return () => clearTimeout(timeoutId);
    }
  }, [gameState.gameMode, gameState.currentPlayer, gameState.winner, gameState.isDraw, gameState.board, gameState.gameStatus, processMoveAndUpdateStatus]);
  
  // Cleanup Firebase listener on unmount
  useEffect(() => {
    return () => {
      if (unsubscribeFromGameUpdates) {
        unsubscribeFromGameUpdates();
      }
    };
  }, []);

  return {
    ...gameState,
    handleCellClick,
    resetGame,
    setMode,
    isComputerThinking,
    createOnlineGame,
    joinOnlineGame,
    makeOnlineMove, // exposing this for App.tsx to use
    listenToOnlineGame, // Expose if needed by App.tsx to initiate listening earlier
    // updateLocalGameState, // If needed for direct state manipulation from App
  };
}