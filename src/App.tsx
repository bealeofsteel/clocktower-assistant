import { useCallback, useState } from 'react';
import './App.css'
import PlayerCountSelect from './components/PlayerCountSelect/PlayerCountSelect'
import RandomizeSetup from './components/RandomizeSetup/RandomizeSetup'
import { CharacterName, EditionName, GameState, AssignedChars } from './types';
import { Baron, Character, Drunk } from './characters';
import { EDITIONS_BY_NAME } from './editions';

function App() {

  const initialState = JSON.parse(localStorage.getItem("gameState") as string);

  const populateSelectedCharacters = () => {
    const charGroups = ["townsfolk", "outsiders", "minions", "demons", "demonBluffs", "notInUse"] as (keyof AssignedChars)[];
    const classMap: Partial<Record<CharacterName, (json: Character) => Character>> = {
      [CharacterName.Baron]: Baron.fromJson,
      [CharacterName.Drunk]: Drunk.fromJson
    };

    charGroups.map((charGroup) => {
      const chars: Character[] = [];
      initialState[charGroup].map((charJson: Character) => {
        const fromJsonFunction = classMap[charJson.name as CharacterName] || Character.fromJson;
        chars.push(fromJsonFunction(charJson))
      });
      initialState[charGroup] = chars;
    });
  };

  if (initialState) {
    populateSelectedCharacters();
  }

  const [selectedTab, setSelectedTab] = useState("setup");
  const [playerCount, setPlayerCount] = useState(initialState?.playerCount || 12);
  const [selectedEdition, setSelectedEdition] = useState(initialState?.edition || EditionName.TroubleBrewing);

  const [gameState, setGameState] = useState<GameState>(initialState);

  const updateGameState = (newState: GameState) => {
    setGameState(newState);
    localStorage.setItem("gameState", JSON.stringify(newState));
  };
  
  const displayCharName = (char: Character) => {
    return <div key={char.name}>{char.getDisplayName()}</div>
  };

  return (
    <>
      <h1>Clocktower Assistant</h1>
      <div className="tabs">
        <button onClick={() => setSelectedTab("setup")}>Setup</button>
        <button onClick={() => setSelectedTab("nights")}>Nights</button>
        <button onClick={() => setSelectedTab("random")}>Random</button>
      </div>
      {selectedTab === "setup" && 
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
    </>
  )
}

export default App
