import { Character, characterClassNameMap } from "../../characters";
import { getDrunkOrSoberStartingInfo } from "../../charUtils";
import { useGameState } from "../../hooks/useGameState";
import { regenerateNightInstructions } from "../../nightUtils";
import { CharacterName } from "../../types";
import CharOptions from "../CharOptions/CharOptions";

interface CharacterSelectProps {
  currentChar: Character;
}

function CharacterSelect({ currentChar }: CharacterSelectProps) {
  const { gameState, updateGameState } = useGameState();

  const changeCharacter = (
    newCharName: CharacterName,
    currentChar: Character,
  ) => {
    const oldCharName = currentChar.name;

    let Klass = characterClassNameMap[newCharName];
    const newChar = new Klass(newCharName);
    newChar.id = currentChar.id;
    newChar.alignment = currentChar.alignment;
    newChar.isDead = currentChar.isDead;
    newChar.playerName = currentChar.playerName;
    newChar.inPlay = currentChar.inPlay;
    newChar.actsWhileDead = currentChar.actsWhileDead;
    newChar.isDrunkOrPoisoned = currentChar.isDrunkOrPoisoned;

    // If the character we're switching away from will no longer be in play, we'll want to add a "not in play" dummy character
    const oldCharNoLongerInPlay =
      gameState.allChars.filter(
        (char) => char.inPlay && char.name === oldCharName,
      ).length === 1;

    // If the character we're switching to is currently not in play, we'll want to remove the dummy character
    const newCharNoLongerNotInPlay = gameState.allChars.filter(
      (char) => !char.inPlay && char.name === newCharName,
    );

    let newCharsList = gameState.allChars.map((char) => {
      if (char.id === newChar.id) {
        return newChar;
      } else {
        return char;
      }
    });

    if (
      newCharNoLongerNotInPlay &&
      newCharNoLongerNotInPlay.length > 0 &&
      newCharNoLongerNotInPlay[0].id
    ) {
      newCharsList = newCharsList.filter(
        (char) => char.id !== newCharNoLongerNotInPlay[0].id,
      );
    }

    if (oldCharNoLongerInPlay) {
      Klass = characterClassNameMap[oldCharName];
      const oldChar = new Klass(oldCharName);
      newCharsList.push(oldChar);
    }

    currentChar = newChar;

    const newGameState = {
      ...gameState,
      allChars: newCharsList,
    };

    const startingInfo = getDrunkOrSoberStartingInfo(
      gameState,
      newChar,
      newChar,
    );
    if (startingInfo) {
      newGameState.startingInfoSuggestions[`${newChar.name}_${newChar.id}`] =
        startingInfo;
    }

    const otherNightSuggestion = newChar.getOtherNightSuggestion(gameState);
    if (otherNightSuggestion) {
      newGameState.otherNightSuggestions[`${newChar.name}_${newChar.id}`] =
        otherNightSuggestion;
    }

    newGameState.nightInstructions = regenerateNightInstructions(
      gameState,
      newGameState,
    );

    updateGameState(newGameState);
  };

  return (
    <select
      value={currentChar.name}
      onChange={(e) =>
        changeCharacter(e.target.value as CharacterName, currentChar)
      }
    >
      <CharOptions />
    </select>
  );
}

export default CharacterSelect;
