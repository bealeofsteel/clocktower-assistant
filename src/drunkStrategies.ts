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
    );

    return `Show the ${minion.name} character token. Point to {{${chars[0].id}}} (Minion) and {{${chars[1].id}}} (Wrong).`;
  }
}

const supportDemonBluffOfType = (
  gameState: GameState,
  charType: CharacterType,
  excludeCharId: string,
  supportedCharType: CharacterType,
) => {
  const bluff = pickDemonBluffOfType(gameState, charType);
  const goodChars = pickInPlayCharsofTypes(
    gameState,
    [CharacterType.Townsfolk, CharacterType.Outsider],
    excludeCharId,
    1,
  );

  const supportedChars = Array.from(
    gameState.allChars.filter(
      (char) => char.inPlay && char.type === supportedCharType,
    ),
  );
  shuffleArray(supportedChars);

  const prefix = `Show the ${bluff.name} character token. `;
  let suffix = "";

  if (Math.random() < 0.5) {
    suffix = `Point to {{${supportedChars[0].id}}} (${charType}) and {{${goodChars[0].id}}} (Wrong).`;
  } else {
    suffix = `Point to {{${goodChars[0].id}}} (Wrong) and {{${supportedChars[0].id}}} (${charType}).`;
  }

  return prefix + suffix;
};

export class SupportDemonTownsfolkBluff extends DrunkStrategy {
  getInstructionsForStrategy(gameState: GameState): string {
    return supportDemonBluffOfType(
      gameState,
      CharacterType.Townsfolk,
      this.charId,
      CharacterType.Demon,
    );
  }
}

export class SupportMinionTownsfolkBluff extends DrunkStrategy {
  getInstructionsForStrategy(gameState: GameState): string {
    return supportDemonBluffOfType(
      gameState,
      CharacterType.Townsfolk,
      this.charId,
      CharacterType.Minion,
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
      CharacterType.Demon,
    );
  }
}

export class SupportMinionOutsiderBluff extends DrunkStrategy {
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
      CharacterType.Minion,
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
