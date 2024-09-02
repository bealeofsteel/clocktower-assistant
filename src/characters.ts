import { NightType } from "./components/NightInfo/NightInfo";
import { Alignment, CharacterName, CharacterSet, GameState, PlayerSetup } from "./types";

export class Character {
    name: CharacterName;
    alignment: Alignment;
    isDead: boolean;
    nightInstructions: Partial<Record<NightType, string>>;

    constructor(name: CharacterName, alignment: Alignment = Alignment.Good) {
        this.name = name;
        this.alignment = alignment;
        this.isDead = false;
        this.nightInstructions = {};
    }

    // Do nothing, some classes will override
    onPicked(_playerSetup: PlayerSetup, _availableChars: CharacterSet, _gameState: GameState) {}

    getDisplayName(): string {
        return this.name;
    }

    getIdentityForInstructions(): CharacterName {
        return this.name;
    }

    fromJson(json: Character): Character {
        return Object.assign(this, json);
    }
}

export class Washerwoman extends Character {
    constructor() {
        super(CharacterName.Washerwoman);
        this.nightInstructions = {
            first: "Show the Townsfolk character token. Point to both the TOWNSFOLK and WRONG players."
        };
    }
}

export class Librarian extends Character {
    constructor() {
        super(CharacterName.Librarian);
        this.nightInstructions = {
            first: "Show the Outsider character token. Point to both the OUTSIDER and WRONG players."
        };
    }
}

export class Investigator extends Character {
    constructor() {
        super(CharacterName.Investigator);
        this.nightInstructions = {
            first: "Show the Minion character token. Point to both the MINION and WRONG players."
        };
    }
}

const giveAFingerSignal = "Give a finger signal."

export class Chef extends Character {
    constructor() {
        super(CharacterName.Chef);
        this.nightInstructions = {
            first: giveAFingerSignal
        };
    }
}

export class Empath extends Character {
    constructor() {
        super(CharacterName.Empath);
        this.nightInstructions = {
            first: giveAFingerSignal,
            other: giveAFingerSignal
        };
    }
}

const fortuneTellerInstructions = "The Fortune Teller chooses 2 players. Nod if either is the Demon (or the RED HERRING).";

export class FortuneTeller extends Character {
    constructor() {
        super(CharacterName.FortuneTeller);
        this.nightInstructions = {
            first: fortuneTellerInstructions,
            other: fortuneTellerInstructions
        };
    }
}

const butlerInstructions = "The Butler chooses a player. ⚫️";

export class Butler extends Character {
    constructor() {
        super(CharacterName.Butler);
        this.nightInstructions = {
            first: butlerInstructions,
            other: butlerInstructions
        };
    }
}

export class Monk extends Character {
    constructor() {
        super(CharacterName.Monk);
        this.nightInstructions = {
            other: "The Monk chooses a player. ⚫️"
        };
    }
}

export class Ravenkeeper extends Character {
    constructor() {
        super(CharacterName.Ravenkeeper);
        this.nightInstructions = {
            other: "If the Ravenkeeper died tonight, the Ravenkeeper chooses a player. Show that player's character token."
        };
    }
}

export class Undertaker extends Character {
    constructor() {
        super(CharacterName.Undertaker);
        this.nightInstructions = {
            other: "If a player was executed today, show their character token."
        };
    }
}

export class Baron extends Character {
    constructor() {
        super(CharacterName.Baron, Alignment.Evil);
    }

    onPicked(playerSetup: PlayerSetup) {
        playerSetup.outsidersToPick += 2;
        playerSetup.townsfolkToPick -= 2;
    }
}

const poisonerInstructions = "The Poisoner chooses a player. ⚫️";

export class Poisoner extends Character {
    constructor() {
        super(CharacterName.Poisoner, Alignment.Evil);
        this.nightInstructions = {
            first: poisonerInstructions,
            other: poisonerInstructions
        };
    }
}

const spyInstructions = "Show the Grimoire for as long as the Spy needs.";

export class Spy extends Character {
    constructor() {
        super(CharacterName.Spy, Alignment.Evil);
        this.nightInstructions = {
            first: spyInstructions,
            other: spyInstructions
        };
    }
}

export class ScarletWoman extends Character {
    constructor() {
        super(CharacterName.ScarletWoman, Alignment.Evil);
        this.nightInstructions = {
            other: "If the Scarlet Woman became the Imp today, show them the YOU ARE token, then the Imp token."
        };
    }
}

export class Imp extends Character {
    constructor() {
        super(CharacterName.Imp, Alignment.Evil);
        this.nightInstructions = {
            other: "The Imp chooses a player. ⚫️ If the Imp chose themselves: Replace 1 alive Minion token with a spare Imp token. Put the old Imp to sleep. Wake the new Imp. Show the YOU ARE token, then show the Imp token."
        };
    }
}

export class Drunk extends Character {
    mistakenIdentity: CharacterName | undefined;

    constructor() {
        super(CharacterName.Drunk);
    }

    onPicked(_playerSetup: PlayerSetup, availableChars: CharacterSet, gameState: GameState, ) {
        const character = availableChars.townsfolk.pop() as Character;
        gameState.notInUse.push(character);
        this.mistakenIdentity = character.name;
        this.nightInstructions = {
            first: character.nightInstructions.first,
            other: character.nightInstructions.other
        }
    }

    getDisplayName(): string {
        return this.mistakenIdentity ? `${CharacterName.Drunk} (${this.mistakenIdentity})` : CharacterName.Drunk;
    }

    getIdentityForInstructions(): CharacterName {
        return this.mistakenIdentity as CharacterName;
    }
}

export const characterClassMap: Partial<Record<CharacterName, new() => Character>> = {
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