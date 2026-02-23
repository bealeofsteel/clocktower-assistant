import { Character } from "./characters";
import { shuffleArray } from "./randomUtils";
import { Alignment, CharacterName, CharacterType, GameState } from "./types";

const charNameStartsWithVowel = (charName: CharacterName) => {
  const firstLetter = charName.charAt(0);
  if (["A", "E", "I", "O", "U", "Y"].includes(firstLetter)) {
    return true;
  }
};

export abstract class SavantInfoStrategy {
  isBinary: boolean;

  constructor() {
    this.isBinary = false;
  }

  gameQualifiesForTrueInfo(_gameState: GameState) {
    return true;
  }

  gameQualifiesForFalseInfo(_gameState: GameState) {
    return true;
  }

  abstract getTrueInfo(_gameState: GameState, _currentCharId: string): string;

  abstract getFalseInfo(_gameState: GameState, _currentCharId: string): string;
}

export class CharInPlayStatus extends SavantInfoStrategy {
  getTrueInfo(gameState: GameState, currentCharId: string): string {
    const chars = gameState.allChars.filter(
      (char) => char.id !== currentCharId,
    );
    shuffleArray(chars);

    const pickedChar = chars[0];

    const prefix = charNameStartsWithVowel(pickedChar.name) ? "An" : "A";

    if (pickedChar.inPlay) {
      return `${prefix} ${pickedChar.name} is in play.`;
    } else {
      return `${prefix} ${pickedChar.name} is not in play.`;
    }
  }

  getFalseInfo(gameState: GameState, currentCharId: string): string {
    const chars = gameState.allChars.filter(
      (char) => char.id !== currentCharId,
    );
    shuffleArray(chars);

    const pickedChar = chars[0];

    const prefix = charNameStartsWithVowel(pickedChar.name) ? "An" : "A";

    if (pickedChar.inPlay) {
      return `${prefix} ${pickedChar.name} is not in play.`;
    } else {
      return `${prefix} ${pickedChar.name} is in play.`;
    }
  }
}

const playersGotTrueInformationText =
  "[No players / At least one player] received false information last night.";

export class DidPlayersGetTrueInformationLastNight extends SavantInfoStrategy {
  constructor() {
    super();
    this.isBinary = true;
  }

  getTrueInfo(_gameState: GameState, _currentCharId: string): string {
    return playersGotTrueInformationText;
  }

  getFalseInfo(_gameState: GameState, _currentCharId: string): string {
    return playersGotTrueInformationText;
  }
}

export class PlayerAlignment extends SavantInfoStrategy {
  getTrueInfo(gameState: GameState, currentCharId: string): string {
    const chars = gameState.allChars.filter(
      (char) => char.inPlay && char.id !== currentCharId,
    );
    shuffleArray(chars);

    const pickedChar = chars[0];

    if (pickedChar.alignment === Alignment.Good) {
      return `${pickedChar.getPlayerNameForDisplay()} is good.`;
    } else {
      return `${pickedChar.getPlayerNameForDisplay()} is evil.`;
    }
  }

  getFalseInfo(gameState: GameState, currentCharId: string): string {
    const chars = gameState.allChars.filter(
      (char) => char.inPlay && char.id !== currentCharId,
    );
    shuffleArray(chars);

    const pickedChar = chars[0];

    if (pickedChar.alignment === Alignment.Good) {
      return `${pickedChar.getPlayerNameForDisplay()} is evil.`;
    } else {
      return `${pickedChar.getPlayerNameForDisplay()} is good.`;
    }
  }
}

export class NumOutsidersInPlay extends SavantInfoStrategy {
  getTrueInfo(gameState: GameState): string {
    const outsiders = gameState.allChars.filter(
      (char) => char.inPlay && char.type === CharacterType.Outsider,
    );

    if (outsiders.length === 1) {
      return `There is exactly ${outsiders.length} Outsider in play.`;
    }

    return `There are exactly ${outsiders.length} Outsiders in play.`;
  }

