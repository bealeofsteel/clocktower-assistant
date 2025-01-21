import "./CharacterManagement.css";
import { getAllCharsInPlay } from "../../charUtils";
import { Alignment, GameState } from "../../types";
import PlayerNameInput from "../PlayerNameInput/PlayerNameInput";
import { Character } from "../../characters";
import CharacterSelect from "../CharacterSelect/CharacterSelect";

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
        return Object.assign(oldChar, {
          alignment:
            char.alignment === Alignment.Good ? Alignment.Evil : Alignment.Good,
        });
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
        return Object.assign(oldChar, { isDead: !char.isDead });
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
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default CharacterMangement;
