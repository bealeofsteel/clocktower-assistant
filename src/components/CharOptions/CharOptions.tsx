import { GameState } from "../../types";

interface CharOptionsProps {
  gameState: GameState;
}

function CharOptions({ gameState }: CharOptionsProps) {
  return (
    <>
      <optgroup label="Townsfolk">
        {gameState.allCharNamesForEdition.townsfolk.map((charName) => (
          <option key={charName} value={charName}>
            {charName}
          </option>
        ))}
      </optgroup>
      <optgroup label="Outsiders">
        {gameState.allCharNamesForEdition.outsiders.map((charName) => (
          <option key={charName} value={charName}>
            {charName}
          </option>
        ))}
      </optgroup>
      <optgroup label="Minions">
        {gameState.allCharNamesForEdition.minions.map((charName) => (
          <option key={charName} value={charName}>
            {charName}
          </option>
        ))}
      </optgroup>
      <optgroup label="Demons">
        {gameState.allCharNamesForEdition.demons.map((charName) => (
          <option key={charName} value={charName}>
            {charName}
          </option>
        ))}
      </optgroup>
    </>
  );
}

export default CharOptions;
