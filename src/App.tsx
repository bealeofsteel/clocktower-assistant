import { useState } from 'react';
import './App.css'
import PlayerCountSelect from './components/PlayerCountSelect/PlayerCountSelect'
import RandomizeSetup from './components/RandomizeSetup/RandomizeSetup'
import { GameState } from './types';
import { Character } from './characters';

function App() {

  const [selectedTab, setSelectedTab] = useState("setup");
  const [playerCount, setPlayerCount] = useState(12);

  const [gameState, setGameState] = useState<GameState>();
  
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
          <PlayerCountSelect playerCount={playerCount} setPlayerCount={setPlayerCount}></PlayerCountSelect>
          <RandomizeSetup playerCount={playerCount} setGameState={setGameState}></RandomizeSetup>

          {gameState && 
            <>
              <div>
                <strong>Townsfolk:</strong>
                {gameState.townsfolk.picked.map(displayCharName)}
              </div>
              <div>
                <strong>Outsiders:</strong>
                {gameState.outsiders.picked.map(displayCharName)}
              </div>
              <div>
                <strong>Minions:</strong>
                {gameState.minions.picked.map(displayCharName)}
              </div>
              <div>
                <strong>Demons:</strong>
                {gameState.demons.picked.map(displayCharName)}
              </div>
              <div>
                <strong>Demon Bluffs:</strong>
                {gameState.demonBluffs.map(displayCharName)}
              </div>
            </>
          }
        </>
      }
    </>
  )
}

export default App
