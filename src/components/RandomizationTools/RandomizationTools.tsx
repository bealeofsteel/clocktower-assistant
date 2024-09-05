import { useState } from "react";
import { Alignment, CharGroup, GameState } from "../../types";
import { Character } from "../../characters";
import { shuffleArray } from "../../randomUtils";

interface RandomizationToolsProps {
    gameState: GameState;
}

function RandomizationTools({gameState}: RandomizationToolsProps) {

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

        const allowedAlignments: Alignment[] = [];
        for (const filter of alignmentFilters) {
            if (filter.name === "All") {
                if (filter.checked) {
                    break;
                }
            } else if (filter.checked) {
                allowedAlignments.push(filter.alignment as Alignment);
            }
        }

        chars = chars.filter((char) => allowedAlignments.includes(char.alignment));

        const allowedLifeStatuses: boolean[] = [];
        for (const filter of lifeStatusFilters) {
            if (filter.name === "All") {
                if (filter.checked) {
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

    const handleCharGroupFilterChange = (index: number) => {
        const newFilters = charGroupFilters.map((filter, currentIndex) => {
            return currentIndex === index
              ? { ...filter, checked: !filter.checked }
              : filter
        });

        setCharGroupFilters(newFilters);
    };

    const handleAlignmentFilterChange = (index: number) => {
        const newFilters = alignmentFilters.map((filter, currentIndex) => {
            return currentIndex === index
              ? { ...filter, checked: !filter.checked }
              : filter
        });

        setAlignmentFilters(newFilters);
    };

    const handleLifeStausFilterChange = (index: number) => {
        const newFilters = lifeStatusFilters.map((filter, currentIndex) => {
            return currentIndex === index
              ? { ...filter, checked: !filter.checked }
              : filter
        });

        setLifeStatusFilters(newFilters);
    };

    return (
        <>
            {
                charGroupFilters.map((filter, index) => {
                    return (
                        <div key={filter.name}>
                            <input type="checkbox" checked={filter.checked} onChange={() => handleCharGroupFilterChange(index)}/>
                            <span>{filter.name}</span>
                        </div>
                    );
                })
            }
            {
                alignmentFilters.map((filter, index) => {
                    return (
                        <div key={filter.name}>
                            <input type="checkbox" checked={filter.checked} onChange={() => handleAlignmentFilterChange(index)}/>
                            <span>{filter.name}</span>
                        </div>
                    );
                })
            }
            {
                lifeStatusFilters.map((filter, index) => {
                    return (
                        <div key={filter.name}>
                            <input type="checkbox" checked={filter.checked} onChange={() => handleLifeStausFilterChange(index)}/>
                            <span>{filter.name}</span>
                        </div>
                    );
                })
            }

            <button onClick={randomizeSelectedChars}>Get Random Characters</button>
            <textarea value={randomizedResult} readOnly={true}></textarea>
        </>
    );
}

export default RandomizationTools;