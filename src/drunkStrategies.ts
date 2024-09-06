import { pickDemonBluffOfType, pickCharsofTypes, pickNotInPlayMinion } from "./charUtils";
import { playerCountConfig } from "./gameSettings";
import { shuffleArray } from "./randomUtils";
import { CharacterName, CharacterType, CharGroup, GameState } from "./types";

export abstract class DrunkStrategy {

    gameQualifiesForStrategy(_gameState: GameState): boolean {
        return true;
    }

    abstract getInstructionsForStrategy(_gameState: GameState): string
}

export class FrameGoodPlayersAsMinion extends DrunkStrategy {

    getInstructionsForStrategy(gameState: GameState): string {
        const minion = pickNotInPlayMinion(gameState);
        const chars = pickCharsofTypes(gameState, [CharGroup.Townsfolk, CharGroup.Outsiders], CharacterName.Drunk, 2);

        return `Show the ${minion.name} character token. Point to {{${chars[0].name}}} and {{${chars[1].name}}}.`;
    }
}

const supportDemonBluffOfType = (gameState: GameState, charType: CharacterType) => {
    const bluff = pickDemonBluffOfType(gameState, charType);
    const goodChars = pickCharsofTypes(gameState, [CharGroup.Townsfolk, CharGroup.Outsiders], CharacterName.Drunk, 1);

    const charsToPointTo = [goodChars[0], gameState.demons[0]];
    shuffleArray(charsToPointTo);

    return `Show the ${bluff.name} character token. Point to {{${charsToPointTo[0].name}}} and {{${charsToPointTo[1].name}}}.`;
};

export class SupportDemonTownsfolkBluff extends DrunkStrategy {

    getInstructionsForStrategy(gameState: GameState): string {
        return supportDemonBluffOfType(gameState, CharacterType.Townsfolk);
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
        return supportDemonBluffOfType(gameState, CharacterType.Outsider);
    }
}

export class FrameTownsfolkAsDrunk extends DrunkStrategy {

    getInstructionsForStrategy(gameState: GameState): string {
        const goodChars = pickCharsofTypes(gameState, [CharGroup.Townsfolk], CharacterName.Drunk, 2);

        return `Show the ${CharacterName.Drunk} character token. Point to {{${goodChars[0].name}}} and {{${goodChars[1].name}}}.`;
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