import { getAbilitiesInPlay } from "./charUtils";
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
          .filter(
            (char) =>
              char.inPlay &&
              char.type === CharacterType.Minion &&
              char.isIncludedInMinionAndDemonInfo(),
          )
          .map((char) => `{{${char.id}}}`)
          .join(
            ", ",
          )}. Point to {{${gameState.allChars.filter((char) => char.inPlay && char.type === CharacterType.Demon)?.[0]?.id}}}.`,
      };
    }
  },
  [SpecialInstructionKey.DemonInfo]: (gameState: GameState) => {
    if (gameState.playerCount >= 7) {
      return {
        label: SpecialInstructionKey.DemonInfo,
        message: `Show the THESE ARE YOUR MINIONS token. Point to all Minions. Show the THESE CHARACTERS ARE NOT IN PLAY token. Show 3 not-in-play good character tokens. <strong>Suggestion:</strong> Wake {{${gameState.allChars.filter((char) => char.inPlay && char.type === CharacterType.Demon)?.[0]?.id}}}. Point to ${gameState.allChars
          .filter(
            (char) =>
              char.inPlay &&
              char.type === CharacterType.Minion &&
              char.isIncludedInMinionAndDemonInfo(),
          )
          .map((char) => `{{${char.id}}}`)
          .join(
            ", ",
          )}. Show ${gameState.demonBluffs.map((bluff) => bluff.name).join(", ")}.`,
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

  const abilitiesInPlayToChars = getAbilitiesInPlay(gameState);

  const edition = EDITIONS_BY_NAME[gameState.edition];

  const firstNightInstructions = edition.isBaseEdition
    ? edition.nightInstructions.first
    : FULL_FIRST_NIGHT_ORDER;

  const otherNightsInstructions = edition.isBaseEdition
    ? edition.nightInstructions.other
    : FULL_OTHER_NIGHTS_ORDER;

  [NightType.First, NightType.Other].forEach((nightType: NightType) => {
    const instructions: Instruction[] = [];

    const nightOrder =
      nightType === NightType.First
        ? firstNightInstructions
        : otherNightsInstructions;

    let lunaticDemonIdx = -1;
    let nightOneDemonIdx = -1;

    for (const instructionLabel of nightOrder) {
      const specialInstructionFunction =
        specialInstructions[instructionLabel as SpecialInstructionKey];
      if (specialInstructionFunction) {
        const result = specialInstructionFunction(gameState, nightType);
        if (result) {
          instructions.push({ ...result, key: result.label, checked: false });
        }
        continue;
      }

      const charInfo =
        abilitiesInPlayToChars[instructionLabel as CharacterName];
      if (charInfo) {
        charInfo.forEach((charInfo) => {
          const instructionsForChar =
            nightType === NightType.First
              ? charInfo.actingChar.getFirstNightInstructions(gameState)
              : charInfo.actingChar.getOtherNightsInstructions();
          if (instructionsForChar) {
            // Lunatic must wake as the Demon before the Demon, so handle it separately
            if (
              charInfo.char.name === CharacterName.Lunatic &&
              charInfo.actingChar.type === CharacterType.Demon
            ) {
              // On other nights, the Lunatic wakes in a fixed position
              if (nightType === NightType.Other) {
                return;
              }
              lunaticDemonIdx = instructions.length;
            }

            if (
              nightType === NightType.First &&
              charInfo.char.type === CharacterType.Demon
            ) {
              nightOneDemonIdx = instructions.length;
            }

            instructions.push({
              key: `${instructionLabel}_${charInfo.char.id}`,
              label: instructionLabel,
              message: instructionsForChar,
              charId: charInfo.char.id,
              checked: false,
            });
          }
        });
      }
    }

    if (
      nightType === NightType.First &&
      nightOneDemonIdx > -1 &&
      lunaticDemonIdx > -1
    ) {
      const [instruction] = instructions.splice(lunaticDemonIdx, 1);
      instructions.splice(nightOneDemonIdx, 0, instruction);
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

  const getInstructionKey = (instruction: Instruction) => {
    if (instruction.charId) {
      return `${instruction.label}_${instruction.charId}`;
    } else {
      return instruction.label;
    }
  };

  [NightType.First, NightType.Other].forEach((nightType: NightType) => {
    oldNightInstructions[nightType].forEach((instruction) => {
      checkedInstuctions[nightType][getInstructionKey(instruction)] =
        instruction.checked;
    });
  });

  const newNightInstructions = generateNightInstructions(newGameState);

  [NightType.First, NightType.Other].forEach((nightType: NightType) => {
    newNightInstructions[nightType].forEach((instruction) => {
      if (checkedInstuctions[nightType][getInstructionKey(instruction)]) {
        instruction.checked = true;
      }
    });
  });

  return newNightInstructions;
};

export const FULL_FIRST_NIGHT_ORDER: (
  | string
  | SpecialInstructionKey
  | CharacterName
)[] = [
  SpecialInstructionKey.Dusk,
  "Angel",
  "Buddhist",
  "Toymaker",
  "Storm Catcher",
  "Wraith",
  "Lord of Typhon",
  "Kazali",
  "Boffin",
  CharacterName.Philosopher,
  "Alchemist",
  "Poppy Grower",
  "Yaggababble",
  "Magician",
  "Tor",
  SpecialInstructionKey.MinionInfo,
  "Snitch",
  CharacterName.Lunatic,
  "Summoner",
  SpecialInstructionKey.DemonInfo,
  "King",
  CharacterName.Sailor,
  CharacterName.Marionette,
  "Engineer",
  "Preacher",
  "Lil' Monsta",
  "Lleech",
  "Xaan",
  CharacterName.Poisoner,
  CharacterName.Widow,
  CharacterName.Courtier,
  "Wizard",
  CharacterName.SnakeCharmer,
  CharacterName.Godfather,
  "Organ Grinder",
  CharacterName.DevilsAdvocate,
  CharacterName.EvilTwin,
  CharacterName.Witch,
  CharacterName.Cerenovous,
  "Fearmonger",
  "Harpy",
  "Mezepheles",
  CharacterName.Pukka,
  "Pixie",
  "Huntsman",
  "Damsel",
  CharacterName.Amnesiac,
  CharacterName.Washerwoman,
  CharacterName.Librarian,
  CharacterName.Investigator,
  CharacterName.Chef,
  CharacterName.Empath,
  CharacterName.FortuneTeller,
  CharacterName.Butler,
  CharacterName.Grandmother,
  CharacterName.Clockmaker,
  CharacterName.Dreamer,
  CharacterName.Seamstress,
  "Steward",
  "Knight",
  CharacterName.Noble,
  CharacterName.Balloonist,
  "Shugenja",
  "Village Idiot",
  "Bounty Hunter",
  "Nightwatchman",
  "Cult Leader",
  CharacterName.Spy,
  "Ogre",
  "High Priestess",
  "General",
  CharacterName.Chambermaid,
  CharacterName.Mathematician,
  SpecialInstructionKey.Dawn,
  CharacterName.Leviathan,
  "Vizier",
];

export const FULL_OTHER_NIGHTS_ORDER: (
  | string
  | SpecialInstructionKey
  | CharacterName
)[] = [
  SpecialInstructionKey.Dusk,
  "Duchess",
  "Toymaker",
  "Wraith",
  CharacterName.Philosopher,
  "Poppy Grower",
  CharacterName.Sailor,
  "Engineer",
  "Preacher",
  "Xaan",
  CharacterName.Poisoner,
  CharacterName.Courtier,
  CharacterName.Innkeeper,
  "Wizard",
  CharacterName.Gambler,
  "Acrobat",
  CharacterName.SnakeCharmer,
  CharacterName.Monk,
  "Organ Grinder",
  CharacterName.DevilsAdvocate,
  CharacterName.Witch,
  CharacterName.Cerenovous,
  CharacterName.PitHag,
  "Fearmonger",
  "Harpy",
  "Mezepheles",
  CharacterName.ScarletWoman,
  "Summoner",
  CharacterName.Lunatic,
  CharacterName.Exorcist,
  "Lycanthrope",
  "Princess",
  "Legion",
  CharacterName.Imp,
  CharacterName.Zombuul,
  CharacterName.Pukka,
  CharacterName.Shabaloth,
  CharacterName.Po,
  CharacterName.FangGu,
  CharacterName.NoDashii,
  CharacterName.Vortox,
  "Lord of Typhon",
  CharacterName.Vigormortis,
  "Ojo",
  "Al-Hadikhia",
  "Lleech",
  "Lil' Monsta",
  "Yaggababble",
  "Kazali",
  CharacterName.Assassin,
  CharacterName.Godfather,
  CharacterName.Gossip,
  "Hatter",
  CharacterName.Barber,
  CharacterName.Sweetheart,
  "Plague Doctor",
  CharacterName.Sage,
  "Banshee",
  CharacterName.Professor,
  "Choirboy",
  "Huntsman",
  "Damsel",
  CharacterName.Amnesiac,
  "Farmer",
  CharacterName.Tinker,
  CharacterName.Moonchild,
  CharacterName.Grandmother,
  "Tor",
  CharacterName.Ravenkeeper,
  CharacterName.Empath,
  CharacterName.FortuneTeller,
  CharacterName.Undertaker,
  CharacterName.Dreamer,
  CharacterName.Flowergirl,
  CharacterName.TownCrier,
  CharacterName.Oracle,
  CharacterName.Seamstress,
  CharacterName.Juggler,
  CharacterName.Balloonist,
  "Village Idiot",
  "King",
  "Bounty Hunter",
  "Nightwatchman",
  "Cult Leader",
  CharacterName.Butler,
  CharacterName.Spy,
  "High Priestess",
  "General",
  CharacterName.Chambermaid,
  CharacterName.Mathematician,
  "Riot",
  SpecialInstructionKey.Dawn,
  CharacterName.Leviathan,
];
