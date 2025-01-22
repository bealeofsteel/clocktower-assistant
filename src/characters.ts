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
} from "./drunkStrategies";
import { shuffleArray } from "./randomUtils";
import {
  Alignment,
  CharacterName,
  CharacterSet,
  CharacterType,
  GameState,
  PlayerSetup,
} from "./types";

export class Character {
  id: string;
  name: CharacterName;
  type: CharacterType;
  alignment: Alignment;
  isDead: boolean;
  playerName: string;
  tokenUsedByCharName: string | undefined;
  inPlay: boolean;
  actsAsChar: Character | undefined;

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
  }

  // Do nothing, some classes will override
  onPicked(
    _playerSetup: PlayerSetup,
    _availableChars: CharacterSet,
    _allChars: Character[],
  ) {}

  getDisplayName(): string {
    let name: string = this.name;

    if (this.tokenUsedByCharName) {
      name += ` (token used by ${this.tokenUsedByCharName})`;
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
    return getPointToCharOfTypeAndOtherCharSuggestion(
      gameState,
      CharacterType.Outsider,
      this.id,
    );
  }

  getDrunkStrategies(charId: string): DrunkStrategy[] | undefined {
    return [
      new ClaimZeroOutsiders(charId),
      new FrameTownsfolkAsDrunk(charId),
      new SupportDemonOutsiderBluff(charId),
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
    return "If the Ravenkeeper died tonight, the Ravenkeeper chooses a player. Show that player's character token.";
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
  }

  onPicked(
    _playerSetup: PlayerSetup,
    availableChars: CharacterSet,
    allChars: Character[],
  ) {
    const character = availableChars.townsfolk.pop() as Character;
    character.tokenUsedByCharName = this.name;
    this.actsAsChar = character;
    allChars.push(character);
  }

  getDisplayName(): string {
    let name = this.actsAsChar
      ? `${CharacterName.Drunk} (${this.actsAsChar.name})`
      : CharacterName.Drunk;
    if (this.playerName) {
      name += ` [${this.playerName}]`;
    }
    return name;
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
}

const getPointToCharOfTypeAndOtherCharSuggestion = (
  gameState: GameState,
  charType: CharacterType,
  currentCharId: string,
) => {
  if (
    gameState.allChars.filter((char) => char.type === charType).length === 0
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

  const char = pickedCharResult.registersAs
    ? pickedCharResult.registersAs
    : pickedCharResult.character;

  const prefix = `Show the ${char.name} character token. `;
  let suffix = "";

  if (Math.random() < 0.5) {
    suffix = `Point to {{${char.id}}} (${charType}) and {{${otherChar.id}}} (Wrong).`;
  } else {
    suffix = `Point to {{${otherChar.id}}} (Wrong) and {{${char.id}}} (${charType}).`;
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

  getStartingInfoSuggestion(gameState: GameState): string | undefined {
    const goodChars = gameState.allChars.filter(
      (char) =>
        char.type === CharacterType.Townsfolk ||
        char.type === CharacterType.Outsider,
    );
    const evilChars = gameState.allChars.filter(
      (char) =>
        char.type === CharacterType.Minion || char.type === CharacterType.Demon,
    );

    shuffleArray(goodChars);
    shuffleArray(evilChars);

    if (Math.random() < 0.5) {
      return `Show the correct character token, then (if a Townsfolk or Outsider) the ${evilChars[0].name} token, or (if a Minion or Demon) the ${goodChars[0].name} token.`;
    } else {
      return `Show (if a Townsfolk or Outsider) the ${evilChars[0].name} token, or (if a Minion or Demon) the ${goodChars[0].name} token, then the correct character token.`;
    }
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

  getFirstNightInstructions(): string | undefined {
    return philosopherInstructions;
  }

  getOtherNightsInstructions(): string | undefined {
    return philosopherInstructions;
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
    if (playerSetup.outsidersToPick > 0) {
      playerSetup.outsidersToPick -= 1;
      playerSetup.townsfolkToPick += 1;
    }
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
  [CharacterName.Virgin]: Character,
  [CharacterName.Slayer]: Character,
  [CharacterName.Soldier]: Character,
  [CharacterName.Mayor]: Character,
  [CharacterName.Butler]: Butler,
  [CharacterName.Saint]: Character,
  [CharacterName.Recluse]: Character,
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
  [CharacterName.Savant]: Character,
  [CharacterName.Seamstress]: Seamstress,
  [CharacterName.Philosopher]: Philosopher,
  [CharacterName.Artist]: Character,
  [CharacterName.Juggler]: Juggler,
  [CharacterName.Sage]: Sage,
  [CharacterName.Mutant]: Character,
  [CharacterName.Sweetheart]: Sweetheart,
  [CharacterName.Barber]: Barber,
  [CharacterName.Klutz]: Character,
  [CharacterName.EvilTwin]: EvilTwin,
  [CharacterName.Witch]: Witch,
  [CharacterName.Cerenovous]: Cerenovous,
  [CharacterName.PitHag]: PitHag,
  [CharacterName.FangGu]: FangGu,
  [CharacterName.Vigormortis]: Vigormortis,
  [CharacterName.NoDashii]: NoDashii,
  [CharacterName.Vortox]: Vortox,
};
