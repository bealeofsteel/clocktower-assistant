import { Character } from "./characters";
import { getAllCharsInPlay } from "./charUtils";
import { EDITIONS_BY_NAME } from "./editions";
import {
  GameState,
  CharacterName,
  SpecialInstructionKey,
  Instruction,
  NightType,
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
        message:
          "Wake all Minions. Show the THIS IS THE DEMON token. Point to the Demon.",
      };
    }
  },
  [SpecialInstructionKey.DemonInfo]: (gameState: GameState) => {
    if (gameState.playerCount >= 7) {
      return {
        label: SpecialInstructionKey.DemonInfo,
        message:
          "Show the THESE ARE YOUR MINIONS token. Point to all Minions. Show the THESE CHARACTERS ARE NOT IN PLAY token. Show 3 not-in-play good character tokens.",
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
    const instructions = [];

    for (const instructionKey of EDITIONS_BY_NAME[gameState.edition]
      .nightInstructions[nightType]) {
      const specialInstructionFunction =
        specialInstructions[instructionKey as SpecialInstructionKey];
      if (specialInstructionFunction) {
        const result = specialInstructionFunction(gameState, nightType);
        if (result) {
          instructions.push({ ...result, checked: false });
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
              label: char.name,
              message: instructionsForChar,
              alignment: char.alignment,
              character: char,
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
