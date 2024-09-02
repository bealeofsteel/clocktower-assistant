import { Character, Drunk } from "./characters";
import { GameState, CharacterName, AssignedChars } from "./types";

const inPlayCharGroups = ["townsfolk", "outsiders", "minions", "demons"];

interface InstructionsIncludedResult {
    shouldInclude: boolean;
    character?: Character;
}

export const shouldIncludeCharacterInstructions = (gameState: GameState, charName: CharacterName): InstructionsIncludedResult => {
    for (let i = 0; i < inPlayCharGroups.length; i++) {
        const charGroup = inPlayCharGroups[i] as keyof AssignedChars;
        for (let j = 0; j < gameState[charGroup].length; j++) {
            const character = gameState[charGroup][j];
            if (character.name === charName || (character instanceof Drunk && character.mistakenIdentity === charName)) {
                return {
                    shouldInclude: true,
                    character
                };
            }
        }
    }
    
    return { shouldInclude: false };
};

export const getAllCharsInPlay = (gameState: GameState): Character[] => {
    return gameState.townsfolk.concat(gameState.outsiders, gameState.minions, gameState.demons);
};