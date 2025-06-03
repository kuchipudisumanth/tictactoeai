
import React, { useState, useEffect, useCallback } from 'react';
import GameBoard from './components/GameBoard';
import GameInfoPanel from './components/GameInfoPanel';
import ModeSelector from './components/ModeSelector';
import OnlineLobby from './components/OnlineLobby'; // New component for online lobby
import { useTicTacToe } from './hooks/useTicTacToe';
import { GameStatus, GameMode, Player } from './types';
import { getGameCommentary, isGeminiEnabled as checkGeminiEnabled } from './services/geminiService';
import { COMPUTER_PLAYER, PLAYER_X } from './constants';
// import { initializeFirebase } from './services/firebaseService'; // Firebase TODO: Uncomment

const App: React.FC = () => {
  const {
    board,
    currentPlayer,
    winner,
    winningLine,
    isDraw,
    gameStatus,
    gameMode,
    handleCellClick,
    resetGame,
    setMode,
    isComputerThinking,
    // Online game state and functions
    gameId,
    playerRoleInOnlineGame,
    onlineGameError,
    createOnlineGame,
    joinOnlineGame,
    makeOnlineMove,
    // listenToOnlineGame, // Potentially call this from here or useEffect
  } = useTicTacToe();

  const [aiCommentary, setAiCommentary] = useState<string | null>(null);
  const [geminiAvailable, setGeminiAvailable] = useState<boolean>(false);

  useEffect(() => {
    setGeminiAvailable(checkGeminiEnabled());
    // Firebase TODO: Initialize Firebase
    // initializeFirebase();
    // console.log("Firebase TODO: Firebase initialized (or should be).");

    // URL-based game joining (basic example)
    // const queryParams = new URLSearchParams(window.location.search);
    // const gameIdFromUrl = queryParams.get('gameId');
    // if (gameIdFromUrl && !gameId) { // Check !gameId to avoid re-joining on hot reload
    //   console.log("Attempting to join game from URL:", gameIdFromUrl);
    //   setMode(GameMode.PlayerVsPlayerOnline); // This will set status to OnlineLobby
    //   // Then, from OnlineLobby, can auto-fill and trigger join
    //   // Or, more directly:
    //   // joinOnlineGame(gameIdFromUrl);
    // }
  }, [/*gameId, joinOnlineGame, setMode*/]); // Add dependencies if using joinOnlineGame/setMode here


  const handleGameEndCommentary = useCallback(async () => {
    if (!geminiAvailable) return;

    let resultMessage = "";
    if (winner) {
        let winnerName = winner === PLAYER_X ? "Player X" : "Player O";
        if (gameMode === GameMode.PlayerVsComputer && winner === COMPUTER_PLAYER) {
            winnerName = "The almighty Computer (O)";
        } else if (gameMode === GameMode.PlayerVsPlayerOnline) {
            winnerName = winner === playerRoleInOnlineGame ? "You (as Player " + winner + ")" : "Your Opponent (as Player " + winner + ")";
        }
        resultMessage = `${winnerName} has won!`;
    } else if (isDraw) {
      resultMessage = "The game ended in a draw.";
    }

    if (resultMessage) {
      setAiCommentary("AI is thinking of a comment...");
      const commentary = await getGameCommentary(resultMessage);
      setAiCommentary(commentary);
    }
  }, [winner, isDraw, gameMode, geminiAvailable, playerRoleInOnlineGame]);

  useEffect(() => {
    if ((gameStatus === GameStatus.Won || gameStatus === GameStatus.Draw) && gameMode !== GameMode.PlayerVsPlayerOnline) { // Commentary for local games
      handleGameEndCommentary();
    } else if (gameMode === GameMode.PlayerVsPlayerOnline && (gameStatus === GameStatus.Won || gameStatus === GameStatus.Draw)) {
      // Firebase TODO: For online games, ensure this triggers for both players.
      // The listener in useTicTacToe should update gameStatus, which then triggers this.
      handleGameEndCommentary();
    }
  }, [gameStatus, gameMode, handleGameEndCommentary]);

  const handleReset = () => {
    resetGame(); // The hook's resetGame now handles current mode context
    setAiCommentary(null);
  };

  const handleChangeMode = () => {
    setMode(null); // This will set gameStatus to SelectingMode
    setAiCommentary(null);
  };
  
  const handleOnlineCellClick = (index: number) => {
    if (gameMode === GameMode.PlayerVsPlayerOnline) {
      makeOnlineMove(index);
    } else {
      handleCellClick(index); // Fallback for safety, though UI should prevent this
    }
  };


  if (gameStatus === GameStatus.SelectingMode || !gameMode) {
    return <ModeSelector onSelectMode={setMode} />;
  }

  if (gameStatus === GameStatus.OnlineLobby || gameStatus === GameStatus.WaitingForOpponent) {
    return (
      <OnlineLobby
        onCreateGame={createOnlineGame}
        onJoinGame={joinOnlineGame}
        gameId={gameId}
        isWaiting={gameStatus === GameStatus.WaitingForOpponent}
        error={onlineGameError}
        onCancel={handleChangeMode} // Button to go back to mode selection
      />
    );
  }
  
  let isBoardDisabled = !!winner || isDraw || isComputerThinking;
  if (gameMode === GameMode.PlayerVsPlayerOnline) {
    isBoardDisabled = isBoardDisabled || (currentPlayer !== playerRoleInOnlineGame);
  } else if (gameMode === GameMode.PlayerVsComputer) {
    isBoardDisabled = isBoardDisabled || (currentPlayer === COMPUTER_PLAYER);
  }


  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 p-4 selection:bg-indigo-500 selection:text-white">
      <header className="mb-8 text-center">
        <h1 className="text-4xl md:text-5xl font-bold font-poppins gradient-text">Tic Tac Toe AI</h1>
        {gameMode && (
          <p className="text-slate-400 mt-2 text-lg">
            Mode: {
              gameMode === GameMode.PlayerVsPlayer ? 'Player vs Player' :
              gameMode === GameMode.PlayerVsComputer ? 'Player vs Computer' :
              'Player vs Player (Online)'
            }
            {gameMode === GameMode.PlayerVsPlayerOnline && playerRoleInOnlineGame && ` (You are Player ${playerRoleInOnlineGame})`}
          </p>
        )}
      </header>
      
      <main className="flex flex-col items-center">
        <GameBoard
          board={board}
          onCellClick={gameMode === GameMode.PlayerVsPlayerOnline ? handleOnlineCellClick : handleCellClick}
          winningLine={winningLine}
          disabled={isBoardDisabled}
        />
        <GameInfoPanel
          gameStatus={gameStatus}
          currentPlayer={currentPlayer}
          winner={winner}
          isDraw={isDraw}
          gameMode={gameMode}
          onReset={handleReset}
          onChangeMode={handleChangeMode}
          aiCommentary={aiCommentary}
          isGeminiEnabled={geminiAvailable}
          isComputerThinking={isComputerThinking}
          gameId={gameId}
          playerRoleInOnlineGame={playerRoleInOnlineGame}
        />
      </main>
      <footer className="mt-12 text-center text-sm text-slate-500">
        <p>&copy; {new Date().getFullYear()} Tic Tac Toe AI. Powered by React, Firebase & Gemini.</p>
      </footer>
    </div>
  );
};

export default App;
