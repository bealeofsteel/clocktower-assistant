import { useState } from 'react';
import './App.css'
import PlayerCountSelect from './components/PlayerCountSelect/PlayerCountSelect'
import RandomizeSetup from './components/RandomizeSetup/RandomizeSetup'
import { EditionName, GameState, CharacterType } from './types';
import { Character, characterClassNameMap } from './characters';
import { EDITIONS_BY_NAME } from './editions';
import NightInfo, { Instruction, NightType } from './components/NightInfo/NightInfo';
import { parseCharTokens } from './charUtils';
import RandomizationTools from './components/RandomizationTools/RandomizationTools';
import CharacterManagement from './components/CharacterManagement/CharacterManagement';
import CharNameDisplay from './components/CharNameDisplay/CharNameDisplay';

enum TabName {
  Setup = "setup",
  Characters = "characters",
  Nights = "nights",
  Random = "random"
}

const LOCAL_STORAGE_KEY = "gameState";

function App() {

  const initialState = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) as string);
  const instantiatedCharsById = new Map<string, Character>();

  // To take advantage of Character functionality, we need to instantiate Character objects from the saved JSON
  const populateCharacters = () => {
    const chars: Character[] = [];

    const demonBluffIds = initialState.demonBluffs.map((char: Character) => char.id) || [];
    const demonBluffs: Character[] = [];

    initialState.allChars?.forEach((charJson: Character) => {
      const Klass = characterClassNameMap[charJson.name] || Character;
      const char = new Klass(charJson.name).fromJson(charJson);
      chars.push(char);
      instantiatedCharsById.set(charJson.id, char);
      if (demonBluffIds.includes(char.id)) {
        demonBluffs.push(char);
      }
    });
    
    initialState.allChars = chars;
    initialState.demonBluffs = demonBluffs;

    const nightTypes = [NightType.First, NightType.Other];

    nightTypes.forEach((nightType) => {
      initialState.nightInstructions[nightType].forEach((instruction: Instruction) => {
        if (instruction.character) {
          instruction.character = instantiatedCharsById.get(instruction.character.id);
        }
      });
    })
  };

  if (initialState) {
    populateCharacters();
  }

  const [selectedTab, setSelectedTab] = useState(TabName.Setup);
  const [playerCount, setPlayerCount] = useState(initialState?.playerCount || 12);
  const [selectedEdition, setSelectedEdition] = useState(initialState?.edition || EditionName.TroubleBrewing);

  const [gameState, setGameState] = useState<GameState>(initialState);

  const updateGameState = (newState: GameState) => {
    setGameState(newState);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newState));
  };

  const inPlayTownsfolk = gameState?.allChars.filter((char) => char.inPlay && char.type === CharacterType.Townsfolk);
  const inPlayOutsiders = gameState?.allChars.filter((char) => char.inPlay && char.type === CharacterType.Outsider);
  const inPlayMinions = gameState?.allChars.filter((char) => char.inPlay && char.type === CharacterType.Minion);
  const inPlayDemons = gameState?.allChars.filter((char) => char.inPlay && char.type === CharacterType.Demon);

  const demonBluffCharNames = gameState?.demonBluffs.map((char) => char.name);
  const notInPlayChars = gameState?.allChars.filter((char) => !char.inPlay && !demonBluffCharNames.includes(char.name));
  
  return (
    <>
      <h1>Clocktower Assistant</h1>
      <div className="tabs">
        <button onClick={() => setSelectedTab(TabName.Setup)}>Setup</button>
        <button onClick={() => setSelectedTab(TabName.Characters)}>Characters</button>
        <button onClick={() => setSelectedTab(TabName.Nights)}>Nights</button>
        <button onClick={() => setSelectedTab(TabName.Random)}>Random</button>
        
      </div>
      {selectedTab === TabName.Setup && 
        <>
          <div className="edition-container">
            <strong>Edition: </strong>
            <select value={selectedEdition} onChange={e => setSelectedEdition(e.target.value)}>
              {Object.keys(EDITIONS_BY_NAME).map(editionName => (
                <option key={editionName} value={editionName}>{editionName}</option>
              ))}
            </select>
          </div>
          <PlayerCountSelect playerCount={playerCount} setPlayerCount={setPlayerCount}></PlayerCountSelect>
          <RandomizeSetup playerCount={playerCount} updateGameState={updateGameState} editionName={selectedEdition}></RandomizeSetup>

          {gameState && 
            <>
              <div>
                <strong>Townsfolk:</strong>
                {inPlayTownsfolk.map((char) =>
                  <CharNameDisplay 
                    key={char.id}
                    gameState={gameState}
                    updateGameState={updateGameState}
                    char={char}
                    playable={true}
                  />
                )}
              </div>
              <div>
                <strong>Outsiders:</strong>
                {inPlayOutsiders.map((char) =>
                  <CharNameDisplay 
                    key={char.id}
                    gameState={gameState}
                    updateGameState={updateGameState}
                    char={char}
                    playable={true}
                  />
                )}
              </div>
              <div>
                <strong>Minions:</strong>
                {inPlayMinions.map((char) =>
                  <CharNameDisplay 
                    key={char.id}
                    gameState={gameState}
                    updateGameState={updateGameState}
                    char={char}
                    playable={true}
                  />
                )}
              </div>
              <div>
                <strong>Demons:</strong>
                {inPlayDemons.map((char) =>
                  <CharNameDisplay 
                    key={char.id}
                    gameState={gameState}
                    updateGameState={updateGameState}
                    char={char}
                    playable={true}
                  />
                )}
              </div>
              <div>
                <strong>Demon Bluffs:</strong>
                {gameState.demonBluffs.map((char) =>
                  <CharNameDisplay 
                    key={char.id}
                    gameState={gameState}
                    updateGameState={updateGameState}
                    char={char}
                    playable={false}
                  />
                )}
              </div>
              <div>
                <strong>Not in play:</strong>
                {notInPlayChars.map((char) =>
                  <CharNameDisplay 
                    key={char.id}
                    gameState={gameState}
                    updateGameState={updateGameState}
                    char={char}
                    playable={false}
                  />
                )}
              </div>
              <div>
                <strong>Starting Info:</strong>
                {gameState.nightInstructions[NightType.First]?.map((instruction) => (
                  instruction.character && gameState.startingInfoSuggestions[instruction.character.name] ? (
                    <div key={instruction.label}>
                      <span className={`char-name ${instruction.character.alignment}`}>{instruction.character.getDisplayName()}</span>
                      : {parseCharTokens(gameState.startingInfoSuggestions[instruction.character.name] as string, instantiatedCharsById)}
                    </div>
                  ) : null
                ))}
              </div>
            </>
          }
        </>
      }
      {selectedTab === TabName.Characters && 
        <CharacterManagement gameState={gameState} updateGameState={updateGameState}></CharacterManagement>
      }
      {selectedTab === TabName.Nights && 
        <>
          <NightInfo 
            gameState={gameState} 
            type={NightType.First} 
            updateGameState={updateGameState} 
            instantiatedCharsById={instantiatedCharsById}>
          </NightInfo>
          <NightInfo 
            gameState={gameState} 
            type={NightType.Other} 
            updateGameState={updateGameState} 
            instantiatedCharsById={instantiatedCharsById}>
          </NightInfo>
        </>
      }
      {selectedTab === TabName.Random && 
        <RandomizationTools gameState={gameState}></RandomizationTools>
      }
    </>
  )
}

export default App;
