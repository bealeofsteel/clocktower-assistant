import { Character } from "./characters";
import { getAllCharsInPlay, getCharsById } from "./charUtils";
import { EDITIONS_BY_NAME } from "./editions";
import {
  GameState,
  CharacterName,
  SpecialInstructionKey,
  Instruction,
  NightType,
  CharacterType,
} from "./types";

const specialInstructions = {
  [SpecialInstructionKey.Dusk]: () => {
    return {
      label: SpecialInstructionKey.Dusk,
      message: "Check that all eyes are closed. Some Travellers & Fabled act.",
    };
  },
  [SpecialInstructionKey.MinionInfo]: (gameState: GameState) => {
    if (gameState.playerCount >= 7) {
      return {
        label: SpecialInstructionKey.MinionInfo,
        message: `Wake all Minions. Show the THIS IS THE DEMON token. Point to the Demon. <strong>Suggestion:</strong> Wake ${gameState.allChars
          .filter((char) => char.inPlay && char.type === CharacterType.Minion)
          .map((char) => `{{${char.id}}}`)
          .join(
            ", ",
          )}. Point to {{${gameState.allChars.filter((char) => char.inPlay && char.type === CharacterType.Demon)[0].id}}}.`,
      };
    }
  },
  [SpecialInstructionKey.DemonInfo]: (gameState: GameState) => {
    if (gameState.playerCount >= 7) {
      return {
        label: SpecialInstructionKey.DemonInfo,
        message: `Show the THESE ARE YOUR MINIONS token. Point to all Minions. Show the THESE CHARACTERS ARE NOT IN PLAY token. Show 3 not-in-play good character tokens. <strong>Suggestion:</strong> Wake {{${gameState.allChars.filter((char) => char.inPlay && char.type === CharacterType.Demon)[0].id}}}. Point to ${gameState.allChars
          .filter((char) => char.inPlay && char.type === CharacterType.Minion)
          .map((char) => `{{${char.id}}}`)
          .join(
            ", ",
          )}. Show ${gameState.demonBluffs[0].name}, ${gameState.demonBluffs[1].name}, and ${gameState.demonBluffs[2].name}.`,
      };
    }
  },
  [SpecialInstructionKey.Dawn]: (
    _gameState: GameState,
    nightType: NightType,
  ) => {
    const message =
      nightType === NightType.First
        ? "Wait a few seconds. Call for eyes open."
        : "Wait a few seconds. Call for eyes open & immediately say who died.";
    return {
      label: SpecialInstructionKey.Dawn,
      message,
    };
  },
};

export const generateNightInstructions = (gameState: GameState) => {
  const result: Record<NightType, Instruction[]> = {
    first: [],
    other: [],
  };

  // To handle Drunk logic, we need a list of the characters who appear to be in play
  const charsInPlay = getAllCharsInPlay(gameState);
  const instructionCharNameToCharacters: Partial<
    Record<CharacterName, Character[]>
  > = {};
  charsInPlay.forEach((char) => {
    const identity = char.getIdentityForInstructions();
    const charArray = instructionCharNameToCharacters[identity] || [];
    charArray.push(char);
    instructionCharNameToCharacters[identity] = charArray;
  });

  [NightType.First, NightType.Other].forEach((nightType: NightType) => {
    const instructions: Instruction[] = [];

    for (const instructionKey of EDITIONS_BY_NAME[gameState.edition]
      .nightInstructions[nightType]) {
      const specialInstructionFunction =
        specialInstructions[instructionKey as SpecialInstructionKey];
      if (specialInstructionFunction) {
        const result = specialInstructionFunction(gameState, nightType);
        if (result) {
          instructions.push({ ...result, key: result.label, checked: false });
        }
        continue;
      }

      const characters =
        instructionCharNameToCharacters[instructionKey as CharacterName];
      if (characters) {
        characters.forEach((char) => {
          const instructionsForChar =
            nightType === NightType.First
              ? char.getFirstNightInstructions()
              : char.getOtherNightsInstructions();
          if (instructionsForChar) {
            instructions.push({
              key: char.id,
              label: char.name,
              message: instructionsForChar,
              charId: char.id,
              checked: false,
            });
          }
        });
      }
    }

    result[nightType] = instructions;
  });

  return result;
};

// Regenerates night instructions, with checked statuses carrying over
export const regenerateNightInstructions = (
  oldGameState: GameState,
  newGameState: GameState,
): Record<NightType, Instruction[]> => {
  const oldNightInstructions = oldGameState.nightInstructions;

  const checkedInstuctions = {
    [NightType.First]: {} as Record<string, boolean | undefined>,
    [NightType.Other]: {} as Record<string, boolean | undefined>,
  };

  const getInstructionKey = (
    instruction: Instruction,
    gameState: GameState,
  ) => {
    const charsById = getCharsById(gameState);

    if (instruction.label && instruction.charId) {
      let key = `${instruction.label}_${instruction.charId}`;

      const actsAsChar = charsById[instruction.charId].actsAsChar;
      if (actsAsChar) {
        key += `_${actsAsChar.id}`;
      }
      return key;
    } else {
      return instruction.label;
    }
  };

  [NightType.First, NightType.Other].forEach((nightType: NightType) => {
    oldNightInstructions[nightType].forEach((instruction) => {
      checkedInstuctions[nightType][
        getInstructionKey(instruction, oldGameState)
      ] = instruction.checked;
    });
  });

  const newNightInstructions = generateNightInstructions(newGameState);

  [NightType.First, NightType.Other].forEach((nightType: NightType) => {
    newNightInstructions[nightType].forEach((instruction) => {
      if (
        checkedInstuctions[nightType][
          getInstructionKey(instruction, newGameState)
        ]
      ) {
        instruction.checked = true;
      }
    });
  });

  return newNightInstructions;
};
