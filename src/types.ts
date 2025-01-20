import { Character } from "./characters";
import { Instruction, NightType} from "./components/NightInfo/NightInfo";

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
    Good = "Good",
    Evil = "Evil"
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
    Imp = "Imp",
    Clockmaker = "Clockmaker",
    Dreamer = "Dreamer",
    SnakeCharmer = "Snake Charmer",
    Mathematician = "Mathematician",
    Flowergirl = "Flowergirl",
    TownCrier = "Town Crier",
    Oracle = "Oracle",
    Savant = "Savant",
    Seamstress = "Seamstress",
    Philosopher = "Philosopher",
    Artist = "Artist",
    Juggler = "Juggler",
    Sage = "Sage",
    Mutant = "Mutant",
    Sweetheart = "Sweetheart",
    Barber = "Barber",
    Klutz = "Klutz",
    EvilTwin = "Evil Twin",
    Witch = "Witch",
    Cerenovous = "Cerenovous",
    PitHag = "Pit-Hag",
    FangGu = "Fang Gu",
    Vigormortis = "Vigormortis",
    NoDashii = "No Dashii",
    Vortox = "Vortox",
}

export enum EditionName {
    TroubleBrewing = "Trouble Brewing",
    SectsAndViolets = "Sects & Violets",
}

export interface GameState {
    playerCount: number;
    edition: EditionName;
    nightInstructions: {
        first: Instruction[];
        other: Instruction[];
    }
    startingInfoSuggestions: Partial<Record<CharacterName, string>>;
    allCharNamesForEdition: {
        townsfolk: CharacterName[],
        outsiders: CharacterName[],
        minions: CharacterName[],
        demons: CharacterName[],
    },
    allChars: Character[],
    demonBluffs: Character[];
}

export interface PlayerSetup {
    townsfolkToPick: number;
    outsidersToPick: number;
    minionsToPick: number;
    demonsToPick: number;
}

export enum SpecialInstructionKey {
    Dusk = "Dusk",
    MinionInfo = "Minion Info",
    DemonInfo = "Demon Info",
    Dawn = "Dawn"
}

export enum CharacterType {
    Townsfolk = "Townsfolk",
    Outsider = "Outsider",
    Minion = "Minion",
    Demon = "Demon"
}
