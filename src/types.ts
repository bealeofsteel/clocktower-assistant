import { Character } from "./characters";

export interface Edition {
  getCharactersForEdition: () => CharacterSet;
  nightInstructions: {
    [NightType.First]: (CharacterName | SpecialInstructionKey)[];
    [NightType.Other]: (CharacterName | SpecialInstructionKey)[];
  };
  isTeensyville?: boolean;
  isCustom?: boolean;
}

export interface CharacterSet {
  townsfolk: Character[];
  outsiders: Character[];
  minions: Character[];
  demons: Character[];
}

export enum Alignment {
  Good = "Good",
  Evil = "Evil",
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

  Grandmother = "Grandmother",
  Sailor = "Sailor",
  Chambermaid = "Chambermaid",
  Exorcist = "Exorcist",
  Innkeeper = "Innkeeper",
  Gambler = "Gambler",
  Gossip = "Gossip",
  Courtier = "Courtier",
  Professor = "Professor",
  Minstrel = "Minstrel",
  TeaLady = "Tea Lady",
  Pacifist = "Pacifist",
  Fool = "Fool",
  Goon = "Goon",
  Lunatic = "Lunatic",
  Tinker = "Tinker",
  Moonchild = "Moonchild",
  Godfather = "Godfather",
  DevilsAdvocate = "Devil's Advocate",
  Assassin = "Assassin",
  Mastermind = "Mastermind",
  Zombuul = "Zombuul",
  Pukka = "Pukka",
  Shabaloth = "Shabaloth",
  Po = "Po",

  Noble = "Noble",
  Cannibal = "Cannibal",
  Marionette = "Marionette",
  Amnesiac = "Amnesiac",
  Balloonist = "Balloonist",
  Fisherman = "Fisherman",
  Widow = "Widow",
  Goblin = "Goblin",
  Leviathan = "Leviathan",
}

export enum EditionName {
  TroubleBrewing = "Trouble Brewing",
  SectsAndViolets = "Sects & Violets",
  BadMoonRising = "Bad Moon Rising",
  NoGreaterJoy = "No Greater Joy",
  EveryoneCanPlay = "Everyone Can Play",
  PiesBaking = "Pies Baking",
  LaissezUnFaire = "Laissez un Faire",
}

export interface GameState {
  playerCount: number;
  edition: EditionName;
  nightInstructions: {
    first: Instruction[];
    other: Instruction[];
  };
  startingInfoSuggestions: Record<string, string>;
  otherNightSuggestions: Record<string, string>;
  allCharNamesForEdition: {
    townsfolk: CharacterName[];
    outsiders: CharacterName[];
    minions: CharacterName[];
    demons: CharacterName[];
  };
  allChars: Character[];
  demonBluffs: Character[];
  randomTools: {
    filters: {
      charType: Filter[];
      inPlay: Filter[];
      alignment: Filter[];
      lifeStatus: Filter[];
    };
    randomizedResult: string;
  };
  generatedInfo: Partial<Record<CharacterName, Record<string, string[]>>>;
  storytellerNotes: string;
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
  Dawn = "Dawn",
  MarionetteSetup = "Marionette Setup",
  MarionetteInfo = "Marionette Info",
  CannibalReminder = "Cannibal Reminder",
}

export enum CharacterType {
  Townsfolk = "Townsfolk",
  Outsider = "Outsider",
  Minion = "Minion",
  Demon = "Demon",
}

export enum NightType {
  First = "first",
  Other = "other",
}

export interface Instruction {
  key: string;
  label: string;
  message: string;
  charId?: string;
  checked?: boolean;
}

export interface Filter {
  name: string;
  value?: CharacterType | Alignment | boolean;
  checked: boolean;
}
