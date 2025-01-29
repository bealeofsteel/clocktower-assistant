import { Alignment, CharacterType, GameState } from "../../types";
import { Character } from "../../characters";
import { shuffleArray } from "../../randomUtils";
import "./RandomizationTools.css";

interface RandomizationToolsProps {
  gameState: GameState;
  updateGameState: (newState: GameState) => void;
}

interface Filter {
  checked: boolean;
}

function RandomizationTools({
  gameState,
  updateGameState,
}: RandomizationToolsProps) {
  if (!gameState) {
    return null;
  }

  const charTypeFilters = gameState.randomTools.filters.charType;
  const inPlayFilters = gameState.randomTools.filters.inPlay;
  const alignmentFilters = gameState.randomTools.filters.alignment;
  const lifeStatusFilters = gameState.randomTools.filters.lifeStatus;

  const randomizedResult = gameState.randomTools.randomizedResult;

  const randomizeSelectedChars = () => {
    let chars: Character[] = gameState.allChars;

    let allowedCharTypes: CharacterType[] = [];
    for (const filter of charTypeFilters) {
      if (filter.name === "All") {
        if (filter.checked) {
          allowedCharTypes = [
            CharacterType.Townsfolk,
            CharacterType.Outsider,
            CharacterType.Minion,
            CharacterType.Demon,
          ];
          break;
        }
      } else if (filter.checked) {
        allowedCharTypes.push(filter.value as CharacterType);
      }
    }

    chars = chars.filter((char) => allowedCharTypes.includes(char.type));

    let allowedInPlayStatuses: boolean[] = [];
    for (const filter of inPlayFilters) {
      if (filter.name === "All") {
        if (filter.checked) {
          allowedInPlayStatuses = [true, false];
          break;
        }
      } else if (filter.checked) {
        allowedInPlayStatuses.push(filter.value as boolean);
      }
    }

    chars = chars.filter((char) => allowedInPlayStatuses.includes(char.inPlay));

    let allowedAlignments: Alignment[] = [];
    for (const filter of alignmentFilters) {
      if (filter.name === "All") {
        if (filter.checked) {
          allowedAlignments = [Alignment.Good, Alignment.Evil];
          break;
        }
      } else if (filter.checked) {
        allowedAlignments.push(filter.value as Alignment);
      }
    }

    chars = chars.filter((char) => allowedAlignments.includes(char.alignment));

    let allowedLifeStatuses: boolean[] = [];
    for (const filter of lifeStatusFilters) {
      if (filter.name === "All") {
        if (filter.checked) {
          allowedLifeStatuses = [true, false];
          break;
        }
      } else if (filter.checked) {
        allowedLifeStatuses.push(filter.value as boolean);
      }
    }

    chars = chars.filter((char) => allowedLifeStatuses.includes(char.isDead));

    shuffleArray(chars);

    const charDisplayNames = chars.map((char) => char.getDisplayName());

    updateGameState({
      ...gameState,
      randomTools: {
        ...gameState.randomTools,
        randomizedResult: charDisplayNames.join("\n"),
      },
    });
  };

  const handleAllCheckbox = (newFilters: Filter[], index: number) => {
    if (newFilters[index].checked) {
      // If "All" is checked, uncheck all other checkboxes in the filter group
      if (index === 0) {
        for (let i = 1; i < newFilters.length; i++) {
          newFilters[i].checked = false;
        }
      } else {
        // If any other box is checked, uncheck "All"
        newFilters[0].checked = false;
      }
    }
  };

  const handleFilterChange = (
    index: number,
    filters: Filter[],
    fieldName: string,
  ) => {
    const newFilters = Array.from(filters);
    newFilters[index].checked = !filters[index].checked;

    handleAllCheckbox(newFilters, index);

    updateGameState({
      ...gameState,
      randomTools: {
        ...gameState.randomTools,
        filters: {
          ...gameState.randomTools.filters,
          [fieldName]: newFilters,
        },
      },
    });
  };

  return (
    <div className="randomization-tools">
      <div className="filters-container">
        <div>
          {charTypeFilters.map((filter, index) => {
            return (
              <div
                className="filter-option"
                key={filter.name}
                onClick={() =>
                  handleFilterChange(index, charTypeFilters, "charType")
                }
              >
                <input
                  type="checkbox"
                  checked={filter.checked}
                  onChange={() => {}}
                />
                <span>{filter.name}</span>
              </div>
            );
          })}
        </div>
        <div>
          {inPlayFilters.map((filter, index) => {
            return (
              <div
                className="filter-option"
                key={filter.name}
                onClick={() =>
                  handleFilterChange(index, inPlayFilters, "inPlay")
                }
              >
                <input
                  type="checkbox"
                  checked={filter.checked}
                  onChange={() => {}}
                />
                <span>{filter.name}</span>
              </div>
            );
          })}
        </div>
        <div>
          {alignmentFilters.map((filter, index) => {
            return (
              <div
                className="filter-option"
                key={filter.name}
                onClick={() =>
                  handleFilterChange(index, alignmentFilters, "alignment")
                }
              >
                <input
                  type="checkbox"
                  checked={filter.checked}
                  onChange={() => {}}
                />
                <span>{filter.name}</span>
              </div>
            );
          })}
        </div>
        <div>
          {lifeStatusFilters.map((filter, index) => {
            return (
              <div
                className="filter-option"
                key={filter.name}
                onClick={() =>
                  handleFilterChange(index, lifeStatusFilters, "lifeStatus")
                }
              >
                <input
                  type="checkbox"
                  checked={filter.checked}
                  onChange={() => {}}
                />
                <span>{filter.name}</span>
              </div>
            );
          })}
        </div>
      </div>

      <button
        className="get-random-characters"
        onClick={randomizeSelectedChars}
      >
        Get Random Characters
      </button>
      <div>
        <textarea
          className="random-results"
          value={randomizedResult}
          readOnly={true}
        ></textarea>
      </div>
    </div>
  );
}

export default RandomizationTools;
