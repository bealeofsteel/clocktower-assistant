import { Character } from "../characters";
import { cloneChar } from "../charUtils";
import { useGameState } from "./useGameState";

export function useToggleDeadAliveState() {
  const { gameState, updateGameState } = useGameState();

  return (char: Character) => {
    const newNightInstructions = {
      ...gameState.nightInstructions,
    };

    // If a character is resurrected, uncheck its instructions so that it can act again
    if (char.isDead) {
      newNightInstructions.first.forEach((instruction) => {
        if (instruction.charId === char.id) {
          instruction.checked = false;
        }
      });

      newNightInstructions.other.forEach((instruction) => {
        if (instruction.charId === char.id) {
          instruction.checked = false;
        }
      });
    }

    const newChars = gameState.allChars.map((oldChar) => {
      if (oldChar.id === char.id) {
        const newChar = cloneChar(oldChar);
        newChar.isDead = !oldChar.isDead;
        return newChar;
      } else {
        return oldChar;
      }
    });

    updateGameState({
      ...gameState,
      allChars: newChars,
      nightInstructions: newNightInstructions,
    });
  };
}
