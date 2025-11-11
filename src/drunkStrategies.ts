import { Character } from "./characters";
import {
  pickDemonBluffOfType,
  pickInPlayCharsofTypes,
  pickNotInPlayMinion,
} from "./charUtils";
import { playerCountConfig } from "./gameSettings";
import { shuffleArray } from "./randomUtils";
import { Alignment, CharacterName, CharacterType, GameState } from "./types";

export abstract class DrunkStrategy {
  charId: string;

  constructor(charId: string) {
    this.charId = charId;
  }

  gameQualifiesForStrategy(_gameState: GameState): boolean {
    return true;
  }

  abstract getInstructionsForStrategy(_gameState: GameState): string;
}

export class FrameGoodPlayersAsMinion extends DrunkStrategy {
  getInstructionsForStrategy(gameState: GameState): string {
    const minion = pickNotInPlayMinion(gameState);
    const chars = pickInPlayCharsofTypes(
      gameState,
      [CharacterType.Townsfolk, CharacterType.Outsider],
      this.charId,
      2,
      [CharacterName.Recluse],
    );

    return `Show the ${minion.name} character token. Point to {{${chars[0].id}}} (Minion) and {{${chars[1].id}}} (Wrong).`;
  }
}

const supportDemonBluffOfType = (
  gameState: GameState,
  charType: CharacterType,
  excludeCharId: string,
) => {
  const bluff = pickDemonBluffOfType(gameState, charType);

  const evilChar = shuffleArray(
    gameState.allChars.filter(
      (char) =>
        char.inPlay &&
        char.alignment === Alignment.Evil &&
        char.id !== excludeCharId,
    ),
  )[0] as Character;

  const otherChar = shuffleArray(
    gameState.allChars.filter(
      (char) =>
        char.inPlay && char.id !== evilChar.id && char.id !== excludeCharId,
    ),
  )[0] as Character;

  const prefix = `Show the ${bluff.name} character token. `;
  let suffix = "";

  if (Math.random() < 0.5) {
    suffix = `Point to {{${evilChar.id}}} (${charType}) and {{${otherChar.id}}} (Wrong).`;
  } else {
    suffix = `Point to {{${otherChar.id}}} (Wrong) and {{${evilChar.id}}} (${charType}).`;
  }

  return prefix + suffix;
};

export class SupportDemonTownsfolkBluff extends DrunkStrategy {
  getInstructionsForStrategy(gameState: GameState): string {
    return supportDemonBluffOfType(
      gameState,
      CharacterType.Townsfolk,
      this.charId,
    );
  }
}

export class SupportDemonOutsiderBluff extends DrunkStrategy {
  gameQualifiesForStrategy(gameState: GameState): boolean {
    for (const bluff of gameState.demonBluffs) {
      if (bluff.type === CharacterType.Outsider) {
        return true;
      }
    }
    return false;
  }

  getInstructionsForStrategy(gameState: GameState): string {
    return supportDemonBluffOfType(
      gameState,
      CharacterType.Outsider,
      this.charId,
    );
  }
}

const pointToWrongGoodPlayersOfType = (
  gameState: GameState,
  charType: CharacterType,
  excludeCharName: string,
  excludeCharId: string,
) => {
  const demonBluffIds = gameState.demonBluffs.map((char) => char.id);

  const chars = gameState.allChars.filter(
    (char) =>
      char.type === charType &&
      !demonBluffIds.includes(char.id) &&
      char.name !== excludeCharName,
  );
  shuffleArray(chars);
  const charToShow = chars[0];

  const goodChars = gameState.allChars.filter(
    (char) =>
      char.inPlay &&
      char.alignment === Alignment.Good &&
      char.id !== excludeCharId &&
      char.id !== charToShow.id,
  );
  shuffleArray(goodChars);

  return `Show the ${charToShow.name} character token. Point to {{${goodChars[0].id}}} (${charType}) and {{${goodChars[1].id}}} (Wrong).`;
};

export class ShowGoodPlayersWrongTownsfolk extends DrunkStrategy {
  getInstructionsForStrategy(gameState: GameState): string {
    return pointToWrongGoodPlayersOfType(
      gameState,
      CharacterType.Townsfolk,
      CharacterName.Washerwoman,
      this.charId,
    );
  }
}

export class ShowGoodPlayersWrongOutsider extends DrunkStrategy {
  getInstructionsForStrategy(gameState: GameState): string {
    return pointToWrongGoodPlayersOfType(
      gameState,
      CharacterType.Outsider,
      CharacterName.Librarian,
      this.charId,
    );
  }
}

export class FrameTownsfolkAsDrunk extends DrunkStrategy {
  getInstructionsForStrategy(gameState: GameState): string {
    const goodChars = pickInPlayCharsofTypes(
      gameState,
      [CharacterType.Townsfolk],
      this.charId,
      2,
    );

    return `Show the ${CharacterName.Drunk} character token. Point to {{${goodChars[0].id}}} (Outsider) and {{${goodChars[1].id}}} (Wrong).`;
  }
}

export class ClaimZeroOutsiders extends DrunkStrategy {
  gameQualifiesForStrategy(gameState: GameState): boolean {
    return playerCountConfig[gameState.playerCount].outsiders === 0;
  }

  getInstructionsForStrategy(_gameState: GameState): string {
    return "Show a zero.";
  }
}

