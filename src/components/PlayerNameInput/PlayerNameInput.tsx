import { useEffect, useState } from "react";
import { Character } from "../../characters";
import { cloneChar } from "../../charUtils";
import { useGameState } from "../../hooks/useGameState";

interface PlayerNameInputDisplayProps {
  char: Character;
}

function PlayerNameInput({ char }: PlayerNameInputDisplayProps) {
  const { gameState, updateGameState } = useGameState();
  const [localValue, setLocalValue] = useState(char.playerName);

  const updatePlayerName = (newValue: string) => {
    const newChars = gameState.allChars.map((oldChar) => {
      if (oldChar.id === char.id) {
        const newChar = cloneChar(oldChar);
        newChar.playerName = newValue;
        return newChar;
      } else {
        return oldChar;
      }
    });

    updateGameState({
      ...gameState,
      allChars: newChars,
    });
  };

  // This is to handle Undo actions properly. Otherwise, local state diverges from the game state
  useEffect(() => {
    if (char.playerName !== localValue) {
      setLocalValue(char.playerName);
    }
  }, [char.playerName]);

  return (
    <input
      type="text"
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      onBlur={(e) => updatePlayerName(e.target.value)}
    ></input>
  );
}

export default PlayerNameInput;
