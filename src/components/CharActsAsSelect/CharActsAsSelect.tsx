import { Character, characterClassNameMap } from "../../characters";
import { cloneChar, getDrunkOrSoberStartingInfo } from "../../charUtils";
import { useGameState } from "../../hooks/useGameState";
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

    const startingInfo = getDrunkOrSoberStartingInfo(
      gameState,
      newChar!.actsAsChar ? newChar!.actsAsChar : newChar!,
      newChar!,
    );
    if (startingInfo) {
      newGameState.startingInfoSuggestions[
        `${newChar!.actsAsChar.name}_${newChar!.id}`
      ] = startingInfo;
    }

    const otherNightSuggestion = newChar!.actsAsChar
      ? newChar!.actsAsChar.getOtherNightSuggestion(gameState)
      : newChar!.getOtherNightSuggestion(gameState);
    if (otherNightSuggestion) {
      newGameState.otherNightSuggestions[
        `${newChar!.actsAsChar.name}_${newChar!.id}`
      ] = otherNightSuggestion;
    }

    // Lunatic requires special handling -- regenerate parent suggestion as well
    if (newChar!.name === CharacterName.Lunatic) {
      const lunaticOtherNightSuggestion =
        newChar!.getOtherNightSuggestion(gameState);
      newGameState.otherNightSuggestions[`${newChar!.name}_${newChar!.id}`] =
        lunaticOtherNightSuggestion;
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
