import { InPlayCharResult, pickFortuneTellerRedHerring, pickRandomCharacterInPlay, pickRandomCharOfTypeInPlay } from "./charUtils";
import { DrunkStrategy, FrameGoodPlayersAsMinion, ClaimZeroOutsiders, FrameTownsfolkAsDrunk, SupportDemonOutsiderBluff, SupportDemonTownsfolkBluff } from "./drunkStrategies";
import { shuffleArray } from "./randomUtils";
import { Alignment, CharacterName, CharacterSet, CharacterType, GameState, PlayerSetup } from "./types";

export class Character {
    id: string;
    name: CharacterName;
    type: CharacterType;
    alignment: Alignment;
    isDead: boolean;
    playerName: string;
    isDrunkMistakenIdentity: boolean;
    inPlay: boolean;

    constructor(name: CharacterName, type: CharacterType = CharacterType.Townsfolk, alignment: Alignment = Alignment.Good) {
        this.id = crypto.randomUUID();
        this.name = name;
        this.type = type;
        this.alignment = alignment;
        this.isDead = false;
        this.playerName = "";
        this.isDrunkMistakenIdentity = false;
        this.inPlay = false;
    }

    // Do nothing, some classes will override
    onPicked(_playerSetup: PlayerSetup, _availableChars: CharacterSet, _allChars: Character[]) {}

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

    getDrunkStrategies(_charId: string): DrunkStrategy[] | undefined {
        return;
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
        return getPointToCharOfTypeAndOtherCharSuggestion(gameState, CharacterType.Townsfolk, this.id);
    }

    getDrunkStrategies(charId: string): DrunkStrategy[] | undefined {
        return [new SupportDemonTownsfolkBluff(charId)];
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
        return getPointToCharOfTypeAndOtherCharSuggestion(gameState, CharacterType.Outsider, this.id);
    }

    getDrunkStrategies(charId: string): DrunkStrategy[] | undefined {
        return [new ClaimZeroOutsiders(charId), new FrameTownsfolkAsDrunk(charId), new SupportDemonOutsiderBluff(charId)];
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
        return getPointToCharOfTypeAndOtherCharSuggestion(gameState, CharacterType.Minion, this.id);
    }

    getDrunkStrategies(charId: string): DrunkStrategy[] | undefined {
        return [new FrameGoodPlayersAsMinion(charId)];
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

    getStartingInfoSuggestion(gameState: GameState): string {
        const pickedChar = pickFortuneTellerRedHerring(gameState);
        return `The RED HERRING is {{${pickedChar.id}}}.`;
    }
}

const butlerInstructions = "The Butler chooses a player. ⚫️";

export class Butler extends Character {
    constructor() {
        super(CharacterName.Butler, CharacterType.Outsider);
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
        super(CharacterName.Imp, CharacterType.Demon, Alignment.Evil);
    }

    getOtherNightsInstructions() {
        return "The Imp chooses a player. ⚫️ If the Imp chose themselves: Replace 1 alive Minion token with a spare Imp token. Put the old Imp to sleep. Wake the new Imp. Show the YOU ARE token, then show the Imp token.";
    }
}

export class Drunk extends Character {
    mistakenIdentity: Character | undefined;
    firstNightInstructions: string | undefined;
    otherNightsInstructions: string | undefined;

    constructor() {
        super(CharacterName.Drunk, CharacterType.Outsider);
    }

    onPicked(_playerSetup: PlayerSetup, availableChars: CharacterSet, allChars: Character[]) {
        const character = availableChars.townsfolk.pop() as Character;
        character.isDrunkMistakenIdentity = true;
        this.mistakenIdentity = character;
        this.firstNightInstructions = character.getFirstNightInstructions();
        this.otherNightsInstructions = character.getOtherNightsInstructions();
        allChars.push(character);
    }

    getDisplayName(): string {
        let name = this.mistakenIdentity ? `${CharacterName.Drunk} (${this.mistakenIdentity.name})` : CharacterName.Drunk;
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
        return this.mistakenIdentity?.name as CharacterName;
    }

    canBeDemonBluff(): boolean {
        return false;
    }

    getStartingInfoSuggestion(gameState: GameState): string | undefined {
        let strategies = this.mistakenIdentity?.getDrunkStrategies(this.id);
        if (strategies) {
            strategies = strategies?.filter((strategy) => strategy.gameQualifiesForStrategy(gameState));

            shuffleArray(strategies);
            return strategies[0].getInstructionsForStrategy(gameState);
        }
    }
}

const getPointToCharOfTypeAndOtherCharSuggestion = (gameState: GameState, charType: CharacterType, currentCharId: string) => {
    if (gameState.allChars.filter((char) => char.type === charType).length === 0) {
        return "Show a zero.";
    }

    // This gets returned in a different format because the character might register as something else
    const pickedCharResult: InPlayCharResult = pickRandomCharOfTypeInPlay(gameState, charType, currentCharId);
    const otherChar = pickRandomCharacterInPlay(gameState, [currentCharId, pickedCharResult.character.id]);

    const charsToPointTo = [pickedCharResult.character, otherChar];
    shuffleArray(charsToPointTo);

    const char = pickedCharResult.registersAs ? pickedCharResult.registersAs : pickedCharResult.character;

    const prefix = `Show the ${char.name} character token. `;
    let suffix = "";

    if (Math.random() < 0.5) {
        suffix = `Point to {{${char.id}}} (${charType}) and {{${otherChar.id}}} (Wrong).`
    } else {
        suffix = `Point to {{${otherChar.id}}} (Wrong) and {{${char.id}}} (${charType}).`
    }

    return prefix + suffix;
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