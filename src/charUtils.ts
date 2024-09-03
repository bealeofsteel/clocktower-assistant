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
export const pickRandomCharOfTypeInPlay = (gameState: GameState, charType: CharacterType): InPlayCharResult => {
    const gameStateField = charTypeToGameStateFieldMapping[charType];
    const inPlayCharResult: InPlayCharResult[] = gameState[gameStateField].map((char) => { return { character: char } });

    if (charType === CharacterType.Townsfolk || charType === CharacterType.Outsider) {
        const spy = findCharIfInPlay(gameState, CharacterType.Minion, CharacterName.Spy);
        if (spy) {
            const randomChar = pickRandomCharOfType(gameState, charType);
            inPlayCharResult.push({ character: spy, registersAs: randomChar.name });
        }
    } else if (charType === CharacterType.Minion || charType === CharacterType.Demon) {
        const recluse = findCharIfInPlay(gameState, CharacterType.Outsider, CharacterName.Recluse);
        if (recluse) {
            const randomChar = pickRandomCharOfType(gameState, charType);
            inPlayCharResult.push({ character: recluse, registersAs: randomChar.name });
        }
    }

    shuffleArray(inPlayCharResult);
    return inPlayCharResult[0];
};

// Picks a random character of the specified type out of all the characters in the edition (not just in play)
export const pickRandomCharOfType = (gameState: GameState, charType: CharacterType): Character => {
    const gameStateField = charTypeToGameStateFieldMapping[charType];
    const chars = Array.from(gameState[gameStateField]);
    gameState.notInPlay.forEach((char) => {
        if (char.type === charType) {
            chars.push(char);
        }
    });

    shuffleArray(chars);
    return chars[0];
};

export const pickRandomCharacterInPlay = (gameState: GameState, excludeChars?: CharacterName[]): Character | undefined => {
    const allChars = getAllCharsInPlay(gameState);
    shuffleArray(allChars);

    if (excludeChars) {
        for (let i = 0; i < allChars.length; i++) {
            const char = allChars[i];
            if (excludeChars.includes(char.name)) {
                continue;
            } else {
                return char;
            }
        }
    } else {
        return allChars[0];
    }

    return undefined;
};

const findCharIfInPlay = (gameState: GameState, charType: CharacterType, charName: CharacterName) => {
    const gameStateField = charTypeToGameStateFieldMapping[charType];
    for (let i = 0; i < gameState[gameStateField].length; i++) {
        if (gameState[gameStateField][i].name === charName) {
            return gameState[gameStateField][i];
        }
    }

    return undefined;
};
