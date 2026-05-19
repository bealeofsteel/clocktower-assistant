import "./CharacterManagement.css";
import {
  cloneChar,
  getAllCharsInPlay,
  getTokenInUseMap,
} from "../../charUtils";
import { Alignment, CharacterName, CharacterType } from "../../types";
import PlayerNameInput from "../PlayerNameInput/PlayerNameInput";
import { Character } from "../../characters";
import CharacterSelect from "../CharacterSelect/CharacterSelect";
import CharActsAsSelect from "../CharActsAsSelect/CharActsAsSelect";
import { useToggleDeadAliveState } from "../../hooks/useToggleDeadAliveState";
import { regenerateNightInstructions } from "../../nightUtils";
import { useGameState } from "../../context/GameStateContext";

const NUM_DEMON_BLUFFS = 3;

function CharacterMangement() {
  const { gameState, updateGameState } = useGameState();

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

  const toggleDeadAliveState = useToggleDeadAliveState();

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

  const setDemonBluff = (charName: CharacterName, index: number) => {
    const char = gameState.allChars.filter((char) => char.name === charName)[0];

    const newBluffs = [...gameState.demonBluffs];
    newBluffs[index] = char;

    const newGameState = {
      ...gameState,
      demonBluffs: newBluffs,
    };

    const newNightInstructions = regenerateNightInstructions(
      gameState,
      newGameState,
    );
    newGameState.nightInstructions = newNightInstructions;

    updateGameState(newGameState);
  };

  const tokenInUseMap = getTokenInUseMap(gameState);

  const getFilteredBluffOptions = (charType: CharacterType, i: number) => {
    return gameState.allChars.filter(
      (char) =>
        !char.inPlay &&
        char.type === charType &&
        (!tokenInUseMap[char.name] ||
          char.name === gameState.demonBluffs[i].name) &&
        !gameState.demonBluffs
          .filter((_char, index) => index !== i)
          .map((char) => char.name)
          .includes(char.name),
    );
  };

  return (
    <>
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
          {getAllCharsInPlay(gameState)?.map((char) => (
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
      <div>
        <h4>Demon Bluffs</h4>
        {[...Array(NUM_DEMON_BLUFFS)].map((_e, i) => (
          <div key={`bluffs_select_${i}`}>
            <select
              value={gameState.demonBluffs[i]?.name}
              onChange={(e) =>
                setDemonBluff(e.target.value as CharacterName, i)
              }
            >
              <optgroup label="Townsfolk">
                {getFilteredBluffOptions(CharacterType.Townsfolk, i).map(
                  (char) => (
                    <option key={`${char.name}_${i}`} value={char.name}>
                      {char.name}
                    </option>
                  ),
                )}
              </optgroup>
              <optgroup label="Outsiders">
                {getFilteredBluffOptions(CharacterType.Outsider, i).map(
                  (char) => (
                    <option key={`${char.name}_${i}`} value={char.name}>
                      {char.name}
                    </option>
                  ),
                )}
              </optgroup>
            </select>
          </div>
        ))}
      </div>
    </>
  );
}

export default CharacterMangement;
