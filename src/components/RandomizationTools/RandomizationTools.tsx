import { useState } from "react";
import { Alignment, CharGroup, GameState } from "../../types";
import { Character } from "../../characters";
import { shuffleArray } from "../../randomUtils";
import './RandomizationTools.css'

interface RandomizationToolsProps {
    gameState: GameState;
}

interface Filter {
    checked: boolean;
}

function RandomizationTools({gameState}: RandomizationToolsProps) {

    if (!gameState || !gameState.townsfolk) {
        return null;
    }

    const charGroupFilterOptions = [
        {
            name: "All",
            checked: true
        },
        {
            name: "Townsfolk",
            charGroup: CharGroup.Townsfolk,
            checked: false
        },
        {
            name: "Outsiders",
            charGroup: CharGroup.Outsiders,
            checked: false
        },
        {
            name: "Minions",
            charGroup: CharGroup.Minions,
            checked: false
        },
        {
            name: "Demons",
            charGroup: CharGroup.Demons,
            checked: false
        },
        {
            name: "Demon Bluffs",
            charGroup: CharGroup.DemonBluffs,
            checked: false
        },
        {
            name: "Not in play",
            charGroup: CharGroup.NotInPlay,
            checked: false
        }
    ];

    const alignmentFilterOptions = [
        {
            name: "All",
            checked: true
        },
        {
            name: "Good",
            alignment: Alignment.Good,
            checked: false
        },
        {
            name: "Evil",
            alignment: Alignment.Evil,
            checked: false
        }
    ];

    const lifeStatusFilterOptions = [
        {
            name: "All",
            checked: true
        },
        {
            name: "Alive",
            isDead: false,
            checked: false
        },
        {
            name: "Dead",
            isDead: true,
            checked: false
        }
    ];

    const [charGroupFilters, setCharGroupFilters] = useState(charGroupFilterOptions);
    const [alignmentFilters, setAlignmentFilters] = useState(alignmentFilterOptions);
    const [lifeStatusFilters, setLifeStatusFilters] = useState(lifeStatusFilterOptions);

    const [randomizedResult, setRandomizedResult] = useState<string>("");

    const randomizeSelectedChars = () => {

        let chars: Character[] = [];

        for (const filter of charGroupFilters) {
            if (filter.name === "All") {
                if (filter.checked) {
                    chars = chars.concat(gameState[CharGroup.Townsfolk], 
                        gameState[CharGroup.Outsiders], 
                        gameState[CharGroup.Minions], 
                        gameState[CharGroup.Demons], 
                        gameState[CharGroup.DemonBluffs], 
                        gameState[CharGroup.NotInPlay]
                    );
                    break;
                }
            } else if (filter.checked) {
                chars = chars.concat(gameState[filter.charGroup as CharGroup]);
            }
        }

        let allowedAlignments: Alignment[] = [];
        for (const filter of alignmentFilters) {
            if (filter.name === "All") {
                if (filter.checked) {
                    allowedAlignments = [Alignment.Good, Alignment.Evil]
                    break;
                }
            } else if (filter.checked) {
                allowedAlignments.push(filter.alignment as Alignment);
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
                allowedLifeStatuses.push(filter.isDead as boolean);
            }
        }

        chars = chars.filter((char) => allowedLifeStatuses.includes(char.isDead));

        shuffleArray(chars);

        const charDisplayNames = chars.map((char) => char.getDisplayName());

        setRandomizedResult(charDisplayNames.join("\n"));
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

    const handleCharGroupFilterChange = (index: number) => {
        const newFilters = Array.from(charGroupFilters);
        newFilters[index].checked = !charGroupFilters[index].checked;

        handleAllCheckbox(newFilters, index);

        setCharGroupFilters(newFilters);
    };

    const handleAlignmentFilterChange = (index: number) => {
        const newFilters = Array.from(alignmentFilters);
        newFilters[index].checked = !alignmentFilters[index].checked;

        handleAllCheckbox(newFilters, index);

        setAlignmentFilters(newFilters);
    };

    const handleLifeStatusFilterChange = (index: number) => {
        const newFilters = Array.from(lifeStatusFilters);
        newFilters[index].checked = !lifeStatusFilters[index].checked;

        handleAllCheckbox(newFilters, index);

        setLifeStatusFilters(newFilters);
    };

    return (
        <div className="randomization-tools">
            <div className="filters-container">
                <div>
                    {
                        charGroupFilters.map((filter, index) => {
                            return (
                                <div className="filter-option" key={filter.name} onClick={() => handleCharGroupFilterChange(index)}>
                                    <input type="checkbox" checked={filter.checked} onChange={() => {}}/>
                                    <span>{filter.name}</span>
                                </div>
                            );
                        })
                    }
                </div>
                <div>
                    {
                        alignmentFilters.map((filter, index) => {
                            return (
                                <div className="filter-option" key={filter.name} onClick={() => handleAlignmentFilterChange(index)}>
                                    <input type="checkbox" checked={filter.checked} onChange={() => handleAlignmentFilterChange(index)}/>
                                    <span>{filter.name}</span>
                                </div>
                            );
                        })
                    }
                </div>
                <div>
                    {
                        lifeStatusFilters.map((filter, index) => {
                            return (
                                <div className="filter-option" key={filter.name} onClick={() => handleLifeStatusFilterChange(index)}>
                                    <input type="checkbox" checked={filter.checked} onChange={() => handleLifeStatusFilterChange(index)}/>
                                    <span>{filter.name}</span>
                                </div>
                            );
                        })
                    }
                </div>
            </div>

            <button className="get-random-characters" onClick={randomizeSelectedChars}>Get Random Characters</button>
            <div>
                <textarea className="random-results" value={randomizedResult} readOnly={true}></textarea>
            </div>
        </div>
    );
}

export default RandomizationTools;