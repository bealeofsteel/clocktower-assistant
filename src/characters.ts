import { Alignment, CharacterName, GameState, PlayerSetup } from "./types";

export class Character {
    name: string;
    alignment: Alignment;
    isDead: boolean;

    constructor(name: string, alignment: Alignment) {
        this.name = name;
        this.alignment = alignment;
        this.isDead = false;
    }

    // Do nothing, some classes will override
    onPicked(_playerSetup: PlayerSetup, _gameState: GameState) {}

    getDisplayName() {
        return this.name;
    }
}

export class Townsfolk extends Character {
    constructor(name: string) {
        super(name, Alignment.Good);
    }
}

export class Outsider extends Character {
    constructor(name: string) {
        super(name, Alignment.Good);
    }
}

export class Minion extends Character {
    constructor(name: string) {
        super(name, Alignment.Evil);
    }
}

export class Demon extends Character {
    constructor(name: string) {
        super(name, Alignment.Evil);
    }
}

export class Baron extends Minion {
    constructor() {
        super(CharacterName.Baron);
    }

    onPicked(playerSetup: PlayerSetup) {
        playerSetup.outsidersToPick += 2;
    }
}

export class Drunk extends Outsider {
    mistakenIdentity: string | undefined;

    constructor() {
        super(CharacterName.Drunk);
    }

    onPicked(_playerSetup: PlayerSetup, gameState: GameState) {
        const character = gameState.townsfolk.available.pop() as Character;
        this.mistakenIdentity = character.name;
    }

    getDisplayName() {
        return `${CharacterName.Drunk} (${this.mistakenIdentity})`;
    }
}