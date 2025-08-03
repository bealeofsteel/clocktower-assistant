import { playerCountConfig } from "../../gameSettings";
import {
  Alignment,
  CharacterName,
  CharacterSet,
  CharacterType,
  EditionName,
  GameState,
  PlayerSetup,
} from "../../types";
import "./RandomizeSetup.css";
import { Character } from "../../characters";
import { shuffleArray } from "../../randomUtils";
import { EDITIONS_BY_NAME } from "../../editions";
import { generateNightInstructions } from "../../nightUtils";

interface RandomizeSetupProps {
  playerCount: number;
  updateGameState: (newState: GameState) => void;
  editionName: EditionName;
}

function RandomizeSetup({
  playerCount,
  updateGameState,
  editionName,
}: RandomizeSetupProps) {
  const pickAvailableCharacter = (
    availableChars: Character[],
    allChars: Character[],
  ): Character => {
    const character = availableChars.pop() as Character;
    character.inPlay = true;
    allChars.push(character);
    return character;
  };

  const generateRandomSetup = () => {
    const edition = EDITIONS_BY_NAME[editionName];
    if (edition.isTeensyville && playerCount > 6) {
      window.alert("Teensyville games can only handle 6 players max!");
      return;
    }

    const playerSetup: PlayerSetup = {
      townsfolkToPick: playerCountConfig[playerCount].townsfolk,
      outsidersToPick: playerCountConfig[playerCount].outsiders,
      minionsToPick: playerCountConfig[playerCount].minions,
      demonsToPick: playerCountConfig[playerCount].demons,
    };

    const characterSet = edition.getCharactersForEdition();

    const allCharNamesForEdition = {
      townsfolk: characterSet.townsfolk.map((char) => char.name),
      outsiders: characterSet.outsiders.map((char) => char.name),
      minions: characterSet.minions.map((char) => char.name),
      demons: characterSet.demons.map((char) => char.name),
    };

    const allChars: Character[] = [];

    const gameState: GameState = {
      demonBluffs: [],
      playerCount: playerCount,
      edition: editionName,
      nightInstructions: {
        first: [],
        other: [],
      },
      startingInfoSuggestions: {},
      otherNightSuggestions: {},
      allCharNamesForEdition,
      allChars,
      randomTools: {
        filters: {
          charType: charTypeFilterOptions,
          inPlay: inPlayFilterOptions,
          alignment: alignmentFilterOptions,
          lifeStatus: lifeStatusFilterOptions,
        },
        randomizedResult: "",
      },
      generatedInfo: {},
      storytellerNotes: "",
    };

    const availableChars: CharacterSet = {
      townsfolk: shuffleArray(characterSet.townsfolk) as Character[],
      outsiders: shuffleArray(characterSet.outsiders) as Character[],
      minions: shuffleArray(characterSet.minions) as Character[],
      demons: shuffleArray(characterSet.demons) as Character[],
    };

    while (playerSetup.demonsToPick > 0) {
      const character = pickAvailableCharacter(availableChars.demons, allChars);
      character.onPicked(playerSetup, availableChars, allChars);
      playerSetup.demonsToPick--;
    }

    while (playerSetup.minionsToPick > 0) {
      const character = pickAvailableCharacter(
        availableChars.minions,
        allChars,
      );
      character.onPicked(playerSetup, availableChars, allChars);
      playerSetup.minionsToPick--;
    }

    // A 3 minion game with a Marionette requires special handling, see wiki for details
    const presetDemonBluffs = [];

    if (
      allChars.filter((char) => char.name === CharacterName.Marionette).length >
        0 &&
      playerCountConfig[playerCount].minions === 3
    ) {
      const minion = shuffleArray(
        allChars.filter(
          (char) =>
            char.type === CharacterType.Minion &&
            char.name !== CharacterName.Marionette,
        ),
      )[0] as Character;

      const actsAsChar = availableChars.townsfolk.pop() as Character;
      minion.actsAsChar = actsAsChar;
      presetDemonBluffs.push(actsAsChar);
    }

    while (
      playerSetup.outsidersToPick > 0 &&
      availableChars.outsiders.length > 0
    ) {
      const character = pickAvailableCharacter(
        availableChars.outsiders,
        allChars,
      );
      character.onPicked(playerSetup, availableChars, allChars);
      playerSetup.outsidersToPick--;
    }

    // Special handling for Teensyville / custom scripts, since there may not be enough Outsiders to choose from.
    // For example, at 6 players 1 Outsider starts in play. The Baron adds 2 more, but only 2 Outsiders are on the script.
    if (playerSetup.outsidersToPick > 0) {
      playerSetup.townsfolkToPick += playerSetup.outsidersToPick;
    }

    while (playerSetup.townsfolkToPick > 0) {
      const character = pickAvailableCharacter(
        availableChars.townsfolk,
        allChars,
      );
      character.onPicked(playerSetup, availableChars, allChars);
      playerSetup.townsfolkToPick--;
    }

    gameState.demonBluffs = generateDemonBluffs(
      presetDemonBluffs,
      availableChars.outsiders,
      availableChars.townsfolk,
    );
    gameState.demonBluffs.forEach((char) => allChars.push(char));

    // Add remaining available character to the allChars array (although not marked as in-play)
    while (availableChars.townsfolk.length > 0) {
      allChars.push(availableChars.townsfolk.pop() as Character);
    }
    while (availableChars.outsiders.length > 0) {
      allChars.push(availableChars.outsiders.pop() as Character);
    }
    while (availableChars.minions.length > 0) {
      allChars.push(availableChars.minions.pop() as Character);
    }
    while (availableChars.demons.length > 0) {
      allChars.push(availableChars.demons.pop() as Character);
    }

    gameState.nightInstructions = generateNightInstructions(gameState);

    gameState.startingInfoSuggestions =
      generateStartingInfoSuggestions(gameState);
    gameState.otherNightSuggestions = generateOtherNightSuggestions(gameState);

    updateGameState(gameState);
  };

  return (
    <>
      <button className="randomize-setup" onClick={() => generateRandomSetup()}>
        Randomize Setup
      </button>
    </>
  );
}

