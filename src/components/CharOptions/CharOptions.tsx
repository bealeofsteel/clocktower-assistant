import { useGameState } from "../../context/GameStateContext";

function CharOptions() {
  const { gameState } = useGameState();
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
