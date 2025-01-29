import "./CharNameDisplay.css";
import { Character } from "../../characters";
import { GameState } from "../../types";
import PlayerNameInput from "../PlayerNameInput/PlayerNameInput";
import { cloneChar } from "../../charUtils";

interface CharNameDisplayProps {
  gameState: GameState;
  updateGameState: (newState: GameState) => void;
  char: Character;
  playable: boolean;
}

function CharNameDisplay({
  gameState,
  updateGameState,
  char,
  playable,
}: CharNameDisplayProps) {
  const toggleDeadAliveState = (char: Character) => {
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
    });
  };

  return (
    <div key={`${char.id}-name`} className="char-name-container">
      <span
        className={`char-name clickable ${char.alignment} ${char.isDead ? "is-dead" : ""}`}
        onClick={playable ? () => toggleDeadAliveState(char) : () => {}}
      >
        {char.getDisplayName()}
      </span>
      {playable && (
        <PlayerNameInput
          gameState={gameState}
          updateGameState={updateGameState}
          char={char}
        />
      )}
    </div>
  );
}

export default CharNameDisplay;
