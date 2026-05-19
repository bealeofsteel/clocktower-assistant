import { createContext, useContext, useState, ReactNode } from "react";
import { GameState, CharacterType } from "../types";
import { Character } from "../characters";
import { cloneChar } from "../charUtils";
import {
  generateDemonBluffs,
  generateOtherNightSuggestions,
  generateStartingInfoSuggestions,
} from "../components/RandomizeSetup/RandomizeSetup";
import { shuffleArray } from "../randomUtils";
import { regenerateNightInstructions } from "../nightUtils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface GameStateContextValue {
  gameState: GameState;
  updateGameState: (newState: GameState) => void;
  undoLastStateChange: () => void;
  regenerateStartingInfo: () => void;
  regenerateStartingInfoForChar: (charId: string) => void;
  regenerateDemonBluffs: () => void;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const LOCAL_STORAGE_KEY = "gameState";
const STATE_HISTORY_KEY = "gameStateHistory";
const MAX_STATE_HISTORY = 100;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function populateCharacters(state: GameState): void {
  const chars: Character[] = [];
  const demonBluffIds =
    state.demonBluffs.map((char: Character) => char.id) || [];
  const demonBluffs: Character[] = [];

  state.allChars?.forEach((charJson: Character) => {
    const char = cloneChar(charJson);
    if (char.actsAsChar) {
      char.actsAsChar = cloneChar(char.actsAsChar);
    }
    chars.push(char);
    if (demonBluffIds.includes(char.id)) {
      demonBluffs.push(char);
    }
  });

  state.allChars = chars;
  state.demonBluffs = demonBluffs;
}

function loadInitialState(): GameState {
  const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!raw) return null as unknown as GameState;
  const state = JSON.parse(raw) as GameState;
  populateCharacters(state);
  return state;
}

function loadInitialHistory(): GameState[] {
  const raw = localStorage.getItem(STATE_HISTORY_KEY);
  return raw ? (JSON.parse(raw) as GameState[]) : [];
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const GameStateContext = createContext<GameStateContextValue | null>(null);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function GameStateProvider({ children }: { children: ReactNode }) {
  const [gameState, setGameState] = useState<GameState>(loadInitialState);
  const [gameStateHistory, setGameStateHistory] =
    useState<GameState[]>(loadInitialHistory);

  const updateGameState = (newState: GameState) => {
    const previousState = gameState;

    setGameState(newState);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newState));

    const newHistory = [...gameStateHistory, previousState];
    if (newHistory.length > MAX_STATE_HISTORY) newHistory.shift();

    setGameStateHistory(newHistory);
    localStorage.setItem(STATE_HISTORY_KEY, JSON.stringify(newHistory));
  };

  const undoLastStateChange = () => {
    const previousState = gameStateHistory[
      gameStateHistory.length - 1
    ] as GameState;
    if (!previousState) return;

    populateCharacters(previousState);
    setGameState(previousState);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(previousState));

    const newHistory = gameStateHistory.slice(0, -1);
    setGameStateHistory(newHistory);
    localStorage.setItem(STATE_HISTORY_KEY, JSON.stringify(newHistory));
  };

  const regenerateStartingInfo = () => {
    const startingInfoSuggestions = generateStartingInfoSuggestions(gameState);
    const otherNightSuggestions = generateOtherNightSuggestions(gameState);
    updateGameState({
      ...gameState,
      startingInfoSuggestions,
      otherNightSuggestions,
    });
  };

  const regenerateStartingInfoForChar = (charId: string) => {
    const char = gameState.allChars.find((c) => c.id === charId) as Character;
    const suggestion = char.getDrunkOrSoberStartingInfo(gameState) as string;
    updateGameState({
      ...gameState,
      startingInfoSuggestions: {
        ...gameState.startingInfoSuggestions,
        [charId]: suggestion,
      },
    });
  };

  const regenerateDemonBluffs = () => {
    const actsAsCharNames: string[] = gameState.allChars
      .filter((char) => char.actsAsChar)
      .map((char) => char.actsAsChar!.name);

    const availableOutsiders = shuffleArray(
      gameState.allChars.filter(
        (char) =>
          !char.inPlay &&
          char.type === CharacterType.Outsider &&
          !actsAsCharNames.includes(char.name),
      ),
    ) as Character[];

    const availableTownsfolk = shuffleArray(
      gameState.allChars.filter(
        (char) =>
          !char.inPlay &&
          char.type === CharacterType.Townsfolk &&
          !actsAsCharNames.includes(char.name),
      ),
    ) as Character[];

    const demonBluffs = generateDemonBluffs(
      [],
      availableOutsiders,
      availableTownsfolk,
    );
    const newGameState = { ...gameState, demonBluffs };
    newGameState.nightInstructions = regenerateNightInstructions(
      gameState,
      newGameState,
    );
    updateGameState(newGameState);
  };

  return (
    <GameStateContext.Provider
      value={{
        gameState,
        updateGameState,
        undoLastStateChange,
        regenerateStartingInfo,
        regenerateStartingInfoForChar,
        regenerateDemonBluffs,
      }}
    >
      {children}
    </GameStateContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useGameState(): GameStateContextValue {
  const ctx = useContext(GameStateContext);
  if (!ctx) {
    throw new Error("useGameState must be used within a <GameStateProvider>");
  }
  return ctx;
}
