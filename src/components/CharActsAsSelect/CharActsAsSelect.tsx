import { Character, characterClassNameMap } from "../../characters";
import { regenerateNightInstructions } from "../../nightUtils";
import { CharacterName, GameState } from "../../types";
import CharOptions from "../CharOptions/CharOptions";

interface CharActsAsSelectProps {
  gameState: GameState;
  updateGameState: (newState: GameState) => void;
  currentChar: Character;
}

function CharActsAsSelect({
  gameState,
  updateGameState,
  currentChar,
}: CharActsAsSelectProps) {
  const updateActsAs = (charName: CharacterName) => {
    const Klass = characterClassNameMap[charName];
    const actsAsChar = new Klass(charName);

    const newChars = gameState.allChars.map((oldChar) => {
      if (oldChar.id === currentChar.id) {
        return Object.assign(oldChar, { actsAsChar });
      } else {
        return oldChar;
      }
    });

    const newGameState = {
      ...gameState,
      allChars: newChars,
    };

    const nightInstructions = regenerateNightInstructions(newGameState);

    updateGameState({
      ...newGameState,
      nightInstructions: nightInstructions,
    });
  };

  return (
    <select
      defaultValue={currentChar.actsAsChar?.name || currentChar.name}
      onChange={(e) => updateActsAs(e.target.value as CharacterName)}
    >
      <CharOptions gameState={gameState}></CharOptions>
    </select>
  );
}

export default CharActsAsSelect;
