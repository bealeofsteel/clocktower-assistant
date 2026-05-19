import "./CharNameDisplay.css";
import { Character } from "../../characters";
import { CharacterName } from "../../types";
import PlayerNameInput from "../PlayerNameInput/PlayerNameInput";
import { useToggleDeadAliveState } from "../../hooks/useToggleDeadAliveState";
import { useGameState } from "../../context/GameStateContext";

interface CharNameDisplayProps {
  char: Character;
  playable: boolean;
  tokenInUseMap?: Partial<Record<CharacterName, CharacterName>>;
}

function CharNameDisplay({
  char,
  playable,
  tokenInUseMap,
}: CharNameDisplayProps) {
  const { gameState, updateGameState } = useGameState();
  const toggleDeadAliveState = useToggleDeadAliveState();

  return (
    <div key={`${char.id}-name`} className="char-name-container">
      <span
        className={`char-name clickable ${char.alignment} ${char.isDead ? "is-dead" : ""}`}
        onClick={playable ? () => toggleDeadAliveState(char) : () => {}}
      >
        {char.getDisplayName()}
        {tokenInUseMap && tokenInUseMap[char.name]
          ? ` (token used by ${tokenInUseMap[char.name]})`
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