export const generateDemonBluffs = (
  presetDemonBluffs: Character[],
  availableOutsiders: Character[],
  availableTownsfolk: Character[],
): Character[] => {
  const demonBluffs = presetDemonBluffs;
  let numDemonBluffs = 3 - demonBluffs.length;

  if (availableOutsiders.length > 0) {
    for (let i = availableOutsiders.length - 1; i >= 0; i--) {
      const char = availableOutsiders[i];
      if (char.canBeDemonBluff()) {
        availableOutsiders.splice(i, 1);
        demonBluffs.push(char);
        numDemonBluffs--;
        break;
      }
    }
  }

  while (numDemonBluffs > 0 && availableTownsfolk.length > 0) {
    for (let i = availableTownsfolk.length - 1; i >= 0; i--) {
      const char = availableTownsfolk[i];
      if (char.canBeDemonBluff()) {
        availableTownsfolk.splice(i, 1);
        demonBluffs.push(char);
        numDemonBluffs--;
        if (numDemonBluffs === 0) {
          break;
        }
      }
    }
  }

  // If not enough townsfolk are available, fill out the rest with outsiders
  while (numDemonBluffs > 0 && availableOutsiders.length > 0) {
    for (let i = availableOutsiders.length - 1; i >= 0; i--) {
      const char = availableOutsiders[i];
      if (char.canBeDemonBluff()) {
        availableOutsiders.splice(i, 1);
        demonBluffs.push(char);
        numDemonBluffs--;
        if (numDemonBluffs === 0) {
          break;
        }
      }
    }
  }

  shuffleArray(demonBluffs);

  return demonBluffs;
};

export const generateStartingInfoSuggestions = (gameState: GameState) => {
  const startingInfoSuggestions: Record<string, string> = {};

  const inPlayChars = gameState.allChars.filter((char) => char.inPlay);
  for (const char of inPlayChars) {
    const suggestion = char.getDrunkOrSoberStartingInfo(gameState);
    if (suggestion) {
      startingInfoSuggestions[char.id] = suggestion;
    }
  }

  return startingInfoSuggestions;
};

export const generateOtherNightSuggestions = (gameState: GameState) => {
  const otherNightSuggestions: Record<string, string> = {};

  const inPlayChars = gameState.allChars.filter((char) => char.inPlay);
  for (const char of inPlayChars) {
    const suggestion = char.getOtherNightSuggestion(gameState);
    if (suggestion) {
      otherNightSuggestions[char.id] = suggestion;
    }
  }

  return otherNightSuggestions;
};

const charTypeFilterOptions = [
  {
    name: "All",
    checked: true,
  },
  {
    name: "Townsfolk",
    value: CharacterType.Townsfolk,
    checked: false,
  },
  {
    name: "Outsiders",
    value: CharacterType.Outsider,
    checked: false,
  },
  {
    name: "Minions",
    value: CharacterType.Minion,
    checked: false,
  },
  {
    name: "Demons",
    value: CharacterType.Demon,
    checked: false,
  },
];

const inPlayFilterOptions = [
  {
    name: "All",
    checked: true,
  },
  {
    name: "In play",
    value: true,
    checked: false,
  },
  {
    name: "Not in play",
    value: false,
    checked: false,
  },
];

const alignmentFilterOptions = [
  {
    name: "All",
    checked: true,
  },
  {
    name: "Good",
    value: Alignment.Good,
    checked: false,
  },
  {
    name: "Evil",
    value: Alignment.Evil,
    checked: false,
  },
];

const lifeStatusFilterOptions = [
  {
    name: "All",
    checked: true,
  },
  {
    name: "Alive",
    value: false,
    checked: false,
  },
  {
    name: "Dead",
    value: true,
    checked: false,
  },
];

export default RandomizeSetup;
