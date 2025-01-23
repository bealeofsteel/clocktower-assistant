import "./CharacterManagement.css";
import { cloneChar, getAllCharsInPlay } from "../../charUtils";
import { Alignment, GameState } from "../../types";
import PlayerNameInput from "../PlayerNameInput/PlayerNameInput";
import { Character } from "../../characters";
import CharacterSelect from "../CharacterSelect/CharacterSelect";
import CharActsAsSelect from "../CharActsAsSelect/CharActsAsSelect";

interface CharacterManagementProps {
  gameState: GameState;
  updateGameState: (newState: GameState) => void;
}

function CharacterMangement({
  gameState,
  updateGameState,
}: CharacterManagementProps) {
  const toggleAlignment = (char: Character) => {
    const newChars = gameState.allChars.map((oldChar) => {
      if (oldChar.id === char.id) {
        const newChar = cloneChar(oldChar);
        newChar.alignment =
          oldChar.alignment === Alignment.Good
            ? Alignment.Evil
            : Alignment.Good;
        return newChar;
      } else {
        return oldChar;
      }
    });

    updateGameState({
      ...gameState,
      allChars: newChars,
    });
  };

  const toggleDeadAliveState = (char: Character) => {
    const newChars = gameState.allChars.map((oldChar) => {
      if (oldChar.id === char.id) {
        const newChar = cloneChar(oldChar);
        newChar.isDead = !oldChar.isDead;
        return newChar;
      } else {
        return oldChar;
      }
    });

    updateGameState({
      ...gameState,
      allChars: newChars,
    });
  };

  const toggleActsWhileDead = (char: Character) => {
    const newChars = gameState.allChars.map((oldChar) => {
      if (oldChar.id === char.id) {
        const newChar = cloneChar(oldChar);
        newChar.actsWhileDead = !oldChar.actsWhileDead;
        return newChar;
      } else {
        return oldChar;
      }
    });

    updateGameState({
      ...gameState,
      allChars: newChars,
    });
  };

  const toggleIsDrunkOrPoisoned = (char: Character) => {
    const newChars = gameState.allChars.map((oldChar) => {
      if (oldChar.id === char.id) {
        const newChar = cloneChar(oldChar);
        newChar.isDrunkOrPoisoned = !oldChar.isDrunkOrPoisoned;
        return newChar;
      } else {
        return oldChar;
      }
    });

    updateGameState({
      ...gameState,
      allChars: newChars,
    });
  };

  return (
    <table className="char-table">
      <thead>
        <tr>
          <th>Player</th>
          <th>Character</th>
          <th>Alignment</th>
          <th>Life Status</th>
          <th>Drunk/Poisoned?</th>
          <th>Acts As</th>
          <th>Acts While Dead?</th>
        </tr>
      </thead>
      <tbody>
        {getAllCharsInPlay(gameState).map((char) => (
          <tr
            key={char.id}
            className={`char-table-row char-name ${char.alignment} ${char.isDead ? "is-dead" : ""}`}
          >
            <td>
              <PlayerNameInput
                gameState={gameState}
                updateGameState={updateGameState}
                char={char}
              />
            </td>
            <td>
              <CharacterSelect
                gameState={gameState}
                updateGameState={updateGameState}
                currentChar={char}
              ></CharacterSelect>
            </td>
            <td className="clickable" onClick={() => toggleAlignment(char)}>
              {char.alignment}
            </td>
            <td
              className="clickable"
              onClick={() => toggleDeadAliveState(char)}
            >
              {char.isDead ? "Dead" : "Alive"}
            </td>
            <td>
              <input
                type="checkbox"
                className="clickable"
                checked={char.isDrunkOrPoisoned}
                onChange={() => toggleIsDrunkOrPoisoned(char)}
              ></input>
            </td>
            <td>
              <CharActsAsSelect
                gameState={gameState}
                updateGameState={updateGameState}
                currentChar={char}
              ></CharActsAsSelect>
            </td>
            <td>
              <input
                type="checkbox"
                className="clickable"
                checked={char.actsWhileDead}
                onChange={() => toggleActsWhileDead(char)}
              ></input>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default CharacterMangement;
