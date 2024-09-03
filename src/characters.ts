import { InPlayCharResult, pickRandomCharacterInPlay, pickRandomCharOfTypeInPlay } from "./charUtils";
import { shuffleArray } from "./randomUtils";
import { Alignment, CharacterName, CharacterSet, CharacterType, charTypeToGameStateFieldMapping, GameState, PlayerSetup } from "./types";

export class Character {
    name: CharacterName;
    type: CharacterType;
    alignment: Alignment;
    isDead: boolean;
    playerName: string;
    isDrunkMistakenIdentity: boolean;

    constructor(name: CharacterName, type: CharacterType = CharacterType.Townsfolk, alignment: Alignment = Alignment.Good) {
        this.name = name;
        this.type = type;
        this.alignment = alignment;
        this.isDead = false;
        this.playerName = "";
        this.isDrunkMistakenIdentity = false;
    }

    // Do nothing, some classes will override
    onPicked(_playerSetup: PlayerSetup, _availableChars: CharacterSet, _gameState: GameState) {}

    getDisplayName(): string {
        let name: string = this.name;

        if (this.isDrunkMistakenIdentity) {
            name += " (token used by Drunk)";
        }

        if (this.playerName) {
            name += ` [${this.playerName}]`;
        }

        return name;
    }

    getFirstNightInstructions(): string | undefined {
        return;
    }

    getOtherNightsInstructions(): string | undefined {
        return;
    }

    getStartingInfoSuggestion(_gameState: GameState): string | undefined {
        return;
    }

    getIdentityForInstructions(): CharacterName {
        return this.name;
    }

    canBeDemonBluff(): boolean {
        return true;
    }

    fromJson(json: Character): Character {
        return Object.assign(this, json);
    }
}

export class Washerwoman extends Character {
    constructor() {
        super(CharacterName.Washerwoman);
    }

    getFirstNightInstructions() {
        return "Show the Townsfolk character token. Point to both the TOWNSFOLK and WRONG players.";;
    }

    getStartingInfoSuggestion(gameState: GameState): string {
        return getPointToTwoCharsOfTypeSuggestion(gameState, CharacterType.Townsfolk, this.name);
    }
}

export class Librarian extends Character {
    constructor() {
        super(CharacterName.Librarian);
    }

    getFirstNightInstructions() {
        return "Show the Outsider character token. Point to both the OUTSIDER and WRONG players.";
    }

    getStartingInfoSuggestion(gameState: GameState): string {
        return getPointToTwoCharsOfTypeSuggestion(gameState, CharacterType.Outsider, this.name);
    }
}

export class Investigator extends Character {
    constructor() {
        super(CharacterName.Investigator);
    }

    getFirstNightInstructions() {
        return "Show the Minion character token. Point to both the MINION and WRONG players.";
    }

    getStartingInfoSuggestion(gameState: GameState): string {
        return getPointToTwoCharsOfTypeSuggestion(gameState, CharacterType.Minion, this.name);
    }
}

const giveAFingerSignal = "Give a finger signal."

export class Chef extends Character {
    constructor() {
        super(CharacterName.Chef);
    }

    getFirstNightInstructions() {
        return giveAFingerSignal;
    }
}

export class Empath extends Character {
    constructor() {
        super(CharacterName.Empath);
    }

    getFirstNightInstructions() {
        return giveAFingerSignal;
    }

    getOtherNightsInstructions() {
        return giveAFingerSignal;
    }
}

const fortuneTellerInstructions = "The Fortune Teller chooses 2 players. Nod if either is the Demon (or the RED HERRING).";

export class FortuneTeller extends Character {
    constructor() {
        super(CharacterName.FortuneTeller);
    }

    getFirstNightInstructions() {
        return fortuneTellerInstructions;
    }

    getOtherNightsInstructions() {
        return fortuneTellerInstructions;
    }
}

const butlerInstructions = "The Butler chooses a player. ⚫️";

export class Butler extends Character {
    constructor() {
        super(CharacterName.Butler);
    }

    getFirstNightInstructions() {
        return butlerInstructions;
    }

    getOtherNightsInstructions() {
        return butlerInstructions;
    }
}

export class Monk extends Character {
    constructor() {
        super(CharacterName.Monk);
    }

    getOtherNightsInstructions() {
        return "The Monk chooses a player. ⚫️";
    }
}

export class Ravenkeeper extends Character {
    constructor() {
        super(CharacterName.Ravenkeeper);
    }

    getOtherNightsInstructions() {
        return "If the Ravenkeeper died tonight, the Ravenkeeper chooses a player. Show that player's character token."
    }
}

export class Undertaker extends Character {
    constructor() {
        super(CharacterName.Undertaker);
    }

    getOtherNightsInstructions() {
        return "If a player was executed today, show their character token."
    }
}

