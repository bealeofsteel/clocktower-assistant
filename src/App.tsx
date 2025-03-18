import { useState } from "react";
import "./App.css";
import PlayerCountSelect from "./components/PlayerCountSelect/PlayerCountSelect";
import RandomizeSetup, {
  generateDemonBluffs,
  generateOtherNightSuggestions,
  generateStartingInfoSuggestions,
} from "./components/RandomizeSetup/RandomizeSetup";
import {
  EditionName,
  GameState,
  CharacterType,
  NightType,
  CharacterName,
} from "./types";
import { Character } from "./characters";
import { EDITIONS_BY_NAME } from "./editions";
import { cloneChar, getCharsById, parseCharTokens } from "./charUtils";
import RandomizationTools from "./components/RandomizationTools/RandomizationTools";
import CharacterManagement from "./components/CharacterManagement/CharacterManagement";
import CharNameDisplay from "./components/CharNameDisplay/CharNameDisplay";
import NightInfo from "./components/NightInfo/NightInfo";
import InfoGenerator from "./components/InfoGenerator/InfoGenerator";
import { shuffleArray } from "./randomUtils";
import { regenerateNightInstructions } from "./nightUtils";

enum TabName {
  Setup = "setup",
  Characters = "characters",
  Nights = "nights",
  Random = "random",
  Info = "info",
}

const LOCAL_STORAGE_KEY = "gameState";

