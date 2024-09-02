import { useState } from 'react';
import './App.css'
import PlayerCountSelect from './components/PlayerCountSelect/PlayerCountSelect'
import RandomizeSetup from './components/RandomizeSetup/RandomizeSetup'
import { CharacterName, EditionName, GameState, AssignedChars } from './types';
import { Character, characterClassMap } from './characters';
import { EDITIONS_BY_NAME } from './editions';
import NightInfo, { NightType } from './components/NightInfo/NightInfo';

enum TabName {
  Setup = "setup",
  Nights = "nights",
  Random = "random"
}

const LOCAL_STORAGE_KEY = "gameState";

function App() {

  const initialState = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) as string);

  const populateSelectedCharacters = () => {
    const charGroups = ["townsfolk", "outsiders", "minions", "demons", "demonBluffs", "notInUse"] as (keyof AssignedChars)[];

    charGroups.map((charGroup) => {
      const chars: Character[] = [];
      initialState[charGroup].map((charJson: Character) => {
        const Klass = characterClassMap[charJson.name as CharacterName] || Character;
        chars.push(new Klass(charJson.name).fromJson(charJson))
      });
      initialState[charGroup] = chars;
    });
  };

  if (initialState) {
    populateSelectedCharacters();
  }

  const [selectedTab, setSelectedTab] = useState(TabName.Setup);
  const [playerCount, setPlayerCount] = useState(initialState?.playerCount || 12);
  const [selectedEdition, setSelectedEdition] = useState(initialState?.edition || EditionName.TroubleBrewing);

  const [gameState, setGameState] = useState<GameState>(initialState);

  const updateGameState = (newState: GameState) => {
    setGameState(newState);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newState));
  };
  
  const displayCharName = (char: Character) => {
    return <div key={char.name} className={`char-name-${char.alignment}`}>{char.getDisplayName()}</div>
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
          <div>
            <strong>Edition:</strong>
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
                {gameState.townsfolk.map(displayCharName)}
              </div>
              <div>
                <strong>Outsiders:</strong>
                {gameState.outsiders.map(displayCharName)}
              </div>
              <div>
                <strong>Minions:</strong>
                {gameState.minions.map(displayCharName)}
              </div>
              <div>
                <strong>Demons:</strong>
                {gameState.demons.map(displayCharName)}
              </div>
              <div>
                <strong>Demon Bluffs:</strong>
                {gameState.demonBluffs.map(displayCharName)}
              </div>
              <div>
                <strong>Not in use:</strong>
                {gameState.notInUse.map(displayCharName)}
              </div>
            </>
          }
        </>
      }
      {selectedTab === TabName.Nights && 
        <>
          <NightInfo gameState={gameState} type={NightType.First}></NightInfo>
          <NightInfo gameState={gameState} type={NightType.Other}></NightInfo>
        </>
      }
    </>
  )
}

export default App
