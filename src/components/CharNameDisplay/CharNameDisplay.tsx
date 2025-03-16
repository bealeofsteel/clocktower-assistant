import "./CharNameDisplay.css";
import { Character } from "../../characters";
import { CharacterName, GameState } from "../../types";
import PlayerNameInput from "../PlayerNameInput/PlayerNameInput";
import { useToggleDeadAliveState } from "../../hooks/useToggleDeadAliveState";

interface CharNameDisplayProps {
  gameState: GameState;
  updateGameState: (newState: GameState) => void;
  char: Character;
  playable: boolean;
  tokenInUseMap?: Partial<Record<CharacterName, CharacterName>>;
}

function CharNameDisplay({
  gameState,
  updateGameState,
  char,
  playable,
  tokenInUseMap,
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
        {tokenInUseMap && tokenInUseMap[char.name]
          ? ` (token used by ${tokenInUseMap[char.name]}}`
          : ""}
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
