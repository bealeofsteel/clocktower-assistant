import { ChangeEvent } from "react";
import { Character } from "../../characters";
import { GameState } from "../../types";

interface PlayerNameInputDisplayProps {
  gameState: GameState;
  updateGameState: (newState: GameState) => void;
  char: Character;
}

function PlayerNameInput({
  gameState,
  updateGameState,
  char,
}: PlayerNameInputDisplayProps) {
  const updatePlayerName = (
    e: ChangeEvent<HTMLInputElement>,
    char: Character,
  ) => {
    const newChars = gameState.allChars.map((oldChar) => {
      if (oldChar.id === char.id) {
        return Object.assign(oldChar, { playerName: e.target.value });
      } else {
        return oldChar;
      }
    });

    updateGameState({
      ...gameState,
      allChars: newChars,
    });
  };

  return (
    <input
      type="text"
      value={char.playerName}
      onChange={(e) => updatePlayerName(e, char)}
    ></input>
  );
}

export default PlayerNameInput;
