import {
  InPlayCharResult,
  pickFortuneTellerRedHerring,
  pickRandomCharacterInPlay,
  pickRandomCharOfTypeInPlay,
} from "./charUtils";
import {
  DrunkStrategy,
  FrameGoodPlayersAsMinion,
  ClaimZeroOutsiders,
  FrameTownsfolkAsDrunk,
  SupportDemonOutsiderBluff,
  SupportDemonTownsfolkBluff,
  ShowGoodPlayersWrongTownsfolk,
  ShowGoodPlayersWrongOutsider,
  GrandmotherFrameTownsfolkAsDrunk,
  GrandmotherShowGoodPlayerWrongRole,
  GrandmotherSupportDemonBluff,
  NobleFrameGoodCharsAsEvil,
  ConfirmMarionetteAsOutsider,
  ConfirmMarionetteAsTownsfolk,
} from "./drunkStrategies";
import { playerCountConfig } from "./gameSettings";
import { shuffleArray } from "./randomUtils";
import {
  CharInPlayStatus,
  ChefInfo,
  ClockmakerInfo,
  DidPlayersGetTrueInformationLastNight,
  DreamerInfo,
  EmpathInfo,
  InvestigatorInfo,
  LibrarianInfo,
  NumOutsidersInPlay,
  SeamstressInfo,
  PlayerAlignment,
  SavantInfoStrategy,
  WasherwomanInfo,
  OracleInfo,
  ChambermaidInfo,
  ProfessorInfo,
  NobleInfo,
  ShugenjaInfo,
} from "./savantStrategies";
import {
  Alignment,
  CharacterName,
  CharacterSet,
  CharacterType,
  GameState,
  PlayerSetup,
} from "./types";

export abstract class Character {
  id: string;
  name: CharacterName;
  type: CharacterType;
  alignment: Alignment;
  isDead: boolean;
  playerName: string;
  inPlay: boolean;
  actsAsChar: Character | undefined;
  actsWhileDead: boolean;
  isDrunkOrPoisoned: boolean;

  constructor(
    name: CharacterName,
    type: CharacterType = CharacterType.Townsfolk,
    alignment: Alignment = Alignment.Good,
  ) {
    this.id = crypto.randomUUID();
    this.name = name;
    this.type = type;
    this.alignment = alignment;
    this.isDead = false;
    this.playerName = "";
    this.inPlay = false;
    this.actsWhileDead = false;
    this.isDrunkOrPoisoned = false;
  }

  // Do nothing, some classes will override
  onPicked(
    _playerSetup: PlayerSetup,
    _availableChars: CharacterSet,
    _allChars: Character[],
  ) {}

