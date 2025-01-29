import { Character, characterClassNameMap } from "../../characters";
import { regenerateNightInstructions } from "../../nightUtils";
import { CharacterName, GameState } from "../../types";
import CharOptions from "../CharOptions/CharOptions";

interface CharacterSelectProps {
  gameState: GameState;
  updateGameState: (newState: GameState) => void;
  currentChar: Character;
}

function CharacterSelect({
  gameState,
  updateGameState,
  currentChar,
}: CharacterSelectProps) {
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

    const startingInfo = newChar.getStartingInfoSuggestion(gameState);
    if (startingInfo) {
      newGameState.startingInfoSuggestions[newChar.id] = startingInfo;
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
      <CharOptions gameState={gameState}></CharOptions>
    </select>
  );
}

export default CharacterSelect;