export class Baron extends Character {
    constructor() {
        super(CharacterName.Baron, CharacterType.Minion, Alignment.Evil);
    }

    onPicked(playerSetup: PlayerSetup) {
        playerSetup.outsidersToPick += 2;
        playerSetup.townsfolkToPick -= 2;
    }
}

const poisonerInstructions = "The Poisoner chooses a player. ⚫️";

export class Poisoner extends Character {
    constructor() {
        super(CharacterName.Poisoner, CharacterType.Minion, Alignment.Evil);
    }

    getFirstNightInstructions() {
        return poisonerInstructions;
    }

    getOtherNightsInstructions() {
        return poisonerInstructions;
    }
}

const spyInstructions = "Show the Grimoire for as long as the Spy needs.";

export class Spy extends Character {
    constructor() {
        super(CharacterName.Spy, CharacterType.Minion, Alignment.Evil);
    }

    getFirstNightInstructions() {
        return spyInstructions;
    }

    getOtherNightsInstructions() {
        return spyInstructions;
    }
}

export class ScarletWoman extends Character {
    constructor() {
        super(CharacterName.ScarletWoman, CharacterType.Minion, Alignment.Evil);
    }

    getOtherNightsInstructions() {
        return "If the Scarlet Woman became the Imp today, show them the YOU ARE token, then the Imp token.";
    }
}

export class Imp extends Character {
    constructor() {
        super(CharacterName.Imp, CharacterType.Minion, Alignment.Evil);
    }

    getOtherNightsInstructions() {
        return "The Imp chooses a player. ⚫️ If the Imp chose themselves: Replace 1 alive Minion token with a spare Imp token. Put the old Imp to sleep. Wake the new Imp. Show the YOU ARE token, then show the Imp token.";
    }
}

export class Drunk extends Character {
    mistakenIdentity: CharacterName | undefined;
    firstNightInstructions: string | undefined;
    otherNightsInstructions: string | undefined;

    constructor() {
        super(CharacterName.Drunk, CharacterType.Outsider);
    }

    onPicked(_playerSetup: PlayerSetup, availableChars: CharacterSet, gameState: GameState, ) {
        const character = availableChars.townsfolk.pop() as Character;
        character.isDrunkMistakenIdentity = true;
        gameState.notInPlay.push(character);
        this.mistakenIdentity = character.name;
        this.firstNightInstructions = character.getFirstNightInstructions();
        this.otherNightsInstructions = character.getOtherNightsInstructions();
    }

    getDisplayName(): string {
        let name = this.mistakenIdentity ? `${CharacterName.Drunk} (${this.mistakenIdentity})` : CharacterName.Drunk;
        if (this.playerName) {
            name += ` [${this.playerName}]`;
        }
        return name;
    }

    getFirstNightInstructions() {
        return this.firstNightInstructions;
    }

    getOtherNightsInstructions() {
        return this.otherNightsInstructions;
    }

    getIdentityForInstructions() {
        return this.mistakenIdentity as CharacterName;
    }

    canBeDemonBluff(): boolean {
        return false;
    }
}

const getPointToTwoCharsOfTypeSuggestion = (gameState: GameState, charType: CharacterType, currentChar: CharacterName) => {
    const gameStateField = charTypeToGameStateFieldMapping[charType];
    if (gameState[gameStateField].length === 0) {
        return "Show a zero.";
    }

    const pickedCharResult: InPlayCharResult = pickRandomCharOfTypeInPlay(gameState, charType);
    const otherChar = pickRandomCharacterInPlay(gameState, [currentChar, pickedCharResult.character.name]) as Character;

    const charsToPointTo = [pickedCharResult.character, otherChar];
    shuffleArray(charsToPointTo);

    return `Show the ${pickedCharResult.registersAs || pickedCharResult.character.name} character token. Point to {{${charsToPointTo[0].name}}} and {{${charsToPointTo[1].name}}}.`;
};

export const characterClassNameMap: Partial<Record<CharacterName, new() => Character>> = {
    [CharacterName.Baron]: Baron,
    [CharacterName.Drunk]: Drunk,
    [CharacterName.Poisoner]: Poisoner,
    [CharacterName.Spy]: Spy,
    [CharacterName.Washerwoman]: Washerwoman,
    [CharacterName.Librarian]: Librarian,
    [CharacterName.Investigator]: Investigator,
    [CharacterName.Chef]: Chef,
    [CharacterName.Empath]: Empath,
    [CharacterName.FortuneTeller]: FortuneTeller,
    [CharacterName.Butler]: Butler,
    [CharacterName.Monk]: Monk,
    [CharacterName.ScarletWoman]: ScarletWoman,
    [CharacterName.Imp]: Imp,
    [CharacterName.Ravenkeeper]: Ravenkeeper,
    [CharacterName.Undertaker]: Undertaker,
  };