  getFalseInfo(gameState: GameState): string {
    const outsiders = gameState.allChars.filter(
      (char) => char.inPlay && char.type === CharacterType.Outsider,
    );

    return `There are exactly [number, not ${outsiders.length}] Outsiders in play.`;
  }
}

const getTrueTwoPlayersForCharType = (
  gameState: GameState,
  currentCharId: string,
  charType: CharacterType,
) => {
  const charsofTypeInPlay = gameState.allChars.filter(
    (char) =>
      char.inPlay && char.type === charType && char.id !== currentCharId,
  );
  shuffleArray(charsofTypeInPlay);
  const pickedCharOfType = charsofTypeInPlay[0];

  const otherChars = gameState.allChars.filter(
    (char) =>
      char.inPlay &&
      char.id !== currentCharId &&
      char.id !== pickedCharOfType.id,
  );
  shuffleArray(otherChars);
  const pickedOtherChar = otherChars[0];

  const chars = [pickedCharOfType, pickedOtherChar];
  shuffleArray(chars);

  return `Either ${chars[0].getPlayerNameForDisplay()} or ${chars[1].getPlayerNameForDisplay()} is the ${pickedCharOfType.name}.`;
};

const getFalseTwoPlayersForCharType = (
  gameState: GameState,
  currentCharId: string,
  charType: CharacterType,
) => {
  const chars = gameState.allChars.filter(
    (char) => char.inPlay && char.id !== currentCharId,
  );
  shuffleArray(chars);

  const falseCharOfType = gameState.allChars.filter(
    (char) =>
      char.type === charType &&
      char.id !== chars[0].id &&
      char.id !== chars[1].id &&
      char.id !== currentCharId,
  );

  const pickedChars = [chars[0], chars[1]];
  shuffleArray(pickedChars);

  return `Either ${pickedChars[0].getPlayerNameForDisplay()} or ${pickedChars[1].getPlayerNameForDisplay()} is the ${falseCharOfType[0].name}.`;
};

export class WasherwomanInfo extends SavantInfoStrategy {
  getTrueInfo(gameState: GameState, currentCharId: string): string {
    return getTrueTwoPlayersForCharType(
      gameState,
      currentCharId,
      CharacterType.Townsfolk,
    );
  }

  getFalseInfo(gameState: GameState, currentCharId: string): string {
    return getFalseTwoPlayersForCharType(
      gameState,
      currentCharId,
      CharacterType.Townsfolk,
    );
  }
}

export class LibrarianInfo extends SavantInfoStrategy {
  // Ignore the "Show a zero" case since that's already covered by NumOutsidersInPlay
  gameQualifiesForTrueInfo(gameState: GameState): boolean {
    const outsiders = gameState.allChars.filter(
      (char) => char.inPlay && char.type === CharacterType.Outsider,
    );
    return outsiders.length > 0;
  }

  getTrueInfo(gameState: GameState, currentCharId: string): string {
    return getTrueTwoPlayersForCharType(
      gameState,
      currentCharId,
      CharacterType.Outsider,
    );
  }

  getFalseInfo(gameState: GameState, currentCharId: string): string {
    return getFalseTwoPlayersForCharType(
      gameState,
      currentCharId,
      CharacterType.Outsider,
    );
  }
}

export class InvestigatorInfo extends SavantInfoStrategy {
  getTrueInfo(gameState: GameState, currentCharId: string): string {
    return getTrueTwoPlayersForCharType(
      gameState,
      currentCharId,
      CharacterType.Minion,
    );
  }

  getFalseInfo(gameState: GameState, currentCharId: string): string {
    return getFalseTwoPlayersForCharType(
      gameState,
      currentCharId,
      CharacterType.Minion,
    );
  }
}

const chefInfo = "There are exactly [number] pairs of evil players.";

export class ChefInfo extends SavantInfoStrategy {
  getTrueInfo(): string {
    return chefInfo;
  }

  getFalseInfo(): string {
    return chefInfo;
  }
}

const empathInfo =
  "Exactly [number] of your two closest living neighbors are evil.";

export class EmpathInfo extends SavantInfoStrategy {
  getTrueInfo(): string {
    return empathInfo;
  }

