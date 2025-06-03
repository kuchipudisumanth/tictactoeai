import { initializeApp, type FirebaseApp } from "firebase/app";
import { getDatabase, ref, set, onValue, update, get, type DatabaseReference } from "firebase/database";
import { type BoardState, type Player, GameStatus } from '../types';
import { INITIAL_BOARD, PLAYER_X } from '../constants';

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.FIREBASE_DATABASE_URL,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

let app: FirebaseApp;
let db: any;

interface FirebaseGameData {
  board: BoardState;
  currentPlayer: Player;
  winner: Player | null;
  winningLine: number[] | null;
  isDraw: boolean;
  gameStatus: GameStatus;
  playerXId?: string;
  playerOId?: string;
  opponentJoined?: boolean;
}

export const initializeFirebase = () => {
  try {
    app = initializeApp(firebaseConfig);
    db = getDatabase(app);
    console.log("Firebase initialized successfully.");
  } catch (error) {
    console.error("Firebase initialization error:", error);
  }
};

export const createGameInFirebase = async (gameId: string, creatorPlayerId: string, initialBoard: BoardState): Promise<void> => {
  if (!db) throw new Error("Firebase not initialized");
  const gameRef: DatabaseReference = ref(db, `games/${gameId}`);
  const initialGameData: FirebaseGameData = {
    board: initialBoard,
    currentPlayer: PLAYER_X,
    winner: null,
    winningLine: null,
    isDraw: false,
    gameStatus: GameStatus.WaitingForOpponent,
    playerXId: creatorPlayerId,
    opponentJoined: false,
  };
  await set(gameRef, initialGameData);
};

export const joinGameInFirebase = async (gameId: string, joiningPlayerId: string): Promise<void> => {
  if (!db) throw new Error("Firebase not initialized");
  const gameRef: DatabaseReference = ref(db, `games/${gameId}`);
  const snapshot = await get(gameRef);
  if (!snapshot.exists()) {
    throw new Error(`Game ${gameId} not found.`);
  }
  const gameData = snapshot.val() as FirebaseGameData;
  if (gameData.playerOId && gameData.playerOId !== joiningPlayerId) {
    throw new Error(`Game ${gameId} is full or already has Player O.`);
  }
  const updates: Partial<FirebaseGameData> = {
    playerOId: joiningPlayerId,
    opponentJoined: true,
    gameStatus: GameStatus.Playing,
  };
  await update(gameRef, updates);
};

export const updateGameInFirebase = async (
  gameId: string,
  board: BoardState,
  currentPlayer: Player,
  winner: Player | null,
  isDraw: boolean,
  winningLine: number[] | null,
  gameStatus: GameStatus
): Promise<void> => {
  if (!db) throw new Error("Firebase not initialized");
  const gameRef: DatabaseReference = ref(db, `games/${gameId}`);
  const updates: Partial<FirebaseGameData> = { board, currentPlayer, winner, isDraw, winningLine, gameStatus };
  await update(gameRef, updates);
};

export const listenToGameUpdatesInFirebase = (gameId: string, callback: (data: FirebaseGameData | null) => void): (() => void) => {
  if (!db) {
    console.error("Firebase not initialized, cannot listen to updates.");
    return () => {};
  }
  const gameRef: DatabaseReference = ref(db, `games/${gameId}`);
  const unsubscribe = onValue(gameRef, (snapshot) => {
    const data = snapshot.val() as FirebaseGameData | null;
    callback(data);
  }, (error) => {
    console.error("Error listening to game updates:", error);
    callback(null);
  });
  return unsubscribe;
};

export const checkGameExistsInFirebase = async (gameId: string): Promise<boolean> => {
  if (!db) throw new Error("Firebase not initialized");
  const gameRef = ref(db, `games/${gameId}`);
  const snapshot = await get(gameRef);
  return snapshot.exists();
};