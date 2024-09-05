import { ChangeEvent, useState } from 'react';
import './App.css'
import PlayerCountSelect from './components/PlayerCountSelect/PlayerCountSelect'
import RandomizeSetup from './components/RandomizeSetup/RandomizeSetup'
import { EditionName, GameState, CharacterName, CharGroup } from './types';
import { Character, characterClassNameMap } from './characters';
import { EDITIONS_BY_NAME } from './editions';
import NightInfo, { Instruction, NightType } from './components/NightInfo/NightInfo';
import { parseCharTokens } from './charUtils';
import RandomizationTools from './components/RandomizationTools/RandomizationTools';

enum TabName {
  Setup = "setup",
  Nights = "nights",
  Random = "random"
}

const LOCAL_STORAGE_KEY = "gameState";

function App() {

  const initialState = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) as string);
  const instantiatedCharsByName = new Map<CharacterName, Character>();

  // To take advantage of Character functionality, we need to instantiate Character objects from the saved JSON
  const populateCharacters = () => {
    const charGroups = [CharGroup.Townsfolk, CharGroup.Outsiders, CharGroup.Minions, CharGroup.Demons, CharGroup.DemonBluffs, CharGroup.NotInPlay];

    charGroups.forEach((charGroup) => {
      const chars: Character[] = [];
      initialState[charGroup].forEach((charJson: Character) => {
        const Klass = characterClassNameMap[charJson.name] || Character;
        const char = new Klass(charJson.name).fromJson(charJson);
        chars.push(char);
        instantiatedCharsByName.set(charJson.name, char);
      });
      initialState[charGroup] = chars;
    });

    const nightTypes = [NightType.First, NightType.Other];

    nightTypes.forEach((nightType) => {
      initialState.nightInstructions[nightType].forEach((instruction: Instruction) => {
        if (instruction.character) {
          instruction.character = instantiatedCharsByName.get(instruction.character.name);
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

  const toggleDeadAliveState = (char: Character, category: CharGroup) => {
    const newChars = gameState[category].map((oldChar) => {
      if (oldChar.name === char.name) {
        return Object.assign(oldChar, { isDead: !char.isDead });
      } else {
        return oldChar;
      }
    });

    updateGameState({
      ...gameState,
      [category]: newChars
    });
  };

  const updatePlayerName = (e: ChangeEvent<HTMLInputElement>, char: Character, category: CharGroup) => {
    const newChars = gameState[category].map((oldChar) => {
      if (oldChar.name === char.name) {
        return Object.assign(oldChar, { playerName: e.target.value });
      } else {
        return oldChar;
      }
    });

    updateGameState({
      ...gameState,
      [category]: newChars
    });
  };
  
  const displayCharName = (char: Character, category?: CharGroup) => {
    return (
      <div key={`${char.name}-name`} className="char-name-container">
        <span className={`char-name clickable ${char.alignment} ${char.isDead ? "is-dead" : ""}`} 
          onClick={category ? () => toggleDeadAliveState(char, category) : () => {}}>{char.getDisplayName()} 
        </span>
        { category && <input type="text" value={char.playerName} onChange={(e) => updatePlayerName(e, char, category)}></input> }
      </div>
    )

  };

  return (
    <>
      <h1>Clocktower Assistant</h1>
      <div className="tabs">
        <button onClick={() => setSelectedTab(TabName.Setup)}>Setup</button>
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
                {gameState.townsfolk.map((char) => displayCharName(char, CharGroup.Townsfolk))}
              </div>
              <div>
                <strong>Outsiders:</strong>
                {gameState.outsiders.map((char) => displayCharName(char, CharGroup.Outsiders))}
              </div>
              <div>
                <strong>Minions:</strong>
                {gameState.minions.map((char) => displayCharName(char, CharGroup.Minions))}
              </div>
              <div>
                <strong>Demons:</strong>
                {gameState.demons.map((char) => displayCharName(char, CharGroup.Demons))}
              </div>
              <div>
                <strong>Demon Bluffs:</strong>
                {gameState.demonBluffs.map((char) => displayCharName(char))}
              </div>
              <div>
                <strong>Not in play:</strong>
                {gameState.notInPlay.map((char) => displayCharName(char))}
              </div>
              <div>
                <strong>Starting Info:</strong>
                {gameState.nightInstructions[NightType.First]?.map((instruction) => (
                  instruction.character && gameState.startingInfoSuggestions[instruction.character.name] ? (
                    <div key={instruction.label}>
                      <span className={`char-name ${instruction.character.alignment}`}>{instruction.character.getDisplayName()}</span>
                      : {parseCharTokens(gameState.startingInfoSuggestions[instruction.character.name] as string, instantiatedCharsByName)}
                    </div>
                  ) : null
                ))}
              </div>
            </>
          }
        </>
      }
      {selectedTab === TabName.Nights && 
        <>
          <NightInfo 
            gameState={gameState} 
            type={NightType.First} 
            updateGameState={updateGameState} 
            instantiatedCharsByName={instantiatedCharsByName}>
          </NightInfo>
          <NightInfo 
            gameState={gameState} 
            type={NightType.Other} 
            updateGameState={updateGameState} 
            instantiatedCharsByName={instantiatedCharsByName}>
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