  getDisplayName(): string {
    let name: string = this.name;

    if (this.actsAsChar) {
      name += ` (${this.actsAsChar.name})`;
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

  getOtherNightSuggestion(_gameState: GameState): string | undefined {
    return;
  }

  getIdentityForInstructions(): CharacterName {
    return this.actsAsChar?.name || this.name;
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

  generateInfo(_gameState: GameState): string[] | undefined {
    return;
  }

  getPlayerNameForDisplay(): string {
    if (this.playerName) {
      return this.playerName;
    }

    return `[${this.name} player name]`;
  }

  gameQualifiesForFirstNightInfo(_gameState: GameState): boolean {
    return true;
  }

  // True for most chars, but the Vortox can't be seen by information gatherers since it causes all info to be false
  canBeSeenInPlay(): boolean {
    return true;
  }

  canActAsOtherChar(): boolean {
    return false;
  }

  isIncludedInMinionAndDemonInfo(): boolean {
    return true;
  }

  canMisregisterAlignment(): boolean {
    return false;
  }
}

export class Washerwoman extends Character {
  constructor() {
    super(CharacterName.Washerwoman);
  }

  getFirstNightInstructions() {
    return "Show the Townsfolk character token. Point to both the TOWNSFOLK and WRONG players.";
  }

  getStartingInfoSuggestion(gameState: GameState): string {
    return getPointToCharOfTypeAndOtherCharSuggestion(
      gameState,
      CharacterType.Townsfolk,
      this.id,
    );
  }

  getDrunkStrategies(charId: string): DrunkStrategy[] | undefined {
    // Include certain strategies multiple times to make them more likely to occur
    return [
      new SupportDemonTownsfolkBluff(charId),
      new SupportDemonTownsfolkBluff(charId),
      new ConfirmMarionetteAsTownsfolk(charId),
      new ConfirmMarionetteAsTownsfolk(charId),
      new ShowGoodPlayersWrongTownsfolk(charId),
    ];
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
    return getPointToCharOfTypeAndOtherCharSuggestion(
      gameState,
      CharacterType.Outsider,
      this.id,
    );
  }

  getDrunkStrategies(charId: string): DrunkStrategy[] | undefined {
    // Include certain options multiple times to make them more likely to occur
    return [
      new ClaimZeroOutsiders(charId),
      new ClaimZeroOutsiders(charId),
      new FrameTownsfolkAsDrunk(charId),
      new FrameTownsfolkAsDrunk(charId),
      new SupportDemonOutsiderBluff(charId),
      new SupportDemonOutsiderBluff(charId),
      new ConfirmMarionetteAsOutsider(charId),
      new ConfirmMarionetteAsOutsider(charId),
      new ShowGoodPlayersWrongOutsider(charId),
    ];
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
    return getPointToCharOfTypeAndOtherCharSuggestion(
      gameState,
      CharacterType.Minion,
      this.id,
    );
  }

  getDrunkStrategies(charId: string): DrunkStrategy[] | undefined {
    return [new FrameGoodPlayersAsMinion(charId)];
  }
}

const giveAFingerSignal = "Give a finger signal.";

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

const fortuneTellerInstructions =
  "The Fortune Teller chooses 2 players. Nod if either is the Demon (or the RED HERRING).";

export class FortuneTeller extends Character {
  redHerringCharId: string;

  constructor() {
    super(CharacterName.FortuneTeller);
    this.redHerringCharId = "";
  }

  getFirstNightInstructions() {
    return fortuneTellerInstructions;
  }

  getOtherNightsInstructions() {
    return fortuneTellerInstructions;
  }

  getStartingInfoSuggestion(gameState: GameState): string {
    const pickedChar = pickFortuneTellerRedHerring(gameState);
    this.redHerringCharId = pickedChar.id;
    return `The RED HERRING is {{${this.redHerringCharId}}}.`;
  }

  getOtherNightSuggestion(): string | undefined {
    return `The RED HERRING is {{${this.redHerringCharId}}}.`;
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

export class Saint extends Character {
  constructor() {
    super(CharacterName.Saint, CharacterType.Outsider);
  }
}

export class Recluse extends Character {
  constructor() {
    super(CharacterName.Recluse, CharacterType.Outsider);
  }

  canMisregisterAlignment() {
    return true;
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
    return "If the Ravenkeeper died tonight, the Ravenkeeper chooses a player. Show that player's character token.";
  }
}

export class Virgin extends Character {
  constructor() {
    super(CharacterName.Virgin);
  }
}

export class Slayer extends Character {
  constructor() {
    super(CharacterName.Slayer);
  }
}

export class Soldier extends Character {
  constructor() {
    super(CharacterName.Soldier);
  }
}

export class Mayor extends Character {
  constructor() {
    super(CharacterName.Mayor);
  }
}

export class Undertaker extends Character {
  constructor() {
    super(CharacterName.Undertaker);
  }

  getOtherNightsInstructions() {
    return "If a player was executed today, show their character token.";
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

  canMisregisterAlignment() {
    return true;
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
  constructor() {
    super(CharacterName.Drunk, CharacterType.Outsider);
    this.isDrunkOrPoisoned = true;
  }

  onPicked(
    _playerSetup: PlayerSetup,
    availableChars: CharacterSet,
    allChars: Character[],
  ) {
    const character = availableChars.townsfolk.pop() as Character;
    this.actsAsChar = character;
    allChars.push(character);
  }

  canBeDemonBluff(): boolean {
    return false;
  }

  getStartingInfoSuggestion(gameState: GameState): string | undefined {
    let strategies = this.actsAsChar?.getDrunkStrategies(this.id);
    if (strategies) {
      strategies = strategies?.filter((strategy) =>
        strategy.gameQualifiesForStrategy(gameState),
      );

      shuffleArray(strategies);
      return strategies[0].getInstructionsForStrategy(gameState);
    }
  }

  getFirstNightInstructions(): string | undefined {
    return this.actsAsChar?.getFirstNightInstructions();
  }

  getOtherNightsInstructions(): string | undefined {
    return this.actsAsChar?.getOtherNightsInstructions();
  }

  canActAsOtherChar(): boolean {
    return true;
  }
}

const getPointToCharOfTypeAndOtherCharSuggestion = (
  gameState: GameState,
  charType: CharacterType,
  currentCharId: string,
) => {
  if (
    gameState.allChars.filter((char) => char.inPlay && char.type === charType)
      .length === 0
  ) {
    return "Show a zero.";
  }

  // This gets returned in a different format because the character might register as something else
  const pickedCharResult: InPlayCharResult = pickRandomCharOfTypeInPlay(
    gameState,
    charType,
    currentCharId,
  );
  const otherChar = pickRandomCharacterInPlay(gameState, [
    currentCharId,
    pickedCharResult.character.id,
  ]);

  const charsToPointTo = [pickedCharResult.character, otherChar];
  shuffleArray(charsToPointTo);

  const charName = pickedCharResult.registersAs
    ? pickedCharResult.registersAs
    : pickedCharResult.character.name;

  const prefix = `Show the ${charName} character token. `;
  let suffix = "";

  if (Math.random() < 0.5) {
    suffix = `Point to {{${pickedCharResult.character.id}}} (${charType}) and {{${otherChar.id}}} (Wrong).`;
  } else {
    suffix = `Point to {{${otherChar.id}}} (Wrong) and {{${pickedCharResult.character.id}}} (${charType}).`;
  }

  return prefix + suffix;
};

/*
    Sects & Violets characters
*/

export class Clockmaker extends Character {
  constructor() {
    super(CharacterName.Clockmaker);
  }

  getFirstNightInstructions(): string | undefined {
    return giveAFingerSignal;
  }
}

const dreamerInstructions =
  "The Dreamer points to a player. Show 1 good and 1 evil character token, 1 of which is their character.";

export class Dreamer extends Character {
  constructor() {
    super(CharacterName.Dreamer);
  }

  getFirstNightInstructions(): string | undefined {
    return dreamerInstructions;
  }

  getOtherNightsInstructions(): string | undefined {
    return dreamerInstructions;
  }

  generateInfo(gameState: GameState): string[] | undefined {
    const goodChars = gameState.allChars.filter(
      (char) =>
        (char.type === CharacterType.Townsfolk ||
          char.type === CharacterType.Outsider) &&
        char.id !== this.id &&
        char.canBeSeenInPlay(),
    );
    const evilChars = gameState.allChars.filter(
      (char) =>
        (char.type === CharacterType.Minion ||
          char.type === CharacterType.Demon) &&
        char.id !== this.id &&
        char.canBeSeenInPlay(),
    );

    shuffleArray(goodChars);
    shuffleArray(evilChars);

    return [
      `Incorrect character to show: ${goodChars[0].name} or ${evilChars[0].name}`,
    ];
  }
}

const snakeCharmerInstructions =
  "The Snake Charmer chooses a player. If they chose the Demon: Show the YOU ARE & Demon tokens. Give a thumbs down. Swap the Snake Charmer & Demon tokens. Put the old Snake Charmer to sleep. Wake the old Demon. Show the YOU ARE and Snake Charmer tokens & give a thumbs up. ⚫️";

export class SnakeCharmer extends Character {
  constructor() {
    super(CharacterName.SnakeCharmer);
  }

  getFirstNightInstructions(): string | undefined {
    return snakeCharmerInstructions;
  }

  getOtherNightsInstructions(): string | undefined {
    return snakeCharmerInstructions;
  }
}

export class Mathematician extends Character {
  constructor() {
    super(CharacterName.Mathematician);
  }

  getFirstNightInstructions(): string | undefined {
    return giveAFingerSignal;
  }

  getOtherNightsInstructions(): string | undefined {
    return giveAFingerSignal;
  }
}

const eitherNodOrShakeYourHead = "Either nod or shake your head.";

export class Flowergirl extends Character {
  constructor() {
    super(CharacterName.Flowergirl);
  }

  getOtherNightsInstructions(): string | undefined {
    return eitherNodOrShakeYourHead;
  }
}

export class TownCrier extends Character {
  constructor() {
    super(CharacterName.TownCrier);
  }

  getOtherNightsInstructions(): string | undefined {
    return eitherNodOrShakeYourHead;
  }
}

export class Oracle extends Character {
  constructor() {
    super(CharacterName.Oracle);
  }

  getOtherNightsInstructions(): string | undefined {
    return giveAFingerSignal;
  }
}

export class Savant extends Character {
  constructor() {
    super(CharacterName.Savant);
  }

  generateInfo(gameState: GameState): string[] | undefined {
    const strategies: SavantInfoStrategy[] = [
      new CharInPlayStatus(),
      new DidPlayersGetTrueInformationLastNight(),
      new PlayerAlignment(),
      new NumOutsidersInPlay(),
      new WasherwomanInfo(),
      new LibrarianInfo(),
      new InvestigatorInfo(),
      new ChefInfo(),
      new EmpathInfo(),
      new ClockmakerInfo(),
      new DreamerInfo(),
      new OracleInfo(),
      new SeamstressInfo(),
      new ChambermaidInfo(),
      new ProfessorInfo(),
      new NobleInfo(),
      new ShugenjaInfo(),
    ];

    const trueStrategies = strategies?.filter((strategy) =>
      strategy.gameQualifiesForTrueInfo(gameState),
    );
    shuffleArray(trueStrategies);

    const falseStrategies = strategies?.filter((strategy) =>
      strategy.gameQualifiesForFalseInfo(gameState),
    );
    shuffleArray(falseStrategies);

    let trueStrategy = trueStrategies[0];
    let falseStrategy = falseStrategies[0];

    // Don't allow two of the same strategies for binary strategy types
    if (
      trueStrategies[0].constructor.name ===
        falseStrategies[0].constructor.name &&
      trueStrategies[0].isBinary
    ) {
      if (Math.random() < 0.5) {
        trueStrategy = trueStrategies[1];
      } else {
        falseStrategy = falseStrategies[1];
      }
    }

    const trueInfo = trueStrategy.getTrueInfo(gameState, this.id);
    const falseInfo = falseStrategy.getFalseInfo(gameState, this.id);

    const result = [];

    if (Math.random() < 0.5) {
      result.push(`(True): ${trueInfo}`);
      result.push(`(False): ${falseInfo}`);
    } else {
      result.push(`(False): ${falseInfo}`);
      result.push(`(True): ${trueInfo}`);
    }

    return result;
  }
}

const seamstressInstructions =
  "The Seamstress might choose 2 players. Nod or shake your head. ⚫️";

export class Seamstress extends Character {
  constructor() {
    super(CharacterName.Seamstress);
  }

  getFirstNightInstructions(): string | undefined {
    return seamstressInstructions;
  }

  getOtherNightsInstructions(): string | undefined {
    return seamstressInstructions;
  }
}

const philosopherInstructions =
  "The Philosopher might choose a character. If necessary, swap their character token. ⚫️";

export class Philosopher extends Character {
  constructor() {
    super(CharacterName.Philosopher);
  }

  getStartingInfoSuggestion(gameState: GameState): string | undefined {
    return this.actsAsChar?.getStartingInfoSuggestion(gameState);
  }

  getFirstNightInstructions(): string | undefined {
    if (this.actsAsChar) {
      return this.actsAsChar.getFirstNightInstructions();
    }

    return philosopherInstructions;
  }

  getOtherNightsInstructions(): string | undefined {
    if (this.actsAsChar) {
      return this.actsAsChar.getFirstNightInstructions();
    }

    return philosopherInstructions;
  }

  canActAsOtherChar(): boolean {
    return true;
  }
}

// This class doesn't do anything special, but I'm adding it to make it easier to re-use the character in No Greater Joy
export class Artist extends Character {
  constructor() {
    super(CharacterName.Artist);
  }
}

export class Juggler extends Character {
  constructor() {
    super(CharacterName.Juggler);
  }

  getOtherNightsInstructions(): string | undefined {
    return giveAFingerSignal;
  }
}

export class Sage extends Character {
  constructor() {
    super(CharacterName.Sage);
  }

  getOtherNightsInstructions(): string | undefined {
    return "If the Demon killed the Sage, wake the Sage and point to 2 players, 1 of which is the Demon.";
  }
}

export class Mutant extends Character {
  constructor() {
    super(CharacterName.Mutant, CharacterType.Outsider);
  }

  canBeDemonBluff(): boolean {
    return false;
  }
}

export class Sweetheart extends Character {
  constructor() {
    super(CharacterName.Sweetheart, CharacterType.Outsider);
  }

  getOtherNightsInstructions(): string | undefined {
    return "If the Sweetheart died, a player became drunk immediately. If you haven't done this yet, do so now. ⚫️";
  }
}

export class Barber extends Character {
  constructor() {
    super(CharacterName.Barber, CharacterType.Outsider);
  }

  getOtherNightsInstructions(): string | undefined {
    return "If the Barber died today or tonight, show the Demon the THIS CHARACTER SELECTED YOU & Barber tokens. If the Demon chose 2 players, wake one at a time. Show the YOU ARE token & their new character token.";
  }
}

// This class doesn't do anything special, but I'm adding it to make it easier to re-use the character in No Greater Joy
export class Klutz extends Character {
  constructor() {
    super(CharacterName.Klutz, CharacterType.Outsider);
  }
}

export class EvilTwin extends Character {
  constructor() {
    super(CharacterName.EvilTwin, CharacterType.Minion, Alignment.Evil);
  }

  getFirstNightInstructions(): string | undefined {
    return "Wake both twins. Allow eye contact. Show the good twin's character token to the Evil Twin & vice versa.";
  }

  getStartingInfoSuggestion(gameState: GameState): string | undefined {
    const inPlayOppositeAlignmentChars = gameState.allChars.filter(
      (char) => char.inPlay && char.alignment !== this.alignment,
    );
    shuffleArray(inPlayOppositeAlignmentChars);

    return `The good twin is {{${inPlayOppositeAlignmentChars[0].id}}}.`;
  }
}

const theWitchChoosesAPlayer = "The Witch chooses a player. ⚫️";

export class Witch extends Character {
  constructor() {
    super(CharacterName.Witch, CharacterType.Minion, Alignment.Evil);
  }

  getFirstNightInstructions(): string | undefined {
    return theWitchChoosesAPlayer;
  }

  getOtherNightsInstructions(): string | undefined {
    return theWitchChoosesAPlayer;
  }
}

const cerenovousInstructions =
  "The Cerenovous chooses a player & a character. ⚫️ Put the Cerenovous to sleep. Wake the target. Show the THIS CHARACTER SELECTED YOU token, the Cerenovous token, then the madness-character token.";

export class Cerenovous extends Character {
  constructor() {
    super(CharacterName.Cerenovous, CharacterType.Minion, Alignment.Evil);
  }

  getFirstNightInstructions(): string | undefined {
    return cerenovousInstructions;
  }

  getOtherNightsInstructions(): string | undefined {
    return cerenovousInstructions;
  }
}

export class PitHag extends Character {
  constructor() {
    super(CharacterName.PitHag, CharacterType.Minion, Alignment.Evil);
  }

  getOtherNightsInstructions(): string | undefined {
    return "The Pit-Hag chooses a player & a character. If they chose a character that is not in play: Put the Pit-Hag to sleep. Wake the target. Show the YOU ARE token & their new character token.";
  }
}

export class FangGu extends Character {
  constructor() {
    super(CharacterName.FangGu, CharacterType.Demon, Alignment.Evil);
  }

  getOtherNightsInstructions(): string | undefined {
    return "The Fang Gu chooses a player. ⚫️ If they chose an Outsider (once only): Replace the Outsider token with the spare Fang Gu token. Put the Fang Gu to sleep. Wake the target. Show the YOU ARE and Fang Gu tokens & give a thumbs-down. ⚫️";
  }

  onPicked(playerSetup: PlayerSetup): void {
    playerSetup.outsidersToPick += 1;
    playerSetup.townsfolkToPick -= 1;
  }
}

export class Vigormortis extends Character {
  constructor() {
    super(CharacterName.Vigormortis, CharacterType.Demon, Alignment.Evil);
  }

  getOtherNightsInstructions(): string | undefined {
    return "The Vigormortis chooses a player. ⚫️ If that player is a Minion, poison a neighboring Townsfolk. ⚫️ ⚫️";
  }

  onPicked(playerSetup: PlayerSetup): void {
    playerSetup.outsidersToPick -= 1;
    playerSetup.townsfolkToPick += 1;
  }
}

export class NoDashii extends Character {
  constructor() {
    super(CharacterName.NoDashii, CharacterType.Demon, Alignment.Evil);
  }

  getOtherNightsInstructions(): string | undefined {
    return "The No Dashii chooses a player. ⚫️";
  }
}

export class Vortox extends Character {
  constructor() {
    super(CharacterName.Vortox, CharacterType.Demon, Alignment.Evil);
  }

  getOtherNightsInstructions(): string | undefined {
    return "The Vortox chooses a player. ⚫️";
  }

  canBeSeenInPlay(): boolean {
    return false;
  }
}

/* Bad Moon Rising characters */

export class Grandmother extends Character {
  grandchildCharId: string;

  constructor() {
    super(CharacterName.Grandmother);
    this.grandchildCharId = "";
  }

  getFirstNightInstructions(): string | undefined {
    return "Point to the grandchild player & show their character token.";
  }

  getOtherNightsInstructions(): string | undefined {
    return "If the grandchild was killed by the Demon, the Grandmother dies too. ⚫️";
  }

  getStartingInfoSuggestion(gameState: GameState): string | undefined {
    const chars = gameState.allChars.filter(
      (char) =>
        char.inPlay && char.alignment === Alignment.Good && char.id !== this.id,
    );

    // Everyone Can Play includes a Spy, which can lead to this interaction
    const spyInPlay = gameState.allChars.filter(
      (char) => char.inPlay && char.name === CharacterName.Spy,
    );
    if (spyInPlay.length) {
      chars.push(spyInPlay[0]);
    }

    shuffleArray(chars);

    const grandchild = chars[0];
    this.grandchildCharId = grandchild.id;

    const prefix = `The grandchild is {{${this.grandchildCharId}}}.`;

    if (grandchild.name === CharacterName.Spy) {
      const spyCharTokens = gameState.allChars.filter(
        (char) => char.alignment === Alignment.Good,
      );
      shuffleArray(spyCharTokens);
      return prefix + ` Show the ${spyCharTokens[0].name} token.`;
    }

    return prefix;
  }

  getOtherNightSuggestion(): string | undefined {
    return `The grandchild is {{${this.grandchildCharId}}}.`;
  }

  getDrunkStrategies(charId: string): DrunkStrategy[] | undefined {
    return [
      new GrandmotherSupportDemonBluff(charId),
      new GrandmotherFrameTownsfolkAsDrunk(charId),
      new GrandmotherShowGoodPlayerWrongRole(charId),
    ];
  }
}

const sailorInstructions = "The Sailor chooses a living player. ⚫️";

export class Sailor extends Character {
  constructor() {
    super(CharacterName.Sailor);
  }

  getFirstNightInstructions(): string | undefined {
    return sailorInstructions;
  }

  getOtherNightsInstructions(): string | undefined {
    return sailorInstructions;
  }
}

const chambermaidInstructions =
  "The Chambermaid chooses 2 living players. Give a finger signal.";

export class Chambermaid extends Character {
  constructor() {
    super(CharacterName.Chambermaid);
  }

  getFirstNightInstructions(): string | undefined {
    return chambermaidInstructions;
  }

  getOtherNightsInstructions(): string | undefined {
    return chambermaidInstructions;
  }
}

export class Exorcist extends Character {
  constructor() {
    super(CharacterName.Exorcist);
  }

  getOtherNightsInstructions(): string | undefined {
    return "The Exorcist chooses a player. ⚫️ Put the Exorcist to sleep. If the Exorcist chose the Demon: Wake the Demon. Show the THIS CHARACTER SELECTED YOU & Exorcist tokens. Point to the Exorcist.";
  }
}

export class Innkeeper extends Character {
  constructor() {
    super(CharacterName.Innkeeper);
  }

  getOtherNightsInstructions(): string | undefined {
    return "The Innkeeper chooses 2 players. ⚫️ ⚫️ ⚫️";
  }
}

export class Gambler extends Character {
  constructor() {
    super(CharacterName.Gambler);
  }

  getOtherNightsInstructions(): string | undefined {
    return "The Gambler chooses a player & a character. ⚫️";
  }
}

export class Gossip extends Character {
  constructor() {
    super(CharacterName.Gossip);
  }

  getOtherNightsInstructions(): string | undefined {
    return "If the Gossip is due to kill a player, they die. ⚫️";
  }
}

const courtierInstructions = "The Courtier might choose a character. ⚫️ ⚫️";

export class Courtier extends Character {
  constructor() {
    super(CharacterName.Courtier);
  }

  getFirstNightInstructions(): string | undefined {
    return courtierInstructions;
  }

  getOtherNightsInstructions(): string | undefined {
    return courtierInstructions;
  }
}

export class Professor extends Character {
  constructor() {
    super(CharacterName.Professor);
  }

  getOtherNightsInstructions(): string | undefined {
    return "The Professor might choose a dead player. ⚫️ ⚫️";
  }
}

export class Minstrel extends Character {
  constructor() {
    super(CharacterName.Minstrel);
  }
}

export class TeaLady extends Character {
  constructor() {
    super(CharacterName.TeaLady);
  }
}

export class Pacifist extends Character {
  constructor() {
    super(CharacterName.Pacifist);
  }
}

export class Fool extends Character {
  constructor() {
    super(CharacterName.Fool);
  }
}

export class Goon extends Character {
  constructor() {
    super(CharacterName.Goon, CharacterType.Outsider);
  }
}

export class Lunatic extends Character {
  constructor() {
    super(CharacterName.Lunatic, CharacterType.Outsider);
  }

  canBeDemonBluff(): boolean {
    return false;
  }

  gameQualifiesForFirstNightInfo(gameState: GameState): boolean {
    return gameState.playerCount >= 7;
  }

  getFirstNightInstructions(): string | undefined {
    return "Show the THESE ARE YOUR MINIONS token. Point to any players. Show the THESE CHARACTERS ARE NOT IN PLAY token. Show 3 good character tokens. Put the Lunatic to sleep. Wake the Demon. Show the YOU ARE info token and the Demon token. Show the THIS PLAYER IS info token and the Lunatic token, then point to the Lunatic.";
  }

  getOtherNightsInstructions(): string | undefined {
    return "Do whatever needs to be done to simulate the demon acting. Put the Lunatic to sleep. Wake the Demon. Show the Lunatic token & point to them, then their target(s).";
  }

  onPicked(
    _playerSetup: PlayerSetup,
    availableChars: CharacterSet,
    allChars: Character[],
  ): void {
    const demons = availableChars.demons.concat(
      allChars.filter((char) => char.type === CharacterType.Demon),
    );
    shuffleArray(demons);
    this.actsAsChar = demons[0];
  }

  getStartingInfoSuggestion(gameState: GameState): string | undefined {
    const charsInPlay = gameState.allChars.filter(
      (char) => char.inPlay && char.id !== this.id,
    );
    shuffleArray(charsInPlay);

    const fakeMinions = [];
    let minionsToPick = playerCountConfig[gameState.playerCount].minions;
    while (minionsToPick > 0) {
      fakeMinions.push(charsInPlay.pop() as Character);
      minionsToPick--;
    }

    const potentialOutsiderBluffs = gameState.allChars.filter(
      (char) => char.canBeDemonBluff() && char.type === CharacterType.Outsider,
    );
    const potentialTownsfolkBluffs = gameState.allChars.filter(
      (char) => char.canBeDemonBluff() && char.type === CharacterType.Townsfolk,
    );
    shuffleArray(potentialOutsiderBluffs);
    shuffleArray(potentialTownsfolkBluffs);

    let bluffs = [];

    if (potentialOutsiderBluffs.length > 0) {
      bluffs = [
        potentialOutsiderBluffs[0],
        potentialTownsfolkBluffs[0],
        potentialTownsfolkBluffs[1],
      ];
    } else {
      bluffs = [
        potentialTownsfolkBluffs[0],
        potentialTownsfolkBluffs[1],
        potentialTownsfolkBluffs[2],
      ];
    }

    const charTokens = fakeMinions.map((char) => {
      return `{{${char.id}}}`;
    });

    let instructions = `Point to ${charTokens.join(", ")}. Show the ${bluffs[0].name}, ${bluffs[1].name}, and ${bluffs[2].name} tokens.`;

    const demonFirstNightInstructions =
      this.actsAsChar?.getFirstNightInstructions() as string;

    if (demonFirstNightInstructions) {
      instructions += ` ${demonFirstNightInstructions}`;
    }

    return instructions;
  }

  getOtherNightSuggestion(): string | undefined {
    return this.actsAsChar?.getOtherNightsInstructions();
  }

  canActAsOtherChar(): boolean {
    return true;
  }

  getIdentityForInstructions(): CharacterName {
    return this.name;
  }
}

export class Tinker extends Character {
  constructor() {
    super(CharacterName.Tinker, CharacterType.Outsider);
  }

  getOtherNightsInstructions(): string | undefined {
    return "The Tinker might die. ⚫️";
  }
}

export class Moonchild extends Character {
  constructor() {
    super(CharacterName.Moonchild, CharacterType.Outsider);
  }

  getOtherNightsInstructions(): string | undefined {
    return "If the Moonchild is due to kill a good player, they die. ⚫️";
  }
}

export class Godfather extends Character {
  constructor() {
    super(CharacterName.Godfather, CharacterType.Minion, Alignment.Evil);
  }

  onPicked(playerSetup: PlayerSetup): void {
    if (Math.random() < 0.75) {
      playerSetup.outsidersToPick++;
      playerSetup.townsfolkToPick--;
    } else {
      playerSetup.outsidersToPick--;
      playerSetup.townsfolkToPick++;
    }
  }

  getFirstNightInstructions(): string | undefined {
    return "Show the character tokens of all in-play Outsiders.";
  }

  getOtherNightsInstructions(): string | undefined {
    return "If an Outsider died today, the Godfather chooses a player. ⚫️";
  }

  getStartingInfoSuggestion(gameState: GameState): string | undefined {
    const outsiders = gameState.allChars.filter(
      (char) => char.inPlay && char.type === CharacterType.Outsider,
    );

    const charTokens = outsiders.map((char) => {
      return `${char.name}`;
    });

    if (charTokens.length === 0) {
      return;
    }

    return `Show character tokens: ${charTokens.join(", ")}.`;
  }
}

const devilsAdvocateInstructions =
  "The Devil's Advocate chooses a living player. ⚫️";

export class DevilsAdvocate extends Character {
  constructor() {
    super(CharacterName.DevilsAdvocate, CharacterType.Minion, Alignment.Evil);
  }

  getFirstNightInstructions(): string | undefined {
    return devilsAdvocateInstructions;
  }

  getOtherNightsInstructions(): string | undefined {
    return devilsAdvocateInstructions;
  }
}

export class Assassin extends Character {
  constructor() {
    super(CharacterName.Assassin, CharacterType.Minion, Alignment.Evil);
  }

  getOtherNightsInstructions(): string | undefined {
    return "The Assassin might choose a player. ⚫️ ⚫️";
  }
}

export class Mastermind extends Character {
  constructor() {
    super(CharacterName.Mastermind, CharacterType.Minion, Alignment.Evil);
  }
}

export class Zombuul extends Character {
  constructor() {
    super(CharacterName.Zombuul, CharacterType.Demon, Alignment.Evil);
  }

  getOtherNightsInstructions(): string | undefined {
    return "If no one died today, the Zombuul chooses a player. ⚫️";
  }
}

export class Pukka extends Character {
  constructor() {
    super(CharacterName.Pukka, CharacterType.Demon, Alignment.Evil);
  }

  getFirstNightInstructions(): string | undefined {
    return "The Pukka chooses a player. ⚫️";
  }

  getOtherNightsInstructions(): string | undefined {
    return "The Pukka chooses a player. ⚫️ The previously poisoned player dies then becomes healthy. ⚫️";
  }
}

export class Shabaloth extends Character {
  constructor() {
    super(CharacterName.Shabaloth, CharacterType.Demon, Alignment.Evil);
  }

  getOtherNightsInstructions(): string | undefined {
    return "A previously chosen player might be resurrected. ⚫️ The Shabaloth chooses 2 players. ⚫️ ⚫️";
  }
}

export class Po extends Character {
  constructor() {
    super(CharacterName.Po, CharacterType.Demon, Alignment.Evil);
  }

  getOtherNightsInstructions(): string | undefined {
    return "The Po may choose a player OR chooses 3 players if they chose no-one last night. ⚫️ or ⚫️ ⚫️ ⚫️";
  }
}

export class Noble extends Character {
  constructor() {
    super(CharacterName.Noble);
  }

  getFirstNightInstructions(): string | undefined {
    return "Point to 3 players including one evil player, in no particular order.";
  }

  getStartingInfoSuggestion(gameState: GameState): string | undefined {
    const evilChar = shuffleArray(
      gameState.allChars.filter(
        (char) =>
          char.id !== this.id &&
          char.inPlay &&
          (char.alignment === Alignment.Evil || char.canMisregisterAlignment()),
      ),
    )[0] as Character;

    const goodChars = shuffleArray(
      gameState.allChars.filter(
        (char) =>
          char.id !== this.id &&
          char.id !== evilChar.id && //Prevent duplicate char in case of misregistration
          char.inPlay &&
          (char.alignment === Alignment.Good || char.canMisregisterAlignment()),
      ),
    );

    const chars = [evilChar, goodChars[0], goodChars[1]] as Character[];
    shuffleArray(chars);

    return `Point to {{${chars[0].id}}}, {{${chars[1].id}}}, and {{${chars[2].id}}}.`;
  }

  getDrunkStrategies(charId: string): DrunkStrategy[] | undefined {
    return [new NobleFrameGoodCharsAsEvil(charId)];
  }
}

export class Cannibal extends Character {
  constructor() {
    super(CharacterName.Cannibal);
  }

  canActAsOtherChar(): boolean {
    return true;
  }

  getFirstNightInstructions(): string | undefined {
    return this.actsAsChar?.getFirstNightInstructions();
  }

  getOtherNightsInstructions(): string | undefined {
    return this.actsAsChar?.getOtherNightsInstructions();
  }
}

export class Marionette extends Drunk {
  constructor() {
    super();
    this.name = CharacterName.Marionette;
    this.type = CharacterType.Minion;
    this.alignment = Alignment.Evil;
  }

  isIncludedInMinionAndDemonInfo(): boolean {
    return false;
  }
}

export const characterClassNameMap: Record<
  CharacterName,
  new (
    name: CharacterName,
    type?: CharacterType,
    alignment?: Alignment,
  ) => Character
> = {
  [CharacterName.Washerwoman]: Washerwoman,
  [CharacterName.Librarian]: Librarian,
  [CharacterName.Investigator]: Investigator,
  [CharacterName.Chef]: Chef,
  [CharacterName.Empath]: Empath,
  [CharacterName.FortuneTeller]: FortuneTeller,
  [CharacterName.Undertaker]: Undertaker,
  [CharacterName.Monk]: Monk,
  [CharacterName.Ravenkeeper]: Ravenkeeper,
  [CharacterName.Virgin]: Virgin,
  [CharacterName.Slayer]: Slayer,
  [CharacterName.Soldier]: Soldier,
  [CharacterName.Mayor]: Mayor,
  [CharacterName.Butler]: Butler,
  [CharacterName.Saint]: Saint,
  [CharacterName.Recluse]: Recluse,
  [CharacterName.Drunk]: Drunk,
  [CharacterName.Poisoner]: Poisoner,
  [CharacterName.Spy]: Spy,
  [CharacterName.Baron]: Baron,
  [CharacterName.ScarletWoman]: ScarletWoman,
  [CharacterName.Imp]: Imp,

  [CharacterName.Clockmaker]: Clockmaker,
  [CharacterName.Dreamer]: Dreamer,
  [CharacterName.SnakeCharmer]: SnakeCharmer,
  [CharacterName.Mathematician]: Mathematician,
  [CharacterName.Flowergirl]: Flowergirl,
  [CharacterName.TownCrier]: TownCrier,
  [CharacterName.Oracle]: Oracle,
  [CharacterName.Savant]: Savant,
  [CharacterName.Seamstress]: Seamstress,
  [CharacterName.Philosopher]: Philosopher,
  [CharacterName.Artist]: Artist,
  [CharacterName.Juggler]: Juggler,
  [CharacterName.Sage]: Sage,
  [CharacterName.Mutant]: Mutant,
  [CharacterName.Sweetheart]: Sweetheart,
  [CharacterName.Barber]: Barber,
  [CharacterName.Klutz]: Klutz,
  [CharacterName.EvilTwin]: EvilTwin,
  [CharacterName.Witch]: Witch,
  [CharacterName.Cerenovous]: Cerenovous,
  [CharacterName.PitHag]: PitHag,
  [CharacterName.FangGu]: FangGu,
  [CharacterName.Vigormortis]: Vigormortis,
  [CharacterName.NoDashii]: NoDashii,
  [CharacterName.Vortox]: Vortox,

  [CharacterName.Grandmother]: Grandmother,
  [CharacterName.Sailor]: Sailor,
  [CharacterName.Chambermaid]: Chambermaid,
  [CharacterName.Exorcist]: Exorcist,
  [CharacterName.Innkeeper]: Innkeeper,
  [CharacterName.Gambler]: Gambler,
  [CharacterName.Gossip]: Gossip,
  [CharacterName.Courtier]: Courtier,
  [CharacterName.Professor]: Professor,
  [CharacterName.Minstrel]: Minstrel,
  [CharacterName.TeaLady]: TeaLady,
  [CharacterName.Pacifist]: Pacifist,
  [CharacterName.Fool]: Fool,
  [CharacterName.Goon]: Goon,
  [CharacterName.Lunatic]: Lunatic,
  [CharacterName.Tinker]: Tinker,
  [CharacterName.Moonchild]: Moonchild,
  [CharacterName.Godfather]: Godfather,
  [CharacterName.DevilsAdvocate]: DevilsAdvocate,
  [CharacterName.Assassin]: Assassin,
  [CharacterName.Mastermind]: Mastermind,
  [CharacterName.Zombuul]: Zombuul,
  [CharacterName.Pukka]: Pukka,
  [CharacterName.Shabaloth]: Shabaloth,
  [CharacterName.Po]: Po,

  [CharacterName.Noble]: Noble,
  [CharacterName.Cannibal]: Cannibal,
  [CharacterName.Marionette]: Marionette,
};
