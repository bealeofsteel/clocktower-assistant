import { Character } from "./characters";
import { NightType, SpecialInstructionKey} from "./components/NightInfo/NightInfo";

export type NightInstructions = Partial<Record<CharacterName, string>>[]

export interface Edition {
    getCharactersForEdition: () => CharacterSet;
    nightInstructions: {
        [NightType.First]: (CharacterName | SpecialInstructionKey)[];
        [NightType.Other]: (CharacterName | SpecialInstructionKey)[];
    }
}

export interface CharacterSet {
    townsfolk: Character[];
    outsiders: Character[];
    minions: Character[];
    demons: Character[];
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

export enum EditionName {
    TroubleBrewing = "Trouble Brewing"
}

export interface AssignedChars extends CharacterSet {
    demonBluffs: Character[];
    notInUse: Character[];
}

export interface GameState extends AssignedChars {
    playerCount: number;
    edition: EditionName;
}

export interface PlayerSetup {
    townsfolkToPick: number;
    outsidersToPick: number;
    minionsToPick: number;
    demonsToPick: number;
}
