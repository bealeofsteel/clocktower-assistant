import { Character, characterClassNameMap } from "../../characters";
import { generateNightInstructions } from "../../nightUtils";
import { CharacterName, GameState, Instruction, NightType } from "../../types";

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

    // If the character we're switching to is currently not in play, we'll want to remove the dummy character
    const newCharNoLongerInPlay = gameState.allChars.filter(
      (char) => !char.inPlay && char.name === newCharName,
    );

    // If the character we're switching away from will no longer be in play, we'll want to add a "not in play" dummy character
    const oldCharNoLongerInPlay =
      gameState.allChars.filter(
        (char) => char.inPlay && char.name === oldCharName,
      ).length === 1;

    let newCharsList = gameState.allChars.map((char) => {
      if (char.id === newChar.id) {
        return newChar;
      } else {
        return char;
      }
    });

    if (
      newCharNoLongerInPlay &&
      newCharNoLongerInPlay.length > 0 &&
      newCharNoLongerInPlay[0].id
    ) {
      newCharsList = newCharsList.filter(
        (char) => char.id !== newCharNoLongerInPlay[0].id,
      );
    }

    if (oldCharNoLongerInPlay) {
      Klass = characterClassNameMap[oldCharName];
      const newChar = new Klass(newCharName);
      newCharsList.push(newChar);
    }

    currentChar = newChar;

    const newGameState = {
      ...gameState,
      allChars: newCharsList,
    };

    // We need to regenerate night instructions, but we want the checked status to carry over
    const oldNightInstructions = gameState.nightInstructions;

    const checkedInstuctions = {
      [NightType.First]: {} as Record<string, boolean | undefined>,
      [NightType.Other]: {} as Record<string, boolean | undefined>,
    };

    const getInstructionKey = (instruction: Instruction) => {
      if (instruction.label && instruction.character) {
        return `${instruction.label}_${instruction.character.id}`;
      } else {
        return instruction.label;
      }
    };

    [NightType.First, NightType.Other].forEach((nightType: NightType) => {
      oldNightInstructions[nightType].forEach((instruction) => {
        checkedInstuctions[nightType][getInstructionKey(instruction)] =
          instruction.checked;
      });
    });

    const newNightInstructions = generateNightInstructions(newGameState);

    [NightType.First, NightType.Other].forEach((nightType: NightType) => {
      newNightInstructions[nightType].forEach((instruction) => {
        if (checkedInstuctions[nightType][getInstructionKey(instruction)]) {
          instruction.checked = true;
        }
      });
    });

    updateGameState({
      ...newGameState,
      nightInstructions: newNightInstructions,
    });
  };

  return (
    <select
      defaultValue={currentChar.name}
      onChange={(e) =>
        changeCharacter(e.target.value as CharacterName, currentChar)
      }
    >
      <optgroup label="Townsfolk">
        {gameState.allCharNamesForEdition.townsfolk.map((charName) => (
          <option key={charName} value={charName}>
            {charName}
          </option>
        ))}
      </optgroup>
      <optgroup label="Outsiders">
        {gameState.allCharNamesForEdition.outsiders.map((charName) => (
          <option key={charName} value={charName}>
            {charName}
          </option>
        ))}
      </optgroup>
      <optgroup label="Minions">
        {gameState.allCharNamesForEdition.minions.map((charName) => (
          <option key={charName} value={charName}>
            {charName}
          </option>
        ))}
      </optgroup>
      <optgroup label="Demons">
        {gameState.allCharNamesForEdition.demons.map((charName) => (
          <option key={charName} value={charName}>
            {charName}
          </option>
        ))}
      </optgroup>
    </select>
  );
}

export default CharacterSelect;
