import './PlayerCountSelect.css'
import { playerCountConfig } from '../../gameSettings';
import { Dispatch, SetStateAction } from 'react';

interface PlayerCountSelectProps {
  playerCount: number;
  setPlayerCount: Dispatch<SetStateAction<number>>;
}

function PlayerCountSelect({playerCount, setPlayerCount}: PlayerCountSelectProps) {

    const MIN_COUNT = 5;
    const MAX_COUNT = 15;

    const decrementPlayerCount = () => {
      if (playerCount - 1 >= MIN_COUNT) {
        setPlayerCount(playerCount - 1);
      }
    };

    const incrementPlayerCount = () => {
      if (playerCount + 1 <= MAX_COUNT) {
        setPlayerCount(playerCount + 1);
      }
    };

    return (
      <>
        <div>
          <button className="player-count" onClick={() => decrementPlayerCount()}>-</button>
          <span>Players: {playerCount}</span>
          <button className="player-count" onClick={() => incrementPlayerCount()}>+</button>
        </div>
        <div>
          <span className="good-char-count">{playerCountConfig[playerCount].townsfolk}</span> /{" "}
          <span className="good-char-count">{playerCountConfig[playerCount].outsiders}</span> /{" "} 
          <span className="evil-char-count">{playerCountConfig[playerCount].minions}</span> /{" "} 
          <span className="evil-char-count">{playerCountConfig[playerCount].demons}</span>
        </div>
      </>
    )
}

export default PlayerCountSelect;