import { useState } from "react";
import { Alignment, CharacterType, GameState } from "../../types";
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

    if (!gameState) {
        return null;
    }

    const charTypeFilterOptions = [
        {
            name: "All",
            checked: true
        },
        {
            name: "Townsfolk",
            charType: CharacterType.Townsfolk,
            checked: false
        },
        {
            name: "Outsiders",
            charType: CharacterType.Outsider,
            checked: false
        },
        {
            name: "Minions",
            charType: CharacterType.Minion,
            checked: false
        },
        {
            name: "Demons",
            charType: CharacterType.Demon,
            checked: false
        }
    ];

    const inPlayFilterOptions = [
        {
            name: "All",
            checked: true
        },
        {
            name: "In play",
            inPlay: true,
            checked: false
        },
        {
            name: "Not in play",
            inPlay: false,
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

    const [charTypeFilters, setCharTypeFilters] = useState(charTypeFilterOptions);
    const [inPlayFilters, setInPlayFilters] = useState(inPlayFilterOptions);
    const [alignmentFilters, setAlignmentFilters] = useState(alignmentFilterOptions);
    const [lifeStatusFilters, setLifeStatusFilters] = useState(lifeStatusFilterOptions);

    const [randomizedResult, setRandomizedResult] = useState<string>("");

    const randomizeSelectedChars = () => {

        let chars: Character[] = gameState.allChars;

        let allowedCharTypes: CharacterType[] = [];
        for (const filter of charTypeFilters) {
            if (filter.name === "All") {
                if (filter.checked) {
                    allowedCharTypes = [CharacterType.Townsfolk, CharacterType.Outsider, CharacterType.Minion, CharacterType.Demon];
                    break;
                }
            } else if (filter.checked) {
                allowedCharTypes.push(filter.charType as CharacterType);
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
                allowedInPlayStatuses.push(filter.inPlay as boolean);
            }
        }

        chars = chars.filter((char) => allowedInPlayStatuses.includes(char.inPlay));


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

    const handleCharTypeFilterChange = (index: number) => {
        const newFilters = Array.from(charTypeFilters);
        newFilters[index].checked = !charTypeFilters[index].checked;

        handleAllCheckbox(newFilters, index);

        setCharTypeFilters(newFilters);
    };

    const handleInPlayFilterChange = (index: number) => {
        const newFilters = Array.from(inPlayFilters);
        newFilters[index].checked = !inPlayFilters[index].checked;

        handleAllCheckbox(newFilters, index);

        setInPlayFilters(newFilters);
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
                        charTypeFilters.map((filter, index) => {
                            return (
                                <div className="filter-option" key={filter.name} onClick={() => handleCharTypeFilterChange(index)}>
                                    <input type="checkbox" checked={filter.checked} onChange={() => {}}/>
                                    <span>{filter.name}</span>
                                </div>
                            );
                        })
                    }
                </div>
                <div>
                    {
                        inPlayFilters.map((filter, index) => {
                            return (
                                <div className="filter-option" key={filter.name} onClick={() => handleInPlayFilterChange(index)}>
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
                                    <input type="checkbox" checked={filter.checked} onChange={() => {}}/>
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
                                    <input type="checkbox" checked={filter.checked} onChange={() => {}}/>
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