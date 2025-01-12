import { pickDemonBluffOfType, pickInPlayCharsofTypes, pickNotInPlayMinion } from "./charUtils";
import { playerCountConfig } from "./gameSettings";
import { shuffleArray } from "./randomUtils";
import { CharacterName, CharacterType, GameState } from "./types";

export abstract class DrunkStrategy {

    charId: string;

    constructor(charId: string) {
        this.charId = charId;
    }

    gameQualifiesForStrategy(_gameState: GameState): boolean {
        return true;
    }

    abstract getInstructionsForStrategy(_gameState: GameState): string
}

export class FrameGoodPlayersAsMinion extends DrunkStrategy {

    getInstructionsForStrategy(gameState: GameState): string {
        const minion = pickNotInPlayMinion(gameState);
        const chars = pickInPlayCharsofTypes(gameState, [CharacterType.Townsfolk, CharacterType.Outsider], this.charId, 2);

        return `Show the ${minion.name} character token. Point to {{${chars[0].id}}} and {{${chars[1].id}}}.`;
    }
}

const supportDemonBluffOfType = (gameState: GameState, charType: CharacterType, excludeCharId: string) => {
    const bluff = pickDemonBluffOfType(gameState, charType);
    const goodChars = pickInPlayCharsofTypes(gameState, [CharacterType.Townsfolk, CharacterType.Outsider], excludeCharId, 1);

    const demons = Array.from(gameState.allChars.filter((char) => char.inPlay && char.type === CharacterType.Demon));
    shuffleArray(demons);

    const charsToPointTo = [goodChars[0], demons[0]];
    shuffleArray(charsToPointTo);

    return `Show the ${bluff.name} character token. Point to {{${charsToPointTo[0].id}}} and {{${charsToPointTo[1].id}}}.`;
};

export class SupportDemonTownsfolkBluff extends DrunkStrategy {

    getInstructionsForStrategy(gameState: GameState): string {
        return supportDemonBluffOfType(gameState, CharacterType.Townsfolk, this.charId);
    }
}

export class SupportDemonOutsiderBluff extends DrunkStrategy {

    gameQualifiesForStrategy(gameState: GameState): boolean {
        for (const bluff of gameState.demonBluffs) {
            if (bluff.type === CharacterType.Outsider) {
                return true;
            }
        }
        return false;
    }

    getInstructionsForStrategy(gameState: GameState): string {
        return supportDemonBluffOfType(gameState, CharacterType.Outsider, this.charId);
    }
}

export class FrameTownsfolkAsDrunk extends DrunkStrategy {

    getInstructionsForStrategy(gameState: GameState): string {
        const goodChars = pickInPlayCharsofTypes(gameState, [CharacterType.Townsfolk], this.charId, 2);

        return `Show the ${CharacterName.Drunk} character token. Point to {{${goodChars[0].id}}} and {{${goodChars[1].id}}}.`;
    }
}

export class ClaimZeroOutsiders extends DrunkStrategy {

    gameQualifiesForStrategy(gameState: GameState): boolean {
        return playerCountConfig[gameState.playerCount].outsiders === 0;
    }

    getInstructionsForStrategy(_gameState: GameState): string {
        return "Show a zero.";
    }
}