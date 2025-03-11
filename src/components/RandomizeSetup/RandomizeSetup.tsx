import { playerCountConfig } from "../../gameSettings";
import {
  Alignment,
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
    inPlayChars: Character[],
  ): Character => {
    const character = availableChars.pop() as Character;
    character.inPlay = true;
    inPlayChars.push(character);
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

    let numDemonBluffs = 3;

    if (availableChars.outsiders.length > 0) {
      for (let i = availableChars.outsiders.length - 1; i >= 0; i--) {
        const char = availableChars.outsiders[i];
        if (char.canBeDemonBluff()) {
          availableChars.outsiders.splice(i, 1);
          allChars.push(char);
          gameState.demonBluffs.push(char);
          numDemonBluffs--;
          break;
        }
      }
    }

    while (numDemonBluffs > 0) {
      const character = availableChars.townsfolk.pop() as Character;
      allChars.push(character);
      gameState.demonBluffs.push(character);
      numDemonBluffs--;
    }

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

  const generateStartingInfoSuggestions = (gameState: GameState) => {
    const startingInfoSuggestions: Record<string, string> = {};

    const inPlayChars = gameState.allChars.filter((char) => char.inPlay);
    for (const char of inPlayChars) {
      const suggestion = char.getStartingInfoSuggestion(gameState);
      if (suggestion) {
        startingInfoSuggestions[char.id] = suggestion;
      }
    }

    return startingInfoSuggestions;
  };

  const generateOtherNightSuggestions = (gameState: GameState) => {
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

  return (
    <>
      <button className="randomize-setup" onClick={() => generateRandomSetup()}>
        Randomize Setup
      </button>
    </>
  );
}

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