  getFalseInfo(): string {
    return empathInfo;
  }
}

const clockmakerInfo =
  "A Demon is sitting [number] players away from the nearest Minion.";

export class ClockmakerInfo extends SavantInfoStrategy {
  getTrueInfo(): string {
    return clockmakerInfo;
  }

  getFalseInfo(): string {
    return clockmakerInfo;
  }
}

export class DreamerInfo extends SavantInfoStrategy {
  getTrueInfo(gameState: GameState, currentCharId: string): string {
    const charsInPlay = gameState.allChars.filter(
      (char) => char.inPlay && char.id !== currentCharId,
    );
    shuffleArray(charsInPlay);
    const pickedChar = charsInPlay[0];

    let otherChars;
    if (
      pickedChar.type === CharacterType.Townsfolk ||
      pickedChar.type === CharacterType.Outsider
    ) {
      otherChars = gameState.allChars.filter(
        (char) =>
          char.id !== currentCharId &&
          (char.type === CharacterType.Minion ||
            char.type === CharacterType.Demon) &&
          char.canBeSeenInPlay(),
      );
    } else {
      otherChars = gameState.allChars.filter(
        (char) =>
          char.id !== currentCharId &&
          (char.type === CharacterType.Townsfolk ||
            char.type === CharacterType.Outsider) &&
          char.canBeSeenInPlay(),
      );
    }

    shuffleArray(otherChars);
    const pickedOtherChar = otherChars[0];

    const pickedChars = [pickedChar, pickedOtherChar];

    shuffleArray(pickedChars);

    return `${pickedChar.getPlayerNameForDisplay()} is either the ${pickedChars[0].name} or the ${pickedChars[1].name}.`;
  }

  getFalseInfo(gameState: GameState, currentCharId: string): string {
    const charsInPlay = gameState.allChars.filter(
      (char) => char.inPlay && char.id !== currentCharId,
    );
    shuffleArray(charsInPlay);
    const pickedChar = charsInPlay[0];

    const falseGoodChars = gameState.allChars.filter(
      (char) =>
        char.id !== currentCharId &&
        char.id !== pickedChar.id &&
        (char.type === CharacterType.Townsfolk ||
          char.type === CharacterType.Outsider) &&
        char.canBeSeenInPlay(),
    );

    const falseEvilChars = gameState.allChars.filter(
      (char) =>
        char.id !== currentCharId &&
        char.id !== pickedChar.id &&
        (char.type === CharacterType.Minion ||
          char.type === CharacterType.Demon) &&
        char.canBeSeenInPlay(),
    );

    shuffleArray(falseGoodChars);
    shuffleArray(falseEvilChars);

    const pickedFalseChars = [falseGoodChars[0], falseEvilChars[0]];
    shuffleArray(pickedFalseChars);

    return `${pickedChar.getPlayerNameForDisplay()} is either the ${pickedFalseChars[0].name} or the ${pickedFalseChars[1].name}.`;
  }
}

export class OracleInfo extends SavantInfoStrategy {
  gameQualifiesForTrueInfo(gameState: GameState): boolean {
    return (
      gameState.allChars.filter((char) => char.inPlay && char.isDead).length > 0
    );
  }

  gameQualifiesForFalseInfo(gameState: GameState): boolean {
    return (
      gameState.allChars.filter((char) => char.inPlay && char.isDead).length > 0
    );
  }

  getTrueInfo(gameState: GameState): string {
    const deadEvilChars = gameState.allChars.filter(
      (char) => char.inPlay && char.isDead && char.alignment === Alignment.Evil,
    );

    if (deadEvilChars.length === 1) {
      return `Exactly ${deadEvilChars.length} dead player is evil.`;
    }

    return `Exactly ${deadEvilChars.length} dead players are evil.`;
  }

  getFalseInfo(gameState: GameState): string {
    const deadEvilChars = gameState.allChars.filter(
      (char) => char.inPlay && char.isDead && char.alignment === Alignment.Evil,
    );

    return `Exactly [number, not ${deadEvilChars.length}] dead players are evil.`;
  }
}

