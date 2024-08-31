import { Character, Demon, Minion, Outsider, Townsfolk } from "./characters";

export interface Edition {
    name: string;
    setupNewGame: () => CharacterSet
}

interface CharacterSet {
    allTownsfolk: Townsfolk[];
    allOutsiders: Outsider[];
    allMinions: Minion[];
    allDemons: Demon[];
}

export enum Alignment {
    Good = "good",
    Evil = "evil"
}

export enum CharacterName {
    Washerwoman = "Washerwoman",
    Librarian = "Librarian",
    Investigator = "Investigator",
    Chef = "Chef",
    Empath = "Empath",
    FortuneTeller = "Fortune Teller",
    Undertaker = "Undertaker",
    Monk = "Monk",
    Ravenkeeper = "Ravenkeeper",
    Virgin = "Virgin",
    Slayer = "Slayer",
    Soldier = "Soldier",
    Mayor = "Mayor",
    Butler = "Butler",
    Drunk = "Drunk",
    Recluse = "Recluse",
    Saint = "Saint",
    Poisoner = "Poisoner",
    Spy = "Spy",
    ScarletWoman = "Scarlet Woman",
    Baron = "Baron",
    Imp = "Imp"
}

export interface GameState {
    townsfolk: CharAvailability<Townsfolk>;
    outsiders: CharAvailability<Outsider>;
    minions: CharAvailability<Minion>;
    demons: CharAvailability<Demon>;
    demonBluffs: Character[];
}

export interface CharAvailability<T> {
    picked: T[];
    available: T[];
}

export interface PlayerSetup {
    townsfolkToPick: number;
    outsidersToPick: number;
    minionsToPick: number;
    demonsToPick: number;
}
