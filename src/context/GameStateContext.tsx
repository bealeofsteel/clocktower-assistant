import { createContext } from "react";
import { GameState } from "../types";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface GameStateContextValue {
  gameState: GameState;
  updateGameState: (newState: GameState) => void;
  undoLastStateChange: () => void;
  regenerateStartingInfo: () => void;
  regenerateStartingInfoForChar: (charId: string, label: string) => void;
  regenerateDemonBluffs: () => void;
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

export const GameStateContext = createContext<GameStateContextValue | null>(
  null,
);
