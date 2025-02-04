import "./CharNameDisplay.css";
import { Character } from "../../characters";
import { GameState } from "../../types";
import PlayerNameInput from "../PlayerNameInput/PlayerNameInput";
import { useToggleDeadAliveState } from "../../hooks/useToggleDeadAliveState";

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
  const toggleDeadAliveState = useToggleDeadAliveState(
    gameState,
    updateGameState,
  );

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
