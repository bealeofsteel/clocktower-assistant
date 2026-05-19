import { useState } from "react";
import "./App.css";
import PlayerCountSelect from "./components/PlayerCountSelect/PlayerCountSelect";
import RandomizeSetup from "./components/RandomizeSetup/RandomizeSetup";
import { EditionName, CharacterType, NightType } from "./types";
import { EDITIONS_BY_NAME } from "./editions";
import { getCharsById, getTokenInUseMap, parseCharTokens } from "./charUtils";
import RandomizationTools from "./components/RandomizationTools/RandomizationTools";
import CharacterManagement from "./components/CharacterManagement/CharacterManagement";
import CharNameDisplay from "./components/CharNameDisplay/CharNameDisplay";
import NightInfo from "./components/NightInfo/NightInfo";
import InfoGenerator from "./components/InfoGenerator/InfoGenerator";
import { GameStateProvider, useGameState } from "./context/GameStateContext";

enum TabName {
  Setup = "setup",
  Characters = "characters",
  Nights = "nights",
  Random = "random",
  Info = "info",
}

// ---------------------------------------------------------------------------
// Inner app — has access to context
// ---------------------------------------------------------------------------

function AppInner() {
  const {
    gameState,
    undoLastStateChange,
    regenerateStartingInfo,
    regenerateStartingInfoForChar,
    regenerateDemonBluffs,
  } = useGameState();

  const [selectedTab, setSelectedTab] = useState(TabName.Setup);
  const [playerCount, setPlayerCount] = useState(gameState?.playerCount || 12);
  const [selectedEdition, setSelectedEdition] = useState(
    gameState?.edition || EditionName.TroubleBrewing,
  );

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
  const tokenInUseMap = getTokenInUseMap(gameState);

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
              onChange={(e) =>
                setSelectedEdition(e.target.value as EditionName)
              }
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
          />
          <RandomizeSetup
            playerCount={playerCount}
            editionName={selectedEdition}
          />

          {gameState && (
            <>
              <div>
                <strong>Townsfolk:</strong>
                {inPlayTownsfolk.map((char) => (
                  <CharNameDisplay key={char.id} char={char} playable={true} />
                ))}
              </div>
              <div>
                <strong>Outsiders:</strong>
                {inPlayOutsiders.map((char) => (
                  <CharNameDisplay key={char.id} char={char} playable={true} />
                ))}
              </div>
              <div>
                <strong>Minions:</strong>
                {inPlayMinions.map((char) => (
                  <CharNameDisplay key={char.id} char={char} playable={true} />
                ))}
              </div>
              <div>
                <strong>Demons:</strong>
                {inPlayDemons.map((char) => (
                  <CharNameDisplay key={char.id} char={char} playable={true} />
                ))}
              </div>
              <div>
                <span className="refresh-icon" onClick={regenerateDemonBluffs}>
                  ⟳
                </span>
                <strong>Demon Bluffs:</strong>
                {gameState.demonBluffs.map((char) => (
                  <CharNameDisplay key={char.id} char={char} playable={false} />
                ))}
              </div>
              <div>
                <strong>Not in play:</strong>
                {notInPlayChars.map((char) => (
                  <CharNameDisplay
                    key={char.id}
                    char={char}
                    playable={false}
                    tokenInUseMap={tokenInUseMap}
                  />
                ))}
              </div>
              <div>
                <span className="refresh-icon" onClick={regenerateStartingInfo}>
                  ⟳
                </span>
                <strong>Starting Info:</strong>
                {gameState.nightInstructions[NightType.First]?.map(
                  (instruction) =>
                    instruction.charId &&
                    gameState.startingInfoSuggestions[instruction.charId] ? (
                      <div key={instruction.key}>
                        <span
                          className="refresh-icon"
                          onClick={() =>
                            regenerateStartingInfoForChar(
                              instruction.charId as string,
                            )
                          }
                        >
                          ⟳
                        </span>
                        <span
                          className={`char-name ${charsById[instruction.charId].alignment}`}
                        >
                          {charsById[instruction.charId].getDisplayName()}
                          {charsById[instruction.charId].isDrunkOrPoisoned
                            ? " 🤢"
                            : ""}
                        </span>
                        :{" "}
                        <span
                          dangerouslySetInnerHTML={{
                            __html: parseCharTokens(
                              gameState.startingInfoSuggestions[
                                instruction.charId
                              ] as string,
                              charsById,
                            ),
                          }}
                        />
                      </div>
                    ) : null,
                )}
              </div>
            </>
          )}
        </>
      )}

      {selectedTab === TabName.Characters && <CharacterManagement />}
      {selectedTab === TabName.Nights && (
        <>
          <NightInfo type={NightType.First} />
          <NightInfo type={NightType.Other} />
        </>
      )}
      {selectedTab === TabName.Random && <RandomizationTools />}
      {selectedTab === TabName.Info && <InfoGenerator />}

      <div className="undo-button-container">
        <button onClick={undoLastStateChange}>Undo</button>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Root — wraps everything in the provider
// ---------------------------------------------------------------------------

function App() {
  return (
    <GameStateProvider>
      <AppInner />
    </GameStateProvider>
  );
}

export default App;
