import { Character } from "./characters";
import { shuffleArray } from "./randomUtils";
import { GameState, CharacterName, charTypeToGameStateFieldMapping, CharacterType } from "./types";

export const getAllCharsInPlay = (gameState: GameState): Character[] => {
    return gameState.townsfolk.concat(gameState.outsiders, gameState.minions, gameState.demons);
};

export interface InPlayCharResult {
    character: Character,
    registersAs?: CharacterName
}

// Picks a random in-play char of the specified type, with the spy and recluse possibly registering as another character
export const pickRandomCharOfTypeInPlay = (gameState: GameState, charType: CharacterType, excludeChar: CharacterName): InPlayCharResult => {
    const gameStateField = charTypeToGameStateFieldMapping[charType];
    const inPlayCharResults: InPlayCharResult[] = gameState[gameStateField].map((char) => { return { character: char } });

    if (charType === CharacterType.Townsfolk || charType === CharacterType.Outsider) {
        const spy = findCharIfInPlay(gameState, CharacterType.Minion, CharacterName.Spy);
        if (spy) {
            const randomChar = pickRandomCharOfType(gameState, charType, excludeChar);
            inPlayCharResults.push({ character: spy, registersAs: randomChar.name });
        }
    } else if (charType === CharacterType.Minion || charType === CharacterType.Demon) {
        const recluse = findCharIfInPlay(gameState, CharacterType.Outsider, CharacterName.Recluse);
        if (recluse) {
            const randomChar = pickRandomCharOfType(gameState, charType, excludeChar);
            inPlayCharResults.push({ character: recluse, registersAs: randomChar.name });
        }
    }

    shuffleArray(inPlayCharResults);
    for (const result of inPlayCharResults) {
        if (result.character.name !== excludeChar) {
            return result;
        }
    }

    return inPlayCharResults[0];
};

// Picks a random character of the specified type out of all the characters in the edition (not just in play)
export const pickRandomCharOfType = (gameState: GameState, charType: CharacterType, excludeChar: CharacterName): Character => {
    const gameStateField = charTypeToGameStateFieldMapping[charType];
    const chars = Array.from(gameState[gameStateField]);
    gameState.notInPlay.forEach((char) => {
        if (char.type === charType) {
            chars.push(char);
        }
    });

    shuffleArray(chars);
    for (const char of chars) {
        if (char.name !== excludeChar) {
            return char;
        }
    }

    return chars[0];
};

export const pickRandomCharacterInPlay = (gameState: GameState, excludeChars?: CharacterName[]): Character => {
    const allChars = getAllCharsInPlay(gameState);
    shuffleArray(allChars);

    if (excludeChars) {
        for (const char of allChars) {
            if (excludeChars.includes(char.name)) {
                continue;
            } else {
                return char;
            }
        }
    }
    
    return allChars[0];
};

const findCharIfInPlay = (gameState: GameState, charType: CharacterType, charName: CharacterName) => {
    const gameStateField = charTypeToGameStateFieldMapping[charType];
    for (const char of gameState[gameStateField]) {
        if (char.name === charName) {
            return char;
        }
    }

    return undefined;
};

export const pickFortuneTellerRedHerring = (gameState: GameState) => {
    const chars = Array.from(gameState.townsfolk);
    gameState.outsiders.forEach((char) => {
        if (char.name !== CharacterName.Recluse) {
            chars.push(char);
        }
    });

    /*const spy = findCharIfInPlay(gameState, CharacterType.Minion, CharacterName.Spy);
    if (spy) {
        chars.push(spy);
    }*/

    shuffleArray(chars);
    return chars[0];
};

export const parseCharTokens = (inputStr: string, instantiatedCharsByName: Map<CharacterName, Character>) => {
    const regExp = /\{\{(.*?)\}\}/g;
    return inputStr.replace(regExp, (_match, token) => {
        return instantiatedCharsByName.get(token)?.getDisplayName() as string;
    });
};