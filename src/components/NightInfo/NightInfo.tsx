import { GameState, NightType } from "../../types";
import "./NightInfo.css";
import { getCharsById, parseCharTokens } from "../../charUtils";

interface NightInfoProps {
  gameState: GameState;
  type: NightType;
  updateGameState: (newState: GameState) => void;
}

function NightInfo({ gameState, type, updateGameState }: NightInfoProps) {
  const selectAll = () => {
    const newInstructions = gameState.nightInstructions[type].map(
      (instruction) => {
        return { ...instruction, checked: true };
      },
    );
    updateGameState({
      ...gameState,
      nightInstructions: {
        ...gameState.nightInstructions,
        [type]: newInstructions,
      },
    });
  };

  const unselectAll = () => {
    const newInstructions = gameState.nightInstructions[type].map(
      (instruction) => {
        return { ...instruction, checked: false };
      },
    );
    updateGameState({
      ...gameState,
      nightInstructions: {
        ...gameState.nightInstructions,
        [type]: newInstructions,
      },
    });
  };

  const handleCheckedChange = (index: number) => {
    const newInstructions = gameState.nightInstructions[type].map(
      (instruction, currentIndex) => {
        return currentIndex === index
          ? { ...instruction, checked: !instruction.checked }
          : instruction;
      },
    );

    updateGameState({
      ...gameState,
      nightInstructions: {
        ...gameState.nightInstructions,
        [type]: newInstructions,
      },
    });
  };

  if (
    !gameState ||
    !gameState.nightInstructions ||
    !gameState.nightInstructions[type]
  ) {
    return null;
  }

  const charsById = getCharsById(gameState);

  const infoField =
    type === NightType.First
      ? "startingInfoSuggestions"
      : "otherNightSuggestions";

  return (
    <>
      <h2>{type === NightType.First ? "First Night" : "Other Nights"}</h2>
      <button className="checkbox-select" onClick={() => selectAll()}>
        Select All
      </button>
      <button className="checkbox-select" onClick={() => unselectAll()}>
        Unselect All
      </button>
      <div className="instructions-container">
        {gameState.nightInstructions[type]?.map((instruction, index) => (
          <div
            key={instruction.key}
            className={`instruction ${charsById[instruction.charId as string]?.isDead && !charsById[instruction.charId as string]?.actsWhileDead ? "char-is-dead" : ""}`}
            onClick={() => handleCheckedChange(index)}
          >
            <input
              type="checkbox"
              className="clickable"
              checked={instruction.checked}
              onChange={() => {}}
            />
            <span
              className={`char-name ${charsById[instruction.charId as string]?.alignment}`}
            >
              <strong>
                {instruction.charId
                  ? charsById[instruction.charId].getDisplayName()
                  : instruction.label}{" "}
                {instruction.charId &&
                charsById[instruction.charId].isDrunkOrPoisoned
                  ? "🤢 "
                  : ""}
                |{" "}
              </strong>
            </span>
            <span
              dangerouslySetInnerHTML={{
                __html: parseCharTokens(instruction.message, charsById),
              }}
            ></span>
            {instruction.charId && gameState[infoField][instruction.charId] && (
              <>
                <strong> Suggestion: </strong>
                <span
                  dangerouslySetInnerHTML={{
                    __html: parseCharTokens(
                      gameState[infoField][instruction.charId] as string,
                      charsById,
                    ),
                  }}
                ></span>
              </>
            )}
          </div>
        ))}
      </div>
    </>
  );
}

export default NightInfo;