const confirmCharAsActingChar = (
  gameState: GameState,
  characterName: CharacterName,
  excludeCharId: string,
) => {
  const charToConfirm = gameState.allChars.filter(
    (char) => char.inPlay && char.name === characterName,
  )[0];

  const otherChar = shuffleArray(
    gameState.allChars.filter(
      (char) =>
        char.inPlay &&
        char.id !== charToConfirm.id &&
        char.id !== excludeCharId,
    ),
  )[0] as Character;

  const prefix = `Show the ${charToConfirm.actsAsChar?.name} character token. `;
  let suffix = "";

  if (Math.random() < 0.5) {
    suffix = `Point to {{${charToConfirm.id}}} (${charToConfirm.actsAsChar?.type}) and {{${otherChar.id}}} (Wrong).`;
  } else {
    suffix = `Point to {{${otherChar.id}}} (Wrong) and {{${charToConfirm.id}}} (${charToConfirm.actsAsChar?.type}).`;
  }

  return prefix + suffix;
};

export class ConfirmMarionetteAsTownsfolk extends DrunkStrategy {
  gameQualifiesForStrategy(gameState: GameState): boolean {
    return (
      gameState.allChars.filter(
        (char) =>
          char.inPlay &&
          char.name === CharacterName.Marionette &&
          char.actsAsChar?.type === CharacterType.Townsfolk &&
          char.id !== this.charId,
      ).length > 0
    );
  }

  getInstructionsForStrategy(gameState: GameState): string {
    return confirmCharAsActingChar(
      gameState,
      CharacterName.Marionette,
      this.charId,
    );
  }
}

export class ConfirmMarionetteAsOutsider extends DrunkStrategy {
  gameQualifiesForStrategy(gameState: GameState): boolean {
    return (
      gameState.allChars.filter(
        (char) =>
          char.inPlay &&
          char.name === CharacterName.Marionette &&
          char.actsAsChar?.type === CharacterType.Outsider &&
          char.id !== this.charId,
      ).length > 0
    );
  }

  getInstructionsForStrategy(gameState: GameState): string {
    return confirmCharAsActingChar(
      gameState,
      CharacterName.Marionette,
      this.charId,
    );
  }
}

// Can be done by a Marionette WW if another character is the Drunk
export class ConfirmDrunkAsTownsfolk extends DrunkStrategy {
  gameQualifiesForStrategy(gameState: GameState): boolean {
    return (
      gameState.allChars.filter(
        (char) =>
          char.inPlay &&
          char.name === CharacterName.Drunk &&
          char.id !== this.charId,
      ).length > 0
    );
  }

  getInstructionsForStrategy(gameState: GameState): string {
    return confirmCharAsActingChar(gameState, CharacterName.Drunk, this.charId);
  }
}

export class GrandmotherSupportDemonBluff extends DrunkStrategy {
  getInstructionsForStrategy(gameState: GameState): string {
    const bluffs = new Array(...gameState.demonBluffs);
    shuffleArray(bluffs);

    const evilChars = gameState.allChars.filter(
      (char) => char.inPlay && char.alignment === Alignment.Evil,
    );
    shuffleArray(evilChars);

    return `The grandchild is {{${evilChars[0].id}}}. Show the ${bluffs[0].name} token.`;
  }
}

export class GrandmotherFrameTownsfolkAsDrunk extends DrunkStrategy {
  getInstructionsForStrategy(gameState: GameState): string {
    const townsfolk = gameState.allChars.filter(
      (char) =>
        char.inPlay &&
        char.type === CharacterType.Townsfolk &&
        char.id !== this.charId,
    );
    shuffleArray(townsfolk);

    return `The grandchild is {{${townsfolk[0].id}}}. Show the Drunk token.`;
  }
}

export class GrandmotherShowGoodPlayerWrongRole extends DrunkStrategy {
  getInstructionsForStrategy(gameState: GameState): string {
    const demonBluffIds = gameState.demonBluffs.map((char) => char.id);

    const chars = gameState.allChars.filter(
      (char) =>
        char.alignment === Alignment.Good &&
        !demonBluffIds.includes(char.id) &&
        char.name !== CharacterName.Grandmother,
    );
    shuffleArray(chars);
    const charToShow = chars[0];

    const goodChars = gameState.allChars.filter(
      (char) =>
        char.inPlay &&
        char.alignment === Alignment.Good &&
        char.id !== this.charId &&
        char.id !== charToShow.id,
    );
    shuffleArray(goodChars);

    return `The grandchild is {{${goodChars[0].id}}}. Show the ${charToShow.name} token.`;
  }
}

export class GrandmotherConfirmDrunkAsTownsfolk extends DrunkStrategy {
  gameQualifiesForStrategy(gameState: GameState): boolean {
    return (
      gameState.allChars.filter(
        (char) =>
          char.inPlay &&
          char.name === CharacterName.Drunk &&
          char.id !== this.charId,
      ).length > 0
    );
  }

  getInstructionsForStrategy(gameState: GameState): string {
    const charToConfirm = gameState.allChars.filter(
      (char) =>
        char.inPlay &&
        char.name === CharacterName.Drunk &&
        char.id !== this.charId,
    )[0];

    return `The grandchild is {{${charToConfirm.id}}}. Show the ${charToConfirm.actsAsChar?.name} token.`;
  }
}

export class NobleFrameGoodCharsAsEvil extends DrunkStrategy {
  gameQualifiesForStrategy(gameState: GameState): boolean {
    return (
      gameState.allChars.filter(
        (char) =>
          char.id !== this.charId &&
          char.inPlay &&
          char.alignment === Alignment.Good,
      ).length >= 3
    );
  }

  getInstructionsForStrategy(gameState: GameState): string {
    const goodChars = shuffleArray(
      gameState.allChars.filter(
        (char) =>
          char.id !== this.charId &&
          char.inPlay &&
          char.alignment === Alignment.Good,
      ),
    );

    const chars = [goodChars[0], goodChars[1], goodChars[2]] as Character[];
    shuffleArray(chars);

    return `Point to {{${chars[0].id}}}, {{${chars[1].id}}}, and {{${chars[2].id}}}.`;
  }
}
