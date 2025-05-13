import { Character, characterClassNameMap } from "../../characters";
import { cloneChar } from "../../charUtils";
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

    let newChar;

    const newChars = gameState.allChars.map((oldChar) => {
      if (oldChar.id === currentChar.id) {
        newChar = cloneChar(oldChar);
        newChar.actsAsChar = actsAsChar;
        return newChar;
      } else {
        return oldChar;
      }
    });

    const newGameState = {
      ...gameState,
      allChars: newChars,
    };

    const startingInfo = newChar!.getStartingInfoSuggestion(gameState);
    if (startingInfo) {
      newGameState.startingInfoSuggestions[currentChar.id] = startingInfo;
    }

    const otherNightSuggestion = newChar!.getOtherNightSuggestion(gameState);
    if (otherNightSuggestion) {
      newGameState.otherNightSuggestions[currentChar.id] = otherNightSuggestion;
    }

    newGameState.nightInstructions = regenerateNightInstructions(
      gameState,
      newGameState,
    );

    updateGameState(newGameState);
  };

  return (
    <select
      value={currentChar.actsAsChar?.name || currentChar.name}
      onChange={(e) => updateActsAs(e.target.value as CharacterName)}
      disabled={!currentChar.canActAsOtherChar()}
    >
      <CharOptions gameState={gameState}></CharOptions>
    </select>
  );
}

export default CharActsAsSelect;
