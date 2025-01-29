import { Character } from "../../characters";
import { CharacterName, GameState } from "../../types";
import "./InfoGenerator.css";

interface InfoGeneratorProps {
  gameState: GameState;
  updateGameState: (gameState: GameState) => void;
}

function InfoGenerator({ gameState, updateGameState }: InfoGeneratorProps) {
  if (!gameState) {
    return null;
  }

  const whitelistedChars = [CharacterName.Dreamer, CharacterName.Savant];

  const getInfoForChar = (charName: CharacterName, char: Character) => {
    const info =
      char.name === charName
        ? char.generateInfo(gameState)
        : char.actsAsChar?.generateInfo(gameState);

    const infoMap = {
      ...gameState.generatedInfo,
    };

    if (!infoMap[charName]) {
      infoMap[charName] = {};
    }

    infoMap[charName][char.id] = info as string[];

    updateGameState({
      ...gameState,
      generatedInfo: infoMap,
    });
  };

  const updateStorytellerNotes = (notes: string) => {
    updateGameState({
      ...gameState,
      storytellerNotes: notes,
    });
  };

  return (
    <>
      <div className="info-intro">
        This page suggests info to tell characters who receive more complex info
        (i.e., not just a number) on an ongoing basis. So far the supported
        characters are the Dreamer and the Savant. If one or more of those
        characters are in play, you'll see buttons below for each character.
      </div>
      {whitelistedChars.map((charName) =>
        gameState.allChars
          .filter((char) => {
            return (
              char.inPlay &&
              ((char.actsAsChar && char.actsAsChar.name === charName) ||
                (!char.actsAsChar && char.name === charName))
            );
          })
          .map((char) => (
            <div className="info-container" key={char.id}>
              <button
                className="info-button"
                onClick={() => getInfoForChar(charName, char)}
              >
                {char.getDisplayName()}
              </button>
              {gameState?.generatedInfo?.[charName]?.[char.id]?.map(
                (info, index) => (
                  <div key={`${char.id}-info-${index}`}>{info}</div>
                ),
              )}
            </div>
          )),
      )}
      <div className="storyteller-notes-container">
        <h4>Storyteller Notes</h4>
        <textarea
          className="storyteller-notes"
          value={gameState?.storytellerNotes}
          onChange={(e) => updateStorytellerNotes(e.target.value)}
        ></textarea>
      </div>
    </>
  );
}

export default InfoGenerator;
