import { Character, characterClassNameMap } from "./characters";
import { shuffleArray } from "./randomUtils";
import { GameState, CharacterName, CharacterType, Alignment } from "./types";

export const getAllCharsInPlay = (gameState: GameState): Character[] => {
  return gameState?.allChars?.filter((char) => char.inPlay);
};

export interface InPlayCharResult {
  character: Character;
  registersAs?: CharacterName;
}

// Picks a random in-play char of the specified type, with the spy and recluse possibly registering as another character
export const pickRandomCharOfTypeInPlay = (
  gameState: GameState,
  charType: CharacterType,
  excludeCharId: string,
): InPlayCharResult => {
  const inPlayCharResults: InPlayCharResult[] = gameState.allChars
    .filter(
      (char) =>
        char.inPlay && char.type === charType && char.id !== excludeCharId,
    )
    .map((char) => {
      return { character: char };
    });

  if (
    charType === CharacterType.Townsfolk ||
    charType === CharacterType.Outsider
  ) {
    const spy = findCharIfInPlay(gameState, CharacterName.Spy);
    if (spy) {
      const randomChar = pickRandomCharOfType(
        gameState,
        charType,
        excludeCharId,
      );
      inPlayCharResults.push({ character: spy, registersAs: randomChar.name });
    }
  } else if (
    charType === CharacterType.Minion ||
    charType === CharacterType.Demon
  ) {
    const recluse = findCharIfInPlay(gameState, CharacterName.Recluse);
    if (recluse) {
      const randomChar = pickRandomCharOfType(
        gameState,
        charType,
        excludeCharId,
      );
      inPlayCharResults.push({
        character: recluse,
        registersAs: randomChar.name,
      });
    }
  }

  shuffleArray(inPlayCharResults);
  return inPlayCharResults[0];
};

// Picks a random character of the specified type out of all the characters in the edition (not just in play)
export const pickRandomCharOfType = (
  gameState: GameState,
  charType: CharacterType,
  excludeCharId: string,
): Character => {
  const chars = gameState.allChars.filter(
    (char) => char.type === charType && char.id !== excludeCharId,
  );

  shuffleArray(chars);
  return chars[0];
};

export const pickRandomCharacterInPlay = (
  gameState: GameState,
  excludeCharIds: string[],
): Character => {
  const allChars = gameState.allChars.filter(
    (char) => char.inPlay && !excludeCharIds.includes(char.id),
  );

  shuffleArray(allChars);
  return allChars[0];
};

const findCharIfInPlay = (gameState: GameState, charName: CharacterName) => {
  const chars = gameState.allChars.filter(
    (char) => char.inPlay && char.name === charName,
  );
  if (chars.length >= 0) {
    return chars[0];
  }

  return undefined;
};

export const pickFortuneTellerRedHerring = (gameState: GameState) => {
  const chars = gameState.allChars.filter(
    (char) => char.inPlay && char.alignment === Alignment.Good,
  );

  shuffleArray(chars);
  return chars[0];
};

export const parseCharTokens = (
  inputStr: string,
  instantiatedCharsById: Map<string, Character>,
) => {
  const regExp = /\{\{(.*?)\}\}/g;
  return inputStr.replace(regExp, (_match, token) => {
    const char = instantiatedCharsById.get(token);
    return `<span class="char-name ${char?.alignment}">${char?.getDisplayName()}</span>` as string;
  });
};

export const pickNotInPlayMinion = (gameState: GameState): Character => {
  const minions = gameState.allChars.filter(
    (char) => !char.inPlay && char.type === CharacterType.Minion,
  );
  shuffleArray(minions);
  return minions[0];
};

export const pickInPlayCharsofTypes = (
  gameState: GameState,
  charTypes: CharacterType[],
  excludeCharId: string,
  numChars: number,
): Character[] => {
  const chars = gameState.allChars.filter(
    (char) =>
      char.inPlay && charTypes.includes(char.type) && char.id !== excludeCharId,
  );

  shuffleArray(chars);

  const result: Character[] = [];
  while (numChars > 0) {
    result.push(chars.pop() as Character);
    numChars--;
  }

  return result;
};

export const pickDemonBluffOfType = (
  gameState: GameState,
  charType: CharacterType,
): Character => {
  const bluffs = gameState.demonBluffs.filter(
    (character) => character.type === charType,
  );

  shuffleArray(bluffs);
  return bluffs[0];
};

export const cloneChar = (char: Character) => {
  return new characterClassNameMap[char.name](char.name).fromJson(char);
};

export const getCharsById = (gameState: GameState) => {
  const charMap: Record<string, Character> = {};
  gameState?.allChars?.forEach((char) => {
    charMap[char.id] = char;
  });
  return charMap;
};