function App() {
  const initialState = JSON.parse(
    localStorage.getItem(LOCAL_STORAGE_KEY) as string,
  );
  const instantiatedCharsById = new Map<string, Character>();

  // To take advantage of Character functionality, we need to instantiate Character objects from the saved JSON
  const populateCharacters = () => {
    const chars: Character[] = [];

    const demonBluffIds =
      initialState.demonBluffs.map((char: Character) => char.id) || [];
    const demonBluffs: Character[] = [];

    initialState.allChars?.forEach((charJson: Character) => {
      const char = cloneChar(charJson);

      if (char.actsAsChar) {
        char.actsAsChar = cloneChar(char.actsAsChar);
      }

      chars.push(char);
      instantiatedCharsById.set(charJson.id, char);
      if (demonBluffIds.includes(char.id)) {
        demonBluffs.push(char);
      }
    });

    initialState.allChars = chars;
    initialState.demonBluffs = demonBluffs;
  };

  if (initialState) {
    populateCharacters();
  }

  const [selectedTab, setSelectedTab] = useState(TabName.Setup);
  const [playerCount, setPlayerCount] = useState(
    initialState?.playerCount || 12,
  );
  const [selectedEdition, setSelectedEdition] = useState(
    initialState?.edition || EditionName.TroubleBrewing,
  );

  const [gameState, setGameState] = useState<GameState>(initialState);

  const updateGameState = (newState: GameState) => {
    setGameState(newState);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newState));
  };

  const regenerateStartingInfo = () => {
    const startingInfoSuggestions = generateStartingInfoSuggestions(gameState);
    const otherNightSuggestions = generateOtherNightSuggestions(gameState);

    updateGameState({
      ...gameState,
      startingInfoSuggestions,
      otherNightSuggestions,
    });
  };

  const regenerateDemonBluffs = () => {
    const actsAsCharNames: string[] = [];
    gameState.allChars.forEach((char) => {
      if (char.actsAsChar) {
        actsAsCharNames.push(char.actsAsChar.name);
      }
    });

    const availableOutsiders = shuffleArray(
      gameState.allChars.filter(
        (char) =>
          !char.inPlay &&
          char.type === CharacterType.Outsider &&
          !actsAsCharNames.includes(char.name),
      ),
    ) as Character[];
    const availableTownsfolk = shuffleArray(
      gameState.allChars.filter(
        (char) =>
          !char.inPlay &&
          char.type === CharacterType.Townsfolk &&
          !actsAsCharNames.includes(char.name),
      ),
    ) as Character[];

    const demonBluffs = generateDemonBluffs(
      availableOutsiders,
      availableTownsfolk,
    );

    const newGameState = {
      ...gameState,
      demonBluffs,
    };

    // Regenerate night instructions to update the Demon Info
    newGameState.nightInstructions = regenerateNightInstructions(
      gameState,
      newGameState,
    );

    updateGameState(newGameState);
  };

  const inPlayTownsfolk = gameState?.allChars.filter(
    (char) => char.inPlay && char.type === CharacterType.Townsfolk,
  );
  const inPlayOutsiders = gameState?.allChars.filter(
    (char) => char.inPlay && char.type === CharacterType.Outsider,
  );
  const inPlayMinions = gameState?.allChars.filter(
    (char) => char.inPlay && char.type === CharacterType.Minion,
  );
  const inPlayDemons = gameState?.allChars.filter(
    (char) => char.inPlay && char.type === CharacterType.Demon,
  );

  const demonBluffCharNames = gameState?.demonBluffs.map((char) => char.name);
  const notInPlayChars = gameState?.allChars.filter(
    (char) => !char.inPlay && !demonBluffCharNames.includes(char.name),
  );

  const charsById = getCharsById(gameState);

  const tokenInUseMap: Partial<Record<CharacterName, CharacterName>> = {};
  gameState?.allChars.forEach((char) => {
    const charTokenUsed = char.getCharTokenInUse();
    if (charTokenUsed) {
      tokenInUseMap[charTokenUsed] = char.name;
    }
  });

  return (
    <>
      <h1>Clocktower Assistant</h1>
      <div className="tabs">
        <button onClick={() => setSelectedTab(TabName.Setup)}>Setup</button>
        <button onClick={() => setSelectedTab(TabName.Characters)}>
          Characters
        </button>
        <button onClick={() => setSelectedTab(TabName.Nights)}>Nights</button>
        <button onClick={() => setSelectedTab(TabName.Random)}>Random</button>
        <button onClick={() => setSelectedTab(TabName.Info)}>Info</button>
      </div>
      {selectedTab === TabName.Setup && (
        <>
          <div className="edition-container">
            <strong>Edition: </strong>
            <select
              value={selectedEdition}
              onChange={(e) => setSelectedEdition(e.target.value)}
            >
              <optgroup label="Base">
                {Object.entries(EDITIONS_BY_NAME)
                  .filter(([_editionName, edition]) => !edition.isCustom)
                  .map(([editionName]) => (
                    <option key={editionName} value={editionName}>
                      {editionName}
                    </option>
                  ))}
              </optgroup>
              <optgroup label="Custom">
                {Object.entries(EDITIONS_BY_NAME)
                  .filter(([_editionName, edition]) => edition.isCustom)
                  .map(([editionName]) => (
                    <option key={editionName} value={editionName}>
                      {editionName}
                    </option>
                  ))}
              </optgroup>
            </select>
          </div>
          <PlayerCountSelect
            playerCount={playerCount}
            setPlayerCount={setPlayerCount}
          ></PlayerCountSelect>
          <RandomizeSetup
            playerCount={playerCount}
            updateGameState={updateGameState}
            editionName={selectedEdition}
          ></RandomizeSetup>

          {gameState && (
            <>
              <div>
                <strong>Townsfolk:</strong>
                {inPlayTownsfolk.map((char) => (
                  <CharNameDisplay
                    key={char.id}
                    gameState={gameState}
                    updateGameState={updateGameState}
                    char={char}
                    playable={true}
                  />
                ))}
              </div>
              <div>
                <strong>Outsiders:</strong>
                {inPlayOutsiders.map((char) => (
                  <CharNameDisplay
                    key={char.id}
                    gameState={gameState}
                    updateGameState={updateGameState}
                    char={char}
                    playable={true}
                  />
                ))}
              </div>
              <div>
                <strong>Minions:</strong>
                {inPlayMinions.map((char) => (
                  <CharNameDisplay
                    key={char.id}
                    gameState={gameState}
                    updateGameState={updateGameState}
                    char={char}
                    playable={true}
                  />
                ))}
              </div>
              <div>
                <strong>Demons:</strong>
                {inPlayDemons.map((char) => (
                  <CharNameDisplay
                    key={char.id}
                    gameState={gameState}
                    updateGameState={updateGameState}
                    char={char}
                    playable={true}
                  />
                ))}
              </div>
              <div>
                <span
                  className="refresh-icon"
                  onClick={() => regenerateDemonBluffs()}
                >
                  ⟳
                </span>
                <strong>Demon Bluffs:</strong>
                {gameState.demonBluffs.map((char) => (
                  <CharNameDisplay
                    key={char.id}
                    gameState={gameState}
                    updateGameState={updateGameState}
                    char={char}
                    playable={false}
                  />
                ))}
              </div>
              <div>
                <strong>Not in play:</strong>
                {notInPlayChars.map((char) => (
                  <CharNameDisplay
                    key={char.id}
                    gameState={gameState}
                    updateGameState={updateGameState}
                    char={char}
                    playable={false}
                    tokenInUseMap={tokenInUseMap}
                  />
                ))}
              </div>
              <div>
                <span
                  className="refresh-icon"
                  onClick={() => regenerateStartingInfo()}
                >
                  ⟳
                </span>
                <strong>Starting Info:</strong>
                {gameState.nightInstructions[NightType.First]?.map(
                  (instruction) =>
                    instruction.charId &&
                    gameState.startingInfoSuggestions[instruction.charId] ? (
                      <div key={instruction.key}>
                        <span
                          className={`char-name ${charsById[instruction.charId].alignment}`}
                        >
                          {charsById[instruction.charId].getDisplayName()}
                        </span>
                        :{" "}
                        <span
                          dangerouslySetInnerHTML={{
                            __html: parseCharTokens(
                              gameState.startingInfoSuggestions[
                                instruction.charId
                              ] as string,
                              instantiatedCharsById,
                            ),
                          }}
                        ></span>
                      </div>
                    ) : null,
                )}
              </div>
            </>
          )}
        </>
      )}
      {selectedTab === TabName.Characters && (
        <CharacterManagement
          gameState={gameState}
          updateGameState={updateGameState}
        ></CharacterManagement>
      )}
      {selectedTab === TabName.Nights && (
        <>
          <NightInfo
            gameState={gameState}
            type={NightType.First}
            updateGameState={updateGameState}
            instantiatedCharsById={instantiatedCharsById}
          ></NightInfo>
          <NightInfo
            gameState={gameState}
            type={NightType.Other}
            updateGameState={updateGameState}
            instantiatedCharsById={instantiatedCharsById}
          ></NightInfo>
        </>
      )}
      {selectedTab === TabName.Random && (
        <RandomizationTools
          gameState={gameState}
          updateGameState={updateGameState}
        ></RandomizationTools>
      )}
      {selectedTab === TabName.Info && (
        <InfoGenerator
          gameState={gameState}
          updateGameState={updateGameState}
        ></InfoGenerator>
      )}
    </>
  );
}

export default App;
