import { Alignment, CharacterName, CharacterSet, GameState, PlayerSetup } from "./types";

export class Character {
    name: string;
    alignment: Alignment;
    isDead: boolean;

    constructor(name: string, alignment: Alignment = Alignment.Good) {
        this.name = name;
        this.alignment = alignment;
        this.isDead = false;
    }

    // Do nothing, some classes will override
    onPicked(_playerSetup: PlayerSetup, _availableChars: CharacterSet, _gameState: GameState) {}

    getDisplayName() {
        return this.name;
    }

    static fromJson<T extends Character>(json: T): T {
        return Object.assign(new Character(json.name), json);
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

    static fromJson<Baron>(json: Baron): Baron {
        return Object.assign(new Baron(), json);
    }
}

export class Drunk extends Character {
    mistakenIdentity: string | undefined;

    constructor() {
        super(CharacterName.Drunk);
    }

    onPicked(_playerSetup: PlayerSetup, availableChars: CharacterSet, gameState: GameState, ) {
        const character = availableChars.townsfolk.pop() as Character;
        gameState.notInUse.push(character);
        this.mistakenIdentity = character.name;
    }

    getDisplayName(): string {
        return this.mistakenIdentity ? `${CharacterName.Drunk} (${this.mistakenIdentity})` : CharacterName.Drunk;
    }

    static fromJson<Drunk>(json: Drunk): Drunk {
        return Object.assign(new Drunk(), json);
    }
}