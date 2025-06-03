import React, { useState, useEffect, useCallback } from 'react';
import GameBoard from './components/GameBoard';
import GameInfoPanel from './components/GameInfoPanel';
import ModeSelector from './components/ModeSelector';
import OnlineLobby from './components/OnlineLobby';
import { useTicTacToe } from './hooks/useTicTacToe';
import { GameStatus, GameMode, Player } from './types';
import { getGameCommentary, isGeminiEnabled as checkGeminiEnabled } from './services/geminiService';
import { COMPUTER_PLAYER, PLAYER_X } from './constants';
import { initializeFirebase } from './services/firebaseService';

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
    gameId,
    playerRoleInOnlineGame,
    onlineGameError,
    createOnlineGame,
    joinOnlineGame,
    makeOnlineMove,
  } = useTicTacToe();

  const [aiCommentary, setAiCommentary] = useState<string | null>(null);
  const [geminiAvailable, setGeminiAvailable] = useState<boolean>(false);

  useEffect(() => {
    setGeminiAvailable(checkGeminiEnabled());
    initializeFirebase();

    const queryParams = new URLSearchParams(window.location.search);
    const gameIdFromUrl = queryParams.get('gameId');
    if (gameIdFromUrl && !gameId) {
      setMode(GameMode.PlayerVsPlayerOnline);
      joinOnlineGame(gameIdFromUrl);
    }
  }, [gameId, joinOnlineGame, setMode]);

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
    if ((gameStatus === GameStatus.Won || gameStatus === GameStatus.Draw)) {
      handleGameEndCommentary();
    }
  }, [gameStatus, handleGameEndCommentary]);

  const handleReset = () => {
    resetGame();
    setAiCommentary(null);
  };

  const handleChangeMode = () => {
    setMode(null);
    setAiCommentary(null);
  };

  const handleOnlineCellClick = (index: number) => {
    if (gameMode === GameMode.PlayerVsPlayerOnline) {
      makeOnlineMove(index);
    } else {
      handleCellClick(index);
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
        onCancel={handleChangeMode}
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