export class SeamstressInfo extends SavantInfoStrategy {
  getTrueInfo(gameState: GameState, currentCharId: string): string {
    const chars = gameState.allChars.filter(
      (char) => char.inPlay && char.id !== currentCharId,
    );
    shuffleArray(chars);

    if (chars[0].alignment === chars[1].alignment) {
      return `${chars[0].getPlayerNameForDisplay()} and ${chars[1].getPlayerNameForDisplay()} are the same alignment.`;
    } else {
      return `${chars[0].getPlayerNameForDisplay()} and ${chars[1].getPlayerNameForDisplay()} are different alignments.`;
    }
  }

  getFalseInfo(gameState: GameState, currentCharId: string): string {
    const chars = gameState.allChars.filter(
      (char) => char.inPlay && char.id !== currentCharId,
    );
    shuffleArray(chars);

    if (chars[0].alignment === chars[1].alignment) {
      return `${chars[0].getPlayerNameForDisplay()} and ${chars[1].getPlayerNameForDisplay()} are different alignments.`;
    } else {
      return `${chars[0].getPlayerNameForDisplay()} and ${chars[1].getPlayerNameForDisplay()} are the same alignment.`;
    }
  }
}

export class ChambermaidInfo extends SavantInfoStrategy {
  getTrueInfo(gameState: GameState, currentCharId: string): string {
    const chars = gameState.allChars.filter(
      (char) => char.inPlay && !char.isDead && char.id !== currentCharId,
    );
    shuffleArray(chars);

    return `Exactly [number] of ${chars[0].getPlayerNameForDisplay()} and ${chars[1].getPlayerNameForDisplay()} woke last night due to their ability.`;
  }

  getFalseInfo(gameState: GameState, currentCharId: string): string {
    const chars = gameState.allChars.filter(
      (char) => char.inPlay && !char.isDead && char.id !== currentCharId,
    );
    shuffleArray(chars);

    return `Exactly [number] of ${chars[0].getPlayerNameForDisplay()} and ${chars[1].getPlayerNameForDisplay()} woke last night due to their ability.`;
  }
}

export class ProfessorInfo extends SavantInfoStrategy {
  gameQualifiesForTrueInfo(gameState: GameState): boolean {
    return (
      gameState.allChars.filter((char) => char.inPlay && char.isDead).length > 0
    );
  }

  gameQualifiesForFalseInfo(gameState: GameState): boolean {
    return (
      gameState.allChars.filter((char) => char.inPlay && char.isDead).length > 0
    );
  }

  getTrueInfo(gameState: GameState, currentCharId: string): string {
    const deadChars = gameState.allChars.filter(
      (char) => char.inPlay && char.isDead && char.id !== currentCharId,
    );
    shuffleArray(deadChars);
    const pickedChar = deadChars[0];

    if (pickedChar.type === CharacterType.Townsfolk) {
      return `${pickedChar.getPlayerNameForDisplay()} is a Townsfolk.`;
    } else {
      return `${pickedChar.getPlayerNameForDisplay()} is not a Townsfolk.`;
    }
  }

  getFalseInfo(gameState: GameState, currentCharId: string): string {
    const deadChars = gameState.allChars.filter(
      (char) => char.inPlay && char.isDead && char.id !== currentCharId,
    );
    shuffleArray(deadChars);
    const pickedChar = deadChars[0];

    if (pickedChar.type === CharacterType.Townsfolk) {
      return `${pickedChar.getPlayerNameForDisplay()} is not a Townsfolk.`;
    } else {
      return `${pickedChar.getPlayerNameForDisplay()} is a Townsfolk.`;
    }
  }
}

export class NobleInfo extends SavantInfoStrategy {
  getTrueInfo(gameState: GameState, currentCharId: string): string {
    const evilChar = shuffleArray(
      gameState.allChars.filter(
        (char) =>
          char.alignment === Alignment.Evil &&
          char.inPlay &&
          char.id !== currentCharId,
      ),
    )[0];

    const goodChars = shuffleArray(
      gameState.allChars.filter(
        (char) =>
          char.alignment === Alignment.Good &&
          char.inPlay &&
          char.id !== currentCharId,
      ),
    );

    const chars = shuffleArray([
      evilChar,
      goodChars[0],
      goodChars[1],
    ] as Character[]) as Character[];

    return `Exactly one of ${chars[0].getPlayerNameForDisplay()}, ${chars[1].getPlayerNameForDisplay()}, and ${chars[2].getPlayerNameForDisplay()} is evil.`;
  }

  getFalseInfo(gameState: GameState, currentCharId: string): string {
    const chars: Character[] = [];

    // Three good characters
    if (Math.random() < 0.5) {
      const goodChars = shuffleArray(
        gameState.allChars.filter(
          (char) =>
            char.alignment === Alignment.Good &&
            char.inPlay &&
            char.id !== currentCharId,
        ),
      ) as Character[];
      chars.push(goodChars[0]);
      chars.push(goodChars[1]);
      chars.push(goodChars[2]);
      // Two evil characters plus any other character
    } else {
      const evilChars = shuffleArray(
        gameState.allChars.filter(
          (char) =>
            char.alignment === Alignment.Evil &&
            char.inPlay &&
            char.id !== currentCharId,
        ),
      ) as Character[];

      const randomOtherChar = shuffleArray(
        gameState.allChars.filter(
          (char) =>
            char.inPlay &&
            char.id !== currentCharId &&
            char.id !== evilChars[0].id &&
            char.id !== evilChars[1].id,
        ),
      )[0] as Character;

      chars.push(evilChars[0]);
      chars.push(evilChars[1]);
      chars.push(randomOtherChar);
    }

    shuffleArray(chars);

    return `Exactly one of ${chars[0].getPlayerNameForDisplay()}, ${chars[1].getPlayerNameForDisplay()}, and ${chars[2].getPlayerNameForDisplay()} is evil.`;
  }
}

export class ShugenjaInfo extends SavantInfoStrategy {
  constructor() {
    super();
    this.isBinary = true;
  }

  getTrueInfo(): string {
    return "The closest evil player sits [clockwise/counterclockwise] from you [reroll if equidistant].";
  }

  getFalseInfo() {
    return "The closest evil player sits [clockwise/counterclockwise] from you [reroll if equidistant].";
  }
}

export class BalloonistInfo extends SavantInfoStrategy {
  constructor() {
    super();
  }

  getTrueInfo(gameState: GameState, currentCharId: string): string {
    const firstChar = shuffleArray(
      gameState.allChars.filter(
        (char) => char.inPlay && char.id !== currentCharId,
      ),
    )[0] as Character;

    const secondChar = shuffleArray(
      gameState.allChars.filter(
        (char) =>
          char.inPlay && char.id !== currentCharId && char.id !== firstChar.id,
      ),
    )[0] as Character;

    if (firstChar.type === secondChar.type) {
      return `${firstChar.getPlayerNameForDisplay()} and ${secondChar.getPlayerNameForDisplay()} are the same character type.`;
    } else {
      return `${firstChar.getPlayerNameForDisplay()} and ${secondChar.getPlayerNameForDisplay()} are different character types.`;
    }
  }

  getFalseInfo(gameState: GameState, currentCharId: string): string {
    const firstChar = shuffleArray(
      gameState.allChars.filter(
        (char) => char.inPlay && char.id !== currentCharId,
      ),
    )[0] as Character;

    const secondChar = shuffleArray(
      gameState.allChars.filter(
        (char) =>
          char.inPlay && char.id !== currentCharId && char.id !== firstChar.id,
      ),
    )[0] as Character;

    if (firstChar.type === secondChar.type) {
      return `${firstChar.getPlayerNameForDisplay()} and ${secondChar.getPlayerNameForDisplay()} are different character types.`;
    } else {
      return `${firstChar.getPlayerNameForDisplay()} and ${secondChar.getPlayerNameForDisplay()} are the same character type.`;
    }
  }
}
