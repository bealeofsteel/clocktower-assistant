import { Character, characterClassNameMap } from "../../characters";
import { cloneChar } from "../../charUtils";
import { useGameState } from "../../context/GameStateContext";
import { regenerateNightInstructions } from "../../nightUtils";
import { CharacterName } from "../../types";
import CharOptions from "../CharOptions/CharOptions";

interface CharActsAsSelectProps {
  currentChar: Character;
}

function CharActsAsSelect({ currentChar }: CharActsAsSelectProps) {
  const { gameState, updateGameState } = useGameState();

  const updateActsAs = (charName: CharacterName) => {
    const Klass = characterClassNameMap[charName];
    const actsAsChar = new Klass(charName);

    let newChar;

    const newChars = gameState.allChars.map((oldChar) => {
      if (oldChar.id === currentChar.id) {
        newChar = cloneChar(oldChar);
        newChar.actsAsChar =
          currentChar.name === actsAsChar.name ? undefined : actsAsChar;
        return newChar;
      } else {
        return oldChar;
      }
    });

    const newGameState = {
      ...gameState,
      allChars: newChars,
    };

    const startingInfo = newChar!.getDrunkOrSoberStartingInfo(gameState);
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
      disabled={!currentChar.actsAsChar && !currentChar.canActAsOtherChar()}
    >
      <CharOptions />
    </select>
  );
}

export default CharActsAsSelect